---
title: Homelab Overview
description: How I run services in my homelab, from DNS and authentication to deployments and recovery.
date: 2026-09-18
tags: ["architecture", "services", "operations"]
tech: ["Docker", "Traefik", "GitLab", "OpenBao", "Technitium DNS", "Authentik"]
section: "architecture"
order: 1
---

My homelab gives me a place to build and run services, try out tools, and work through the problems that come with keeping everything connected. I manage DNS, authentication, deployments, and secrets alongside the applications that depend on them. The [networking](/homelab/networking/) and [security](/homelab/security/) pages go into more detail about those parts of the lab.

## Architecture

```d2 title="Homelab architecture and primary service relationships"
direction: down

internet: Internet { shape: cloud }
publicdns: Public DNS
edge: Edge firewall
trusted: Trusted clients

lab: Homelab {
  dns: Internal DNS
  proxy: Reverse proxy
  identity: Identity provider
  apps: Application services
  data: Private state { shape: cylinder }
  gitlab: Source control and CI
  openbao: Secrets and workload identity

  dns -> proxy: Resolve private services
  proxy -> identity: Authentication check
  proxy -> apps: Routed requests
  identity -> data
  apps -> data
  gitlab -> apps: Reviewed deployments
  gitlab -> openbao: Short-lived job identity
}

internet -> publicdns
publicdns -> edge
edge -> lab.proxy: HTTPS
trusted -> lab.dns
trusted -> lab.proxy
```

## Design Principles

- I route web applications through Traefik so I can manage access and TLS in one place.
- I keep databases and other backend services on private networks, with access limited to the applications that need them.
- I account for DNS, certificates, authentication, and secrets when checking service health and planning recovery.
- I keep deployment configuration in Git so I can review changes and repeat a deployment when needed.

## Services

| Service | Purpose | Operating boundary |
| --- | --- | --- |
| Traefik | HTTPS ingress and explicit file-provider routing | Reaches application frontends but does not mount the Docker socket |
| Technitium DNS | Internal resolution, recursive DNS, and filtering | Serves trusted clients directly and persists configuration independently |
| Authentik and PostgreSQL | Application identity and protected state | Keeps the database private and exposes authentication through controlled routes |
| GitLab CE | Internal source control, CI, and protected deployment jobs | Runs on a dedicated virtual machine with OIDC login and local recovery access |
| OpenBao | Scoped secrets, workload identity, and SSH signing | Runs on a separate restricted virtual machine with independent recovery material |

I share examples of these configurations and their validation checks in my [Compose examples repository](https://github.com/marcusw0/homelab-compose-examples).

## Deployment and Recovery

I keep validation checks and rollback notes with each service's configuration. I use OpenTofu for infrastructure I can manage through an API, and Compose and YAML for services configured through files.

My recovery plan starts with the network and DNS, followed by Traefik and authentication, then application data. GitLab and OpenBao have separate bootstrap and recovery paths so I can restore them without depending on the services they manage. Testing OpenBao recovery is still on my [security backlog](/homelab/security/#hardening-backlog).
