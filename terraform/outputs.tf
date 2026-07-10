output "cluster_id" {
    description = "The ID of the Kubernetes cluster"
    value       = digitalocean_kubernetes_cluster.stage_cluster.id
}

output "cluster_endpoint" {
    description = "The URL of the Kubernetes API server"
    value       = digitalocean_kubernetes_cluster.stage_cluster.endpoint
}