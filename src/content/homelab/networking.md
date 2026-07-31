---
title: Homelab Networking
description: The routing, DNS, ingress, and segmentation decisions that keep service access predictable.
date: 2026-07-30
tags: ["networking", "dns", "reverse-proxy"]
tech: ["Traefik", "Cloudflare", "Technitium DNS", "Docker"]
section: "networking"
order: 2
---

The network design has two deliberate entry paths. Trusted clients resolve private services through Technitium DNS, while routed HTTP traffic reaches applications through Traefik. Application and database networks remain private unless a documented protocol requires direct access.

## Request Flow

```d2 title="DNS, ingress, and private service flow"
direction: right

client: Trusted client
dns: Internal DNS
publicdns: Public DNS
proxy: Traefik ingress
identity: Identity provider
apps: Application frontends
state: Private state { shape: cylinder }

client -> dns: Resolve service
dns -> publicdns: Forward external query
client -> proxy: HTTPS
proxy -> identity: Authentication
proxy -> apps: Routed request
identity -> state
apps -> state
```

## Routing Policy

| Service class | Access policy |
| --- | --- |
| User applications | HTTPS through Traefik |
| Administrative interfaces | Authenticated route limited to trusted LAN or VPN sources |
| Identity and databases | Private backend networks with explicit application access |
| DNS | TCP and UDP directly from trusted networks |
| Directory services | Encrypted passthrough with no public endpoint |

Traefik redirects HTTP to HTTPS, obtains wildcard certificates through DNS-01 validation, and reads routes from watched configuration files. Technitium provides internal DNS, limits recursion to private networks, and forwards upstream requests over encrypted transport.

## Operating Rules

- Every Compose stack declares its networks and joins the shared frontend only when Traefik needs to reach it.
- Host ports are reserved for intentional ingress, DNS, identity requirements, or documented exceptions.
- Backend ports in route definitions must match the service that owns them. Stale proxy configuration is treated as an inventory error.
- DNS records live beside the service definition or reviewed infrastructure model that owns them.
- Routing changes are tested from both trusted and untrusted paths before they are considered complete.

See the [Homelab Overview](/homelab/architecture/) for service placement and [Homelab Security](/homelab/security/) for controls applied to these paths.
