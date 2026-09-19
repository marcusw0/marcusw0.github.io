---
title: Homelab Networking
description: How I use DNS, Traefik, and private networks to connect services and control access.
date: 2026-09-18
tags: ["networking", "dns", "reverse-proxy"]
tech: ["Traefik", "Cloudflare", "Technitium DNS", "Docker"]
section: "networking"
order: 2
---

I use Technitium DNS to resolve private services and Traefik to route HTTP requests to applications. Databases and other backends stay on private networks. Services such as DNS need direct access, so I configure those ports separately.

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

Traefik redirects HTTP to HTTPS, obtains wildcard certificates through DNS-01 validation, and reads routes from watched configuration files. Technitium provides internal DNS, limits recursion to private networks, and forwards upstream requests over encrypted transport. The table describes my access policy; I am still applying network restrictions to every administrative route, as described on the [security page](/homelab/security/).

## Operating Rules

- I define networks in each Compose stack and connect services to the shared frontend only when Traefik needs to reach them.
- I publish host ports only when a service needs direct access, and document why it needs them.
- I check that proxy routes point to the ports the application actually uses and remove stale routes when services change.
- I keep DNS records with the service configuration or infrastructure definition that manages them.
- I test routing changes from both trusted and untrusted networks to check that the access rules work as intended.

See the [Homelab Overview](/homelab/architecture/) for service placement and [Homelab Security](/homelab/security/) for controls applied to these paths.
