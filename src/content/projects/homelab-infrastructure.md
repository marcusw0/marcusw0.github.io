---
title: Homelab Infrastructure
description: Compose-managed lab platform for secure ingress, DNS, identity, persistent services, and operationally tested applications.
date: 2025-11-20
tags: ["homelab", "docker", "networking"]
tech: ["Docker", "Traefik", "Cloudflare", "Technitium DNS", "Authentik", "PostgreSQL", "Python"]
github: "https://github.com/SemperCode06/homelab-compose-examples"
featured: true
status: ongoing
role: Designer and operator
outcomes:
  - Isolated public ingress from private identity and database dependencies.
  - Added health-gated startup and persistent recovery boundaries for core services.
  - Established smoke and soak testing for a custom containerized application.
  - Published sanitized Compose templates with automated configuration and secret-leak checks.
---

## Overview

My homelab is built to be rebuildable: a platform for testing network patterns, service deployment, identity, DNS, certificate automation, and security controls. Each stack deploys independently and only joins the shared frontend network when it needs proxy access.

## Architecture

```d2
direction: down

internet: Internet { shape: cloud }
publicdns: Public DNS
traefik: Traefik 3.7
routed: File-provider routes
apps: Application services
recorder: Custom stream recorder
authentik: Authentik server
postgres: PostgreSQL 16 { shape: cylinder }
lan: LAN clients
technitium: Technitium DNS

internet -> publicdns
publicdns -> traefik
traefik -> routed
routed -> apps
routed -> recorder
routed -> authentik
authentik -> postgres
lan -> technitium
```

## Implemented Controls

- Traefik runs without a Docker socket and with `no-new-privileges`.
- PostgreSQL readiness gates Authentik server and worker startup.
- Secrets are required as deployment inputs rather than stored in Compose definitions.
- DNS recursion is limited to private networks and upstream forwarding uses HTTPS.
- The custom recorder runs non-root, exposes no direct host port, checks disk capacity, and reports health.

## Operational Validation

The recorder deployment exercises state changes, live capture, graceful shutdown, restart persistence, deliberately insufficient disk capacity, and a 24–48 hour soak period. Captures use MKV for failure tolerance and are remuxed to MP4 after a clean stop. This workflow has become my template for testing other lab services beyond "the container started."

The public Compose examples add repository-level validation. A shell script renders every stack with its example environment, then runs sanitization checks. GitHub Actions executes that validation on pushes and pull requests and runs Gitleaks against full repository history.

```bash
for compose in */compose.yml; do
  stack="${compose%/compose.yml}"
  docker compose --env-file "$stack/.env.example" -f "$compose" config --quiet
done

./scripts/check-sanitization.sh
```

The published templates use documentation-only addresses and domains, keep real environment files excluded, and require operators to review storage, exposure, and network assumptions before deployment.

## Lessons Learned

I get the most out of the lab when it behaves like production at a smaller scale — health-gated dependencies, explicit exposure, failure testing, and recovery boundaries matter even when the services are personal. Current priorities: consolidating duplicate DNS manifests, finishing proxy hardening, and defining backup restore tests.
