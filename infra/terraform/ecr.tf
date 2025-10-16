resource "aws_ecr_repository" "backend" {
  name                 = "cinereads-backend"
  image_tag_mutability = "MUTABLE"

  tags = {
    Name = "cinereads-backend"
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "cinereads-frontend"
  image_tag_mutability = "MUTABLE"

  tags = {
    Name = "cinereads-frontend"
  }
}
