# Temporary host for the one-time database load. No inbound ports, no SSH key: reached
# through SSM Session Manager. Remove with create_migration_host = false after sign-off.
data "aws_ssm_parameter" "al2023_arm" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64"
}

resource "aws_iam_role" "migration" {
  count = var.create_migration_host ? 1 : 0
  name  = "${local.name}-migration-host"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy_attachment" "migration_ssm" {
  count      = var.create_migration_host ? 1 : 0
  role       = aws_iam_role.migration[0].name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "migration" {
  count = var.create_migration_host ? 1 : 0
  role  = aws_iam_role.migration[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ReadFinalCopy"
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = "arn:aws:s3:::${var.liftproof_bucket}/inputs/learnsphere.db"
      },
      {
        Sid      = "DecryptFinalCopy"
        Effect   = "Allow"
        Action   = ["kms:Decrypt"]
        Resource = var.liftproof_kms_key_arn
      },
      {
        Sid      = "ReadDbMasterSecret"
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = aws_db_instance.main.master_user_secret[0].secret_arn
      },
    ]
  })
}

resource "aws_iam_instance_profile" "migration" {
  count = var.create_migration_host ? 1 : 0
  name  = "${local.name}-migration-host"
  role  = aws_iam_role.migration[0].name
}

resource "aws_instance" "migration" {
  count                       = var.create_migration_host ? 1 : 0
  ami                         = data.aws_ssm_parameter.al2023_arm.value
  instance_type               = "t4g.micro"
  subnet_id                   = aws_subnet.public[0].id
  associate_public_ip_address = true
  vpc_security_group_ids      = [aws_security_group.migration[0].id]
  iam_instance_profile        = aws_iam_instance_profile.migration[0].name
  metadata_options {
    http_tokens = "required"
  }
  root_block_device {
    encrypted   = true
    volume_size = 30
  }
  user_data = <<-EOF
    #!/bin/bash
    dnf install -y postgresql16 sqlite jq
  EOF
  tags      = { Name = "${local.name}-migration-host", Purpose = "one-time-db-load" }
  lifecycle { ignore_changes = [ami] }
}
