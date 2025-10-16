output "backend_ecr_repo_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "frontend_ecr_repo_url" {
  value = aws_ecr_repository.frontend.repository_url
}

output "s3_cache_bucket" {
  value = aws_s3_bucket.cache.bucket
}

output "jenkins_public_ip" {
  value = aws_instance.jenkins.public_ip
}
