# 1. Get the latest recommended Kubernetes version from DigitalOcean
data "digitalocean_kubernetes_versions" "latest" {}

data "digitalocean_project" "main_project" {
    name = "Bible"
}

resource "digitalocean_project_resources" "cluster_attachment" {
    project = data.digitalocean_project.main_project.id
    
    resources = [
        digitalocean_kubernetes_cluster.main.urn
    ]
}

# 2. Create a private Virtual Private Cloud (VPC) for security
resource "digitalocean_vpc" "main" {
    name     = "${var.cluster_name}-vpc"
    region   = var.region
    ip_range = "10.10.0.0/16"
}

# 3. Create the Kubernetes Cluster
resource "digitalocean_kubernetes_cluster" "main" {
    name     = var.cluster_name
    region   = var.region
    version  = data.digitalocean_kubernetes_versions.latest.latest_version
    vpc_uuid = digitalocean_vpc.main.id

    ha = var.enable_ha

    # 4. Define the Node Pool
    node_pool {
        name       = "worker-pool"
        size       = var.node_size # 2 vCPU, 4GB RAM
        node_count = var.node_count
    }

    timeouts {
        create = "1h" #for creation
    }
}

terraform {
  backend "s3" {
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    region                      = "us-east-1"
  }
}