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
