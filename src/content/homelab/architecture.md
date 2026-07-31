---
title: Homelab Overview
description: A concise, sanitized look at the architecture, core services, trust boundaries, and recovery priorities in my homelab.
date: 2026-07-30
tags: ["architecture", "services", "operations"]
tech: ["Docker", "Traefik", "GitLab", "OpenBao", "Technitium DNS", "Authentik"]
section: "architecture"
order: 1
---

I use the lab to practice operating complete systems across networking, identity, application delivery, secrets, and recovery. This page is the high-level map. The [networking](/homelab/networking/) and [security](/homelab/security/) pages cover the decisions inside their respective boundaries.

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

*Addresses, hostnames, credentials, and management endpoints are intentionally omitted.*

## Design Principles

- Publish applications through one controlled ingress path instead of exposing each service directly.
- Keep identity and persistent state on private networks with only the connections they require.
- Treat DNS, certificates, identity, and secrets as infrastructure dependencies with their own health and recovery checks.
- Make deployments reviewable and repeatable without hiding incomplete migrations or recovery work.

## Services

| Service | Purpose | Operating boundary |
| --- | --- | --- |
| Traefik | HTTPS ingress and explicit file-provider routing | Reaches application frontends but does not mount the Docker socket |
| Technitium DNS | Internal resolution, recursive DNS, and filtering | Serves trusted clients directly and persists configuration independently |
| Authentik and PostgreSQL | Application identity and protected state | Keeps the database private and exposes authentication through controlled routes |
| GitLab CE | Internal source control, CI, and protected deployment jobs | Runs on a dedicated virtual machine with OIDC login and local recovery access |
| OpenBao | Scoped secrets, workload identity, and SSH signing | Runs on a separate restricted virtual machine with independent recovery material |

The public [Homelab Compose Examples project](/projects/homelab-infrastructure/) demonstrates the sanitized deployment patterns and validation checks without publishing the live topology.

## Deployment and Recovery

Service repositories use validation, reviewed changes, and explicit rollback notes. API-backed infrastructure uses OpenTofu where it provides a stable ownership model. File-based services remain in reviewed Compose and YAML. The staged move from manual folders to GitLab and short-lived credentials is documented in [From Compose Folders to GitLab](/blog/from-compose-folders-to-gitlab/).

Recovery follows dependency order. Network and DNS come first, followed by ingress and identity, then application state. GitLab and OpenBao have separate bootstrap and recovery paths so restoring the control plane does not depend on the services it manages.
