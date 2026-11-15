# Return route from the Liftproof VPC to Edunova, added only to the route table that serves the
# Liftproof instance's subnet (its explicit table, or the VPC main table if it has none). Other
# tables in that VPC (for example a NAT gateway's own table) are left alone.
data "aws_instance" "liftproof" {
  instance_id = var.liftproof_instance_id
}

data "aws_route_tables" "liftproof_subnet" {
  vpc_id = var.liftproof_vpc_id
  filter {
    name   = "association.subnet-id"
    values = [data.aws_instance.liftproof.subnet_id]
  }
}

data "aws_route_tables" "liftproof_main" {
  vpc_id = var.liftproof_vpc_id
  filter {
    name   = "association.main"
    values = ["true"]
  }
}

locals {
  liftproof_route_table_ids = length(data.aws_route_tables.liftproof_subnet.ids) > 0 ? data.aws_route_tables.liftproof_subnet.ids : data.aws_route_tables.liftproof_main.ids
}

resource "aws_route" "from_liftproof" {
  for_each                  = toset(local.liftproof_route_table_ids)
  route_table_id            = each.value
  destination_cidr_block    = var.vpc_cidr
  vpc_peering_connection_id = aws_vpc_peering_connection.liftproof.id
}
