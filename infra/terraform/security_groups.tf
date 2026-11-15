data "aws_ec2_managed_prefix_list" "cloudfront" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

resource "aws_security_group" "alb" {
  name        = "${local.name}-alb"
  description = "HTTPS from CloudFront only"
  vpc_id      = aws_vpc.main.id
  tags        = { Name = "${local.name}-alb" }
}

resource "aws_vpc_security_group_ingress_rule" "alb_from_cloudfront" {
  security_group_id = aws_security_group.alb.id
  prefix_list_id    = data.aws_ec2_managed_prefix_list.cloudfront.id
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
  description       = "CloudFront origin-facing"
}

resource "aws_vpc_security_group_egress_rule" "alb_to_api" {
  security_group_id            = aws_security_group.alb.id
  referenced_security_group_id = aws_security_group.api.id
  ip_protocol                  = "tcp"
  from_port                    = 8080
  to_port                      = 8080
}

resource "aws_security_group" "api" {
  name        = "${local.name}-api"
  description = "Edunova API task: 8080 from the ALB only"
  vpc_id      = aws_vpc.main.id
  tags        = { Name = "${local.name}-api" }
}

resource "aws_vpc_security_group_ingress_rule" "api_from_alb" {
  security_group_id            = aws_security_group.api.id
  referenced_security_group_id = aws_security_group.alb.id
  ip_protocol                  = "tcp"
  from_port                    = 8080
  to_port                      = 8080
}

# HTTPS out for ECR, Secrets Manager, CloudWatch Logs (no NAT; public IP).
resource "aws_vpc_security_group_egress_rule" "api_https" {
  security_group_id = aws_security_group.api.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_vpc_security_group_egress_rule" "api_to_db" {
  security_group_id            = aws_security_group.api.id
  referenced_security_group_id = aws_security_group.db.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
}

resource "aws_security_group" "db" {
  name        = "${local.name}-db"
  description = "PostgreSQL from the API, the migration host and Liftproof"
  vpc_id      = aws_vpc.main.id
  tags        = { Name = "${local.name}-db" }
}

resource "aws_vpc_security_group_ingress_rule" "db_from_api" {
  security_group_id            = aws_security_group.db.id
  referenced_security_group_id = aws_security_group.api.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  description                  = "Edunova API"
}

resource "aws_vpc_security_group_ingress_rule" "db_from_liftproof" {
  security_group_id = aws_security_group.db.id
  # Liftproof sits in the peered VPC; same-region peering allows security-group references.
  referenced_security_group_id = var.liftproof_sg_id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  description                  = "Liftproof validation (read-only login)"
  depends_on                   = [aws_vpc_peering_connection.liftproof]
}

resource "aws_vpc_security_group_ingress_rule" "db_from_migration" {
  count                        = var.create_migration_host ? 1 : 0
  security_group_id            = aws_security_group.db.id
  referenced_security_group_id = aws_security_group.migration[0].id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
  description                  = "Temporary migration host"
}

resource "aws_security_group" "migration" {
  count       = var.create_migration_host ? 1 : 0
  name        = "${local.name}-migration-host"
  description = "No inbound; reached through SSM Session Manager"
  vpc_id      = aws_vpc.main.id
  tags        = { Name = "${local.name}-migration-host" }
}

resource "aws_vpc_security_group_egress_rule" "migration_https" {
  count             = var.create_migration_host ? 1 : 0
  security_group_id = aws_security_group.migration[0].id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_vpc_security_group_egress_rule" "migration_http" {
  count             = var.create_migration_host ? 1 : 0
  security_group_id = aws_security_group.migration[0].id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
  description       = "dnf package mirrors"
}

resource "aws_vpc_security_group_egress_rule" "migration_to_db" {
  count                        = var.create_migration_host ? 1 : 0
  security_group_id            = aws_security_group.migration[0].id
  referenced_security_group_id = aws_security_group.db.id
  ip_protocol                  = "tcp"
  from_port                    = 5432
  to_port                      = 5432
}
