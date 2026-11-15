# Created first, on its own (guide A2): terraform apply -target=aws_route53_zone.main
resource "aws_route53_zone" "main" {
  name    = var.domain
  comment = "Edunova public zone (moved from GoDaddy DNS)"
}

# CloudFront certificate (us-east-1): apex + www
resource "aws_acm_certificate" "site" {
  provider                  = aws.us_east_1
  domain_name               = var.domain
  subject_alternative_names = ["www.${var.domain}"]
  validation_method         = "DNS"
  lifecycle { create_before_destroy = true }
}

# ALB certificate (ap-south-1): origin.<domain>, used only between CloudFront and the ALB
resource "aws_acm_certificate" "origin" {
  domain_name       = "origin.${var.domain}"
  validation_method = "DNS"
  lifecycle { create_before_destroy = true }
}

locals {
  validation_records = merge(
    { for o in aws_acm_certificate.site.domain_validation_options : o.domain_name => o },
    { for o in aws_acm_certificate.origin.domain_validation_options : o.domain_name => o },
  )
}

resource "aws_route53_record" "cert_validation" {
  for_each        = local.validation_records
  zone_id         = aws_route53_zone.main.zone_id
  name            = each.value.resource_record_name
  type            = each.value.resource_record_type
  records         = [each.value.resource_record_value]
  ttl             = 300
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "site" {
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for o in aws_acm_certificate.site.domain_validation_options : aws_route53_record.cert_validation[o.domain_name].fqdn]
}

resource "aws_acm_certificate_validation" "origin" {
  certificate_arn         = aws_acm_certificate.origin.arn
  validation_record_fqdns = [for o in aws_acm_certificate.origin.domain_validation_options : aws_route53_record.cert_validation[o.domain_name].fqdn]
}

resource "aws_route53_record" "origin" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "origin.${var.domain}"
  type    = "A"
  alias {
    name                   = aws_lb.api.dns_name
    zone_id                = aws_lb.api.zone_id
    evaluate_target_health = true
  }
}

# ---- The cutover switch: live_on = "gcp" | "aws" -------------------------------------------
locals {
  on_aws = var.live_on == "aws"
}

resource "aws_route53_record" "apex_a" {
  zone_id         = aws_route53_zone.main.zone_id
  name            = var.domain
  type            = "A"
  allow_overwrite = true
  ttl             = local.on_aws ? null : 300
  records         = local.on_aws ? null : var.gcp_apex_ipv4
  dynamic "alias" {
    for_each = local.on_aws ? [1] : []
    content {
      name                   = aws_cloudfront_distribution.site.domain_name
      zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
      evaluate_target_health = false
    }
  }
}

resource "aws_route53_record" "apex_aaaa" {
  count           = local.on_aws || length(var.gcp_apex_ipv6) > 0 ? 1 : 0
  zone_id         = aws_route53_zone.main.zone_id
  name            = var.domain
  type            = "AAAA"
  allow_overwrite = true
  ttl             = local.on_aws ? null : 300
  records         = local.on_aws ? null : var.gcp_apex_ipv6
  dynamic "alias" {
    for_each = local.on_aws ? [1] : []
    content {
      name                   = aws_cloudfront_distribution.site.domain_name
      zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
      evaluate_target_health = false
    }
  }
}

# www: CNAME to Google before cutover; alias to CloudFront after.
resource "aws_route53_record" "www_gcp" {
  count           = local.on_aws ? 0 : 1
  zone_id         = aws_route53_zone.main.zone_id
  name            = "www.${var.domain}"
  type            = "CNAME"
  ttl             = 300
  records         = [var.gcp_www_cname]
  allow_overwrite = true
}

resource "aws_route53_record" "www_aws" {
  for_each        = local.on_aws ? toset(["A", "AAAA"]) : toset([])
  zone_id         = aws_route53_zone.main.zone_id
  name            = "www.${var.domain}"
  type            = each.value
  allow_overwrite = true
  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
  depends_on = [aws_route53_record.www_gcp]
}
