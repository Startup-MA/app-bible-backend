terraform {
    required_providers {
        digitalocean = {
            source  = "digitalocean/digitalocean"
            version = "~> 2.0"
        }
    }
    
    # THIS TELLS TERRAFORM TO USE YOUR FREE HASHICORP ACCOUNT
    cloud {
        organization = "bible-app-org" # The exact org name you chose in Step 1

        workspaces {
            # This allows GitHub Actions to dynamically pick the workspace!
            tags = ["bible-app"] 
        }
    }

    backend "s3" {
        skip_credentials_validation = true
        skip_metadata_api_check     = true
        skip_region_validation      = true
        region                      = "us-east-1"
    }
}

provider "digitalocean" {
    token = var.do_token
}