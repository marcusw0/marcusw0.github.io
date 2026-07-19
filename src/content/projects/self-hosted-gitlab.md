---
title: Self-Hosted GitLab
description: Internal GitLab CE platform with centralized TLS, OIDC authentication, email notifications, and local recovery access.
date: 2026-07-03
tags: ["gitlab", "homelab", "identity"]
tech: ["GitLab CE", "Ubuntu Server", "VirtualBox", "Traefik", "Authentik", "OIDC", "SMTP"]
status: active
role: Designer and operator
outcomes:
  - Deployed an internal source-control platform on a dedicated virtual machine.
  - Integrated centralized TLS termination, OIDC authentication, and email notifications.
  - Retained local authentication as a recovery path if the identity provider is unavailable.
---

## Overview

I deployed GitLab CE 19.1 as an internal source-control platform using the Linux package on an Ubuntu Server 24.04 LTS virtual machine. The service is available only within the homelab and has no public instance link or externally published management endpoint.

The VirtualBox VM has four virtual CPU cores, 8 GB of memory, and a 100 GB virtual hard disk. This creates a defined resource boundary for GitLab and leaves room to evaluate capacity before adding CI workloads.

## Service Integration

```d2
direction: right

user: Internal user
traefik: Traefik
gitlab: GitLab CE 19.1
authentik: Authentik
smtp: SMTP relay

user -> traefik: HTTPS
traefik -> gitlab: TLS terminated
gitlab -> authentik: OIDC
gitlab -> smtp: Notifications
user -> gitlab: Recovery login { style.stroke-dash: 3 }
```

*Sanitized request and integration flow; internal addresses, hostnames, and credentials are intentionally omitted.*

Traefik provides reverse-proxy routing and TLS termination. GitLab delegates normal authentication to Authentik through OIDC, while local authentication remains available as a fallback recovery path. SMTP integration enables account and repository email notifications.

## Current Scope

The initial deployment establishes the GitLab application and its supporting ingress, identity, and notification integrations. GitLab Runners aren't deployed yet, so I'm not claiming self-hosted CI execution here — that comes with the deployment-platform work.

## Future Work

- Configure automated GitLab backups.
- Perform and document a restore test.
- Add service and virtual-machine resource monitoring.
- Establish a documented patching and GitLab upgrade procedure.
- Deploy and validate protected GitLab Runners.
- Store OpenTofu state independently in each infrastructure project.
- Exchange GitLab OIDC tokens for scoped OpenBao credentials during jobs.
- Replace bootstrap runner keys with short-lived SSH certificates.
