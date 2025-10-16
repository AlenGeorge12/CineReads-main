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
