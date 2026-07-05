variable "do_token" {
    type        = string
    description = "DigitalOcean Personal Access Token"
    sensitive   = true
}

variable "region" {
    type        = string
    description = "DigitalOcean Region slug"
    default     = "fra1" # Frankfurt - Change this to nyc1, lon1, etc., based on your location
}

variable "cluster_name" {
    type        = string
    description = "Name of the Kubernetes cluster"
}

variable "node_size" {
  type    = string
  default = "s-2vcpu-4gb" # A safe default, but we will override it for Prod
}

variable "node_count" {
  type    = number
  default = 3
}