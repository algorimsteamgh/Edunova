variable "account_id" {
  description = "SMAC Tech AWS account that hosts Edunova"
  type        = string
}
variable "region" {
  type    = string
  default = "ap-south-1"
}
variable "domain" {
  type    = string
  default = "edunovatechnologies.com"
}
variable "vpc_cidr" {
  description = "Edunova VPC range. Must not overlap the existing workload or Liftproof (10.40.0.0/16)."
  type        = string
  default     = "10.50.0.0/16"
}
variable "liftproof_vpc_id" {
  type    = string
  default = "vpc-0d538b792e7b1606c"
}
variable "liftproof_vpc_cidr" {
  type    = string
  default = "10.40.0.0/16"
}
variable "liftproof_sg_id" {
  description = "Security group of Liftproof instance i-08427d0169bd1be15 (runbook 5.1)"
  type        = string
}
variable "map_migrated" {
  description = "MAP tag value (migXXXXXXXXXX) from the MAP agreement. Leave empty if there is none."
  type        = string
  default     = ""
}
variable "image_tag" {
  description = "Backend image tag in ECR (the git commit SHA)"
  type        = string
  default     = "bootstrap"
}
variable "api_desired_count" {
  description = "0 until the database is loaded, then 1"
  type        = number
  default     = 0
}
variable "admin_email" {
  description = "Same ADMIN_EMAIL as the Cloud Run backend"
  type        = string
}
variable "alert_email" {
  description = "Where alarms and budget alerts go"
  type        = string
}
variable "monthly_budget_usd" {
  type    = number
  default = 80
}
variable "live_on" {
  description = "Where edunovatechnologies.com points: gcp (before cutover, and for rollback) or aws"
  type        = string
  default     = "gcp"
  validation {
    condition     = contains(["gcp", "aws"], var.live_on)
    error_message = "live_on must be gcp or aws."
  }
}
variable "gcp_apex_ipv4" {
  description = "The apex A records currently at GoDaddy (Cloud Run domain mapping)"
  type        = list(string)
}
variable "gcp_apex_ipv6" {
  description = "The apex AAAA records currently at GoDaddy (empty list if none)"
  type        = list(string)
  default     = []
}
variable "gcp_www_cname" {
  type    = string
  default = "ghs.googlehosted.com."
}
variable "create_migration_host" {
  description = "Temporary SSM-only host used to load RDS. Set false after sign-off."
  type        = bool
  default     = true
}
variable "liftproof_bucket" {
  type    = string
  default = "lp-smac-817137373248-ap-south-1"
}
variable "liftproof_kms_key_arn" {
  type    = string
  default = "arn:aws:kms:ap-south-1:817137373248:key/25e3cbc0-2ff0-484f-90c6-d9eb2bdee1d2"
}
variable "github_repo" {
  type    = string
  default = "algorimsteamgh/edunova"
}
variable "create_github_oidc_provider" {
  description = "false if the account already has token.actions.githubusercontent.com"
  type        = bool
  default     = false
}
variable "liftproof_instance_id" {
  description = "Liftproof EC2 instance; its subnet's route table gets the return route to Edunova"
  type        = string
  default     = "i-08427d0169bd1be15"
}
