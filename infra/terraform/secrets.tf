# Secret shells only. Values are copied from Google Secret Manager with the CLI (guide B5),
# so they never sit in Terraform state.
resource "aws_secretsmanager_secret" "jwt" {
  name                    = "edunova/jwt-secret"
  description             = "JWT_SECRET for the Edunova API (copied from GCP learnsphere-jwt-secret)"
  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret" "admin_password" {
  name                    = "edunova/admin-password"
  description             = "ADMIN_PASSWORD for the Edunova API (copied from GCP learnsphere-admin-password)"
  recovery_window_in_days = 7
}

# Shared secret CloudFront sends to the ALB, so the ALB serves only CloudFront traffic.
resource "random_password" "origin_verify" {
  length  = 40
  special = false
}
