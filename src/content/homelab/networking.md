---
title: Homelab Networking
description: DNS, reverse proxy, Cloudflare, Technitium, and Docker network patterns used to keep service routing predictable.
date: 2026-03-13
tags: ["networking", "dns", "reverse-proxy"]
tech: ["Traefik", "Cloudflare", "Technitium DNS", "Docker"]
section: "networking"
order: 2
---

## Routing Model

Traefik is the HTTP ingress point for routed services. Cloudflare manages public DNS and ACME DNS-01 validation for a private lab domain. Technitium DNS runs as the lab DNS service with TCP/UDP 53 published directly from the container host.

```d2
direction: right

client: Client
dns: Technitium DNS
cloudflare: Cloudflare public DNS
traefik: "Traefik :80/:443"
routes: File-provider routers
hostservices: Host application services
management: Management services
ldaps: "LDAPS :636 passthrough"

client -> dns
dns -> cloudflare
client -> traefik
traefik -> routes
routes -> hostservices
routes -> management
traefik -> ldaps
```

## Traefik

- Container: `traefik-prod`
- Image: `traefik:v3.7`
- Published ports: `80:80`, `443:443`
- Static config: `config/traefik.yml`
- Dynamic config: `config/dynamic/*.yml`
- Certificate storage: `data/certs/cloudflare-acme.json`
- Docker network: external `frontend`

HTTP traffic redirects permanently to HTTPS. The secure entry point uses the Cloudflare certificate resolver and requests a wildcard certificate for the lab domain.

## Routing Policy

| Service class | Routing policy |
| --- | --- |
| Management interfaces | Authenticated route; trusted clients only |
| User applications | HTTPS through the reverse proxy |
| Identity services | Private backend with controlled proxy access |
| Directory services | Encrypted passthrough; no public endpoint |

## Technitium DNS

Technitium publishes DNS on TCP/UDP 53 and exposes management on `5380` for HTTP and `53443` for HTTPS. Persistent data is split into named `config` and `logs` volumes.

## Operating Notes

- Service networks are explicit in each Compose file.
- Ports get published only for ingress, DNS, Authentik, or documented exceptions.
- The `frontend` Docker network stays external so routed stacks can join it without coupling their Compose files.
- DNS records are documented next to the service that owns them.
- File-provider routes must match actual backend ports — otherwise Traefik turns into stale inventory.
