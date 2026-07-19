---
title: Homelab Architecture
description: Sanitized network and service architecture for a segmented, Docker-based homelab.
date: 2026-03-12
tags: ["architecture", "networking", "documentation"]
tech: ["Docker", "Traefik", "GitLab", "OpenTofu", "OpenBao", "Technitium DNS", "Authentik"]
section: "architecture"
order: 1
---

## System Overview

```d2 title="System overview: request and service flow"
direction: down

internet: Internet { shape: cloud }
dns: Public DNS
firewall: Edge firewall
trusted: Trusted clients
resolver: Internal DNS
host: Container host {
  proxy: Reverse proxy
  identity: Identity provider
  apps: Application services
  data: Private data services { shape: cylinder }

  proxy -> identity
  proxy -> apps
  identity -> data
  apps -> data
}

internet -> dns
internet -> firewall
firewall -> trusted
firewall -> host
trusted -> resolver
```

*High-level request and service flow. Addresses, public hostnames, and management endpoints are intentionally omitted.*

## Ingress and Identity

```d2 title="Ingress and identity flow"
direction: right

client: Client
proxy: Reverse proxy
identity: Identity provider
apps: Application services
data: Private data services { shape: cylinder }

client -> proxy: HTTPS
proxy -> identity: Authentication check
identity -> proxy: Authorized session
proxy -> apps
apps -> data
```

*The proxy is the application ingress point. Identity and data dependencies remain on private container networks.*

## Network Segmentation

```d2 title="Network segmentation and trust boundaries"
direction: down

firewall: Edge firewall
trusted: Trusted client network {
  dns: Internal DNS
}
hosts: Service-host network {
  proxy: Reverse proxy
  frontend: Frontend container network {
    apps: Application services
  }
  backend: Backend container network {
    state: Databases and persistent state { shape: cylinder }
  }

  proxy -> frontend
  frontend.apps -> backend
}

firewall -> trusted
firewall -> hosts
trusted -> hosts.proxy
```

*Trust boundaries reduce direct access to stateful services and keep management interfaces off the ingress path.*

## Design Goals

- Centralize HTTP/S ingress instead of publishing each application directly.
- Use DNS-01 validation for wildcard certificates without exposing an ACME HTTP endpoint.
- Treat internal DNS as an infrastructure dependency with independent health checks.
- Use a dedicated identity provider for supported applications.
- Keep credentials, addresses, hostnames, and environment-specific inventory outside public documentation.

## Deployment Control Plane

```d2 title="Deployment control plane"
direction: right

change: Merge request
ci: GitLab pipeline
plan: OpenTofu plan
jobidentity: OIDC job identity
openbao: OpenBao
credentials: Scoped token or SSH certificate
state: Project state { shape: cylinder }
deploy: Protected deployment
targets: Managed services {
  dns: DNS
  ingress: Ingress
  identity: Identity
  apps: Applications
}

change -> ci
ci -> plan
ci -> jobidentity
jobidentity -> openbao
openbao -> credentials
plan -> state
credentials -> deploy
deploy -> targets.dns
deploy -> targets.ingress
deploy -> targets.identity
deploy -> targets.apps
```

This control plane is being implemented incrementally. Repositories and validation paths are scaffolded, while the secrets VM, runners, production credential exchange, and service cutovers remain migration work.

## Operational Priorities

Availability checks cover ingress, DNS, certificate renewal, identity, secrets, and database health. Recovery documentation distinguishes runtime restoration order—network and DNS, ingress and identity, then applications—from the deployment-control dependencies required to rebuild the platform.
