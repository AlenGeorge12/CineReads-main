#!/usr/bin/env bash
set -euo pipefail

# Path assumptions
ROOT_DIR="${HOME}/CineReads-main"
TF_DIR="${ROOT_DIR}/infra/terraform"

# Edit this before running
SSH_KEY_NAME="cinereads-key"   # <<< REPLACE this with the EC2 keypair name you created in AWS
AWS_REGION="ap-south-1"

if [ "$SSH_KEY_NAME" = "cinereads-key" ]; then
  echo "ERROR: You must edit this script and set SSH_KEY_NAME to your EC2 keypair name."
  echo "Open the script and replace cinereads-key with the name of your keypair in AWS."
  exit 1
fi

mkdir -p "$TF_DIR"
cd "$TF_DIR"

### Write Terraform files ###
cat > providers.tf <<'TF'
terraform {
  required_version = ">= 1.4"
  required_providers {
    aws = { source = "hashicorp/aws", version = ">= 4.0" }
    random = { source = "hashicorp/random", version = ">= 3.0" }
  }
}

provider "aws" {
  region = var.aws_region
}
TF

cat > variables.tf <<'TF'
variable "aws_region" { type = string, default = "ap-south-1" }
variable "ssh_key_name" { type = string }
variable "vpc_cidr" { type = string, default = "10.0.0.0/16" }
variable "cluster_name" { type = string, default = "cinereads-eks" }
variable "jenkins_instance_type" { type = string, default = "t3.small" }
variable "owner" { type = string, default = "cinereads-team" }
variable "public_ssh_cidr" { type = string, default = "0.0.0.0/0" }
TF

cat > vpc.tf <<'TF'
data "aws_availability_zones" "available" {}

resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  tags = { Name = "${var.owner}-vpc" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags = { Name = "${var.owner}-igw" }
}

resource "aws_subnet" "public" {
  count = 2
  vpc_id = aws_vpc.main.id
  cidr_block = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "${var.owner}-public-${count.index}" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route { cidr_block = "0.0.0.0/0" gateway_id = aws_internet_gateway.igw.id }
}

resource "aws_route_table_association" "pub_assn" {
  count = length(aws_subnet.public)
  subnet_id = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
TF

cat > ecr.tf <<'TF'
resource "aws_ecr_repository" "backend" {
  name                 = "cinereads-backend"
  image_tag_mutability = "MUTABLE"
  tags = { Name = "cinereads-backend" }
}
TF

cat > s3.tf <<'TF'
resource "random_id" "bucket_id" { byte_length = 4 }

resource "aws_s3_bucket" "cache" {
  bucket = "cinereads-cache-${random_id.bucket_id.hex}"
  acl    = "private"
  versioning { enabled = true }
  lifecycle_rule {
    enabled = true
    expiration { days = 30 }
  }
  tags = { Name = "cinereads-cache" }
}
TF

cat > iam.tf <<'TF'
data "aws_iam_policy_document" "ec2_assume" {
  statement { actions = ["sts:AssumeRole"] principals { type = "Service" identifiers = ["ec2.amazonaws.com"] } }
}

resource "aws_iam_role" "eks_node_role" {
  name = "cinereads-eks-node-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_role_policy_attachment" "eks_cw" {
  role       = aws_iam_role.eks_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_role" "jenkins_role" {
  name = "cinereads-jenkins-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_instance_profile" "jenkins_profile" {
  name = "cinereads-jenkins-profile"
  role = aws_iam_role.jenkins_role.name
}

resource "aws_iam_role_policy" "jenkins_policy" {
  name = "cinereads-jenkins-policy"
  role = aws_iam_role.jenkins_role.id
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      { Effect = "Allow", Action = ["ecr:GetAuthorizationToken"], Resource = "*" },
      { Effect = "Allow", Action = ["ecr:BatchCheckLayerAvailability","ecr:PutImage","ecr:InitiateLayerUpload","ecr:UploadLayerPart","ecr:CompleteLayerUpload"], Resource = aws_ecr_repository.backend.arn },
      { Effect = "Allow", Action = ["s3:PutObject","s3:GetObject","s3:ListBucket"], Resource = [aws_s3_bucket.cache.arn, "${aws_s3_bucket.cache.arn}/*"] },
      { Effect = "Allow", Action = ["secretsmanager:GetSecretValue","secretsmanager:DescribeSecret"], Resource = "*" }
    ]
  })
}
TF

cat > eks.tf <<'TF'
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = ">= 19.0.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.27"
  subnets         = aws_subnet.public[*].id
  vpc_id          = aws_vpc.main.id

  node_groups = {
    default = {
      desired_capacity = 2
      max_capacity     = 3
      min_capacity     = 1
      instance_types   = ["t3.medium"]
      iam_role_arn     = aws_iam_role.eks_node_role.arn
    }
  }

  tags = { Owner = var.owner }
}
TF

cat > jenkins_ec2.tf <<'TF'
data "aws_ami" "ubuntu" {
  most_recent = true
  owners = ["099720109477"] # Canonical Ubuntu
  filter { name = "name" values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"] }
}

resource "aws_security_group" "jenkins_sg" {
  name = "cinereads-jenkins-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = [var.public_ssh_cidr]
  }
  ingress {
    from_port = 8080
    to_port = 8080
    protocol = "tcp"
    cidr_blocks = [var.public_ssh_cidr]
  }
  egress { from_port = 0 to_port = 0 protocol = "-1" cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_instance" "jenkins" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.jenkins_instance_type
  subnet_id     = aws_subnet.public[0].id
  key_name      = var.ssh_key_name
  iam_instance_profile = aws_iam_instance_profile.jenkins_profile.name

  tags = { Name = "cinereads-jenkins" }

  vpc_security_group_ids = [aws_security_group.jenkins_sg.id]
}
TF

cat > cloudwatch.tf <<'TF'
resource "aws_sns_topic" "alerts" { name = "cinereads-alerts" }

resource "aws_cloudwatch_metric_alarm" "high_5xx" {
  alarm_name          = "cinereads-5xx-spike"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
TF

cat > outputs.tf <<'TF'
output "ecr_repo_url" { value = aws_ecr_repository.backend.repository_url }
output "s3_cache_bucket" { value = aws_s3_bucket.cache.bucket }
output "jenkins_public_ip" { value = aws_instance.jenkins.public_ip }
output "eks_cluster_name" { value = module.eks.cluster_id }
TF

# Write local secrets file (overwrites)
cat > secrets.auto.tfvars <<TFV
ssh_key_name = "${SSH_KEY_NAME}"
aws_region = "${AWS_REGION}"
TFV

echo "Terraform files written to ${TF_DIR}"
ls -1 "${TF_DIR}"

# Initialize and run terraform
echo "Running terraform init"
terraform init -input=false

echo "Validating configuration"
terraform validate

echo "Planning (output -> tfplan)"
terraform plan -out=tfplan -input=false

echo "Ready to apply. To inspect the plan run: terraform show -json tfplan | less"
read -p "Apply Terraform now? (type 'yes' to proceed) " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborting apply. You can run 'terraform apply tfplan' manually after review."
  exit 0
fi

terraform apply "tfplan"
echo "Terraform apply complete. Run 'terraform output' to see outputs."
