#!/bin/bash
# Edunova: load the frozen SQLite copy into RDS PostgreSQL (one transaction).
# Run on the migration host as ec2-user:  bash load-rds.sh
set -euo pipefail

: "${DB_SECRET_ARN:?export DB_SECRET_ARN (terraform output rds_master_secret_arn)}"
: "${PGHOST:?export PGHOST (terraform output rds_endpoint)}"
export PGDATABASE="${PGDATABASE:-learnsphere}" PGPORT="${PGPORT:-5432}"
export AWS_REGION=ap-south-1 AWS_DEFAULT_REGION=ap-south-1
SRC="${SRC:-s3://lp-smac-817137373248-ap-south-1/inputs/learnsphere.db}"
WORK="$HOME/load-$(date -u +%Y%m%dT%H%M%SZ)"
TABLES="users courses lessons enrollments lesson_progress audit_logs schema_migrations"
mkdir -p "$WORK" && cd "$WORK"

echo "== 1. Fetch the frozen copy (the file the Part 3 baseline was taken from)"
if [ -n "${LOCAL_DB:-}" ]; then cp "$LOCAL_DB" learnsphere.db; else aws s3 cp "$SRC" learnsphere.db --only-show-errors; fi
sha256sum learnsphere.db | tee source.sha256
sqlite3 learnsphere.db "PRAGMA integrity_check;" | tee source-integrity.txt
grep -qx ok source-integrity.txt

echo "== 2. Database login and TLS"
if [ -z "${PGPASSWORD:-}" ]; then
  S=$(aws secretsmanager get-secret-value --secret-id "$DB_SECRET_ARN" --query SecretString --output text)
  export PGUSER=$(echo "$S" | jq -r .username) PGPASSWORD=$(echo "$S" | jq -r .password)
fi
if [ -z "${PGSSLMODE:-}" ]; then
  curl -sSfo rds-ca.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
  export PGSSLMODE=verify-full PGSSLROOTCERT="$WORK/rds-ca.pem"
fi
psql -XAtc "select 'connected to ' || current_database() || ' as ' || current_user || ', ' || version();"

echo "== 3. The schema must already exist (created by the API's first start, guide C4)"
for t in $TABLES; do
  [ "$(psql -XAtc "select to_regclass('public.$t') is not null")" = t ] || { echo "Missing table public.$t; stop."; exit 1; }
done

echo "== 4. Export each table from SQLite"
for t in $TABLES; do
  cols=$(sqlite3 learnsphere.db "select group_concat(name, ',') from pragma_table_info('$t');")
  echo "$cols" > "$t.cols"
  sqlite3 -csv -nullvalue '\N' learnsphere.db "select $cols from $t;" > "$t.csv"
  echo "  $t: $(sqlite3 learnsphere.db "select count(*) from $t;") rows"
done

echo "== 5. Load in one transaction (all or nothing)"
{
  echo '\set ON_ERROR_STOP on'
  echo 'BEGIN;'
  echo "TRUNCATE $(echo $TABLES | tr ' ' ',') CASCADE;"
  for t in $TABLES; do
    echo "\\copy $t ($(cat $t.cols)) FROM '$WORK/$t.csv' WITH (FORMAT csv, NULL '\\N')"
  done
  echo 'COMMIT;'
  echo 'ANALYZE;'
} > load.sql
psql -X -v ON_ERROR_STOP=1 -f load.sql | tee load.log

echo "== 6. Compare row counts"
fail=0
printf '%-18s %8s %8s\n' table sqlite rds | tee counts.txt
for t in $TABLES; do
  a=$(sqlite3 learnsphere.db "select count(*) from $t;"); b=$(psql -XAtc "select count(*) from $t;")
  printf '%-18s %8s %8s\n' "$t" "$a" "$b" | tee -a counts.txt
  [ "$a" = "$b" ] || fail=1
done
[ $fail = 0 ] && echo "ALL COUNTS MATCH" | tee -a counts.txt || { echo "COUNT MISMATCH" | tee -a counts.txt; exit 1; }
echo "Evidence files are in $WORK"
