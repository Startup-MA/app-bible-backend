# 1. Get the latest recommended Kubernetes version from DigitalOcean
data "digitalocean_kubernetes_versions" "latest" {}

# 2. Create a private Virtual Private Cloud (VPC) for security
resource "digitalocean_vpc" "stage_vpc" {
    name     = "${var.cluster_name}-vpc"
    region   = var.region
    ip_range = "10.10.0.0/16"
}

# 3. Create the Kubernetes Cluster
resource "digitalocean_kubernetes_cluster" "stage_cluster" {
    name     = var.cluster_name
    region   = var.region
    version  = data.digitalocean_kubernetes_versions.latest.latest_version
    vpc_uuid = digitalocean_vpc.stage_vpc.id

    # 4. Define the Node Pool
    node_pool {
        name       = "worker-pool"
        size       = var.node_size # 2 vCPU, 4GB RAM
        node_count = var.node_count
    }
}