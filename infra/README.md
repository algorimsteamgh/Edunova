# Edunova AWS infrastructure

Terraform for Edunova in SMAC Tech's AWS account (817137373248, ap-south-1). Everything lives in its own VPC
(10.50.0.0/16, peered to the Liftproof VPC for port 5432) and every resource is tagged `Application=Edunova`.

- `terraform/` builds the VPC, RDS PostgreSQL 16, ECR, ECS Fargate API behind an ALB, S3 + CloudFront with WAF,
  Route 53 (with the `live_on = gcp | aws` cutover switch), Secrets Manager shells, alarms, budget and the
  GitHub Actions deploy role.
- `scripts/load-rds.sh` is the one-time SQLite to PostgreSQL data load, run from the SSM-only migration host.

State is in S3 (`edunova-tfstate-817137373248`, key `edunova/prod/terraform.tfstate`, lockfile locking), so it can
be run from anywhere with the right credentials. The step-by-step order is in the Edunova Workload Migration Guide.

## Running it (AWS CloudShell)

```
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # fill in admin_email and alert_email; never commit tfvars
export TF_DATA_DIR=/tmp/edunova-tf             # CloudShell home is only 1 GB
terraform init -backend-config="bucket=edunova-tfstate-817137373248"
terraform plan -out=edunova.plan
terraform apply edunova.plan
```

App secrets (`edunova/jwt-secret`, `edunova/admin-password`) are created empty and filled with
`aws secretsmanager put-secret-value`, so their values never reach Terraform state.
