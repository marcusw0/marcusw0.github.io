---
title: Homelab Compose Examples
description: Sanitized Docker Compose templates with automated configuration validation, secret-leak checks, and documented security boundaries.
date: 2025-11-20
tags: ["docker", "automation", "security"]
tech: ["Docker Compose", "GitHub Actions", "Shell", "Gitleaks", "Traefik", "Authentik", "Technitium DNS"]
github: "https://github.com/marcusw0/homelab-compose-examples"
featured: true
status: ongoing
role: Developer and maintainer
outcomes:
  - Published reusable Compose examples without exposing live addresses, domains, or credentials.
  - Added automated rendering and sanitization checks for every included stack.
  - Added full-history secret scanning to the repository validation workflow.
  - Documented exposure, persistence, and network settings that require review before deployment.
---

## Objective

I wanted to publish useful examples from my homelab without turning the repository into a copy of the live environment. The result is a set of sanitized Compose templates that demonstrate service boundaries, health-gated startup, persistent storage, and explicit ingress while keeping private topology and credentials out of the repository.

## What the Repository Contains

The examples cover representative ingress, DNS, identity, database, and application patterns. Each stack uses placeholder addresses and domains, requires secrets as deployment inputs, and documents the settings that must be reviewed before someone adapts it.

The templates emphasize a few repeatable boundaries.

- Application interfaces join the shared proxy network only when Traefik needs to route to them.
- Databases and other stateful dependencies stay on private backend networks.
- Readiness checks gate dependent services instead of relying on container start order.
- Containers run without unnecessary privileges or direct host exposure.
- Persistent configuration, application state, and large data have separate recovery responsibilities.

## Repository Validation

A shell script renders every Compose file with its example environment and then runs repository-specific sanitization checks.

```bash
for compose in */compose.yml; do
  stack="${compose%/compose.yml}"
  docker compose --env-file "$stack/.env.example" -f "$compose" config --quiet
done

./scripts/check-sanitization.sh
```

GitHub Actions runs those checks on pushes and pull requests. Gitleaks also scans the complete repository history, which catches more than checking only the current working tree.

## Testing Approach

I treat successful configuration rendering as the first check, not the finish line. Application changes also need service health, restart persistence, failure-path testing, and enough runtime to expose delayed problems.

## What This Demonstrates

The project is less about publishing one exact homelab and more about making infrastructure examples safe to share and straightforward to review. It demonstrates how I structure Compose services, encode security boundaries, automate validation, and distinguish a container that started from a service that is actually ready.

The live architecture and operating decisions remain in the separate [Homelab documentation](/homelab/).
