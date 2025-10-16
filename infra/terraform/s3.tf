resource "random_id" "bucket_id" {
  byte_length = 4
}

resource "aws_s3_bucket" "cache" {
  bucket = "cinereads-cache-${random_id.bucket_id.hex}"
  acl    = "private"

  versioning {
    enabled = true
  }

  lifecycle_rule {
    enabled = true

    expiration {
      days = 30
    }
  }

  tags = {
    Name = "cinereads-cache"
  }
}
