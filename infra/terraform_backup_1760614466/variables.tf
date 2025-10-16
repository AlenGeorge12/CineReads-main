variable "aws_region" { type = string, default = "ap-south-1" }
variable "ssh_key_name" { type = string }
variable "vpc_cidr" { type = string, default = "10.0.0.0/16" }
variable "cluster_name" { type = string, default = "cinereads-eks" }
variable "jenkins_instance_type" { type = string, default = "t3.small" }
variable "owner" { type = string, default = "cinereads-team" }
variable "public_ssh_cidr" { type = string, default = "0.0.0.0/0" }
