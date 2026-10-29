#!/bin/sh
set -e

# Without a bucket (docker-compose, local) the database lives on the mounted volume as before.
if [ -z "$LITESTREAM_BUCKET" ]; then
  exec node src/server.js
fi

# Restore the latest replica before the app opens the file, then run the app under continuous replication.
litestream restore -if-db-not-exists -if-replica-exists -config /app/litestream.yml "$DATABASE_PATH"
exec litestream replicate -config /app/litestream.yml -exec "node src/server.js"
