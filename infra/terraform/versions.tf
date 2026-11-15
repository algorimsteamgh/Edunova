terraform {
  required_version = ">= 1.10.0"
  required_providers {
    aws    = { source = "hashicorp/aws", version = "~> 6.0" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }
  # State bucket is created once by hand (guide step B1). use_lockfile needs Terraform 1.10+.
  backend "s3" {
    key          = "edunova/prod/terraform.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
    # bucket is passed at init: terraform init -backend-config="bucket=edunova-tfstate-<account-id>"
  }
}

locals {
  tags = merge(
    {
      Application = "Edunova"
      Environment = "production"
      ManagedBy   = "Terraform"
      Owner       = "Algorims"
      CostCenter  = "SMAC-Edunova"
    },
    var.map_migrated == "" ? {} : { "map-migrated" = var.map_migrated }
  )
  name = "edunova"
}

provider "aws" {
  region              = var.region
  allowed_account_ids = [var.account_id]
  default_tags { tags = local.tags }
}

# CloudFront certificates and the CloudFront WAF must live in us-east-1.
provider "aws" {
  alias               = "us_east_1"
  region              = "us-east-1"
  allowed_account_ids = [var.account_id]
  default_tags { tags = local.tags }
}
