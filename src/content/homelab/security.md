---
title: Homelab Security
description: Security baseline for TLS, secrets management, segmentation, service exposure, and administrative access.
date: 2026-03-14
tags: ["security", "tls", "secrets"]
tech: ["OpenBao", "GitLab OIDC", "OpenTofu", "Traefik", "Authentik", "TLS", "Docker"]
section: "security"
order: 3
---

## Security Baseline

The baseline is simple: nothing gets exposed by accident, everything gets TLS, and privileged interfaces stay restricted. The lab is set up so the secure default is also the easy path.

## Controls

- Route HTTP services through Traefik with TLS on `websecure`.
- Redirect all HTTP requests on `web` to HTTPS.
- Use Cloudflare DNS-01 validation for wildcard certificates instead of exposing HTTP challenge paths.
- Protect administrative routes with Authentik middleware and network restrictions.
- Keep Cloudflare tokens, Authentik secret keys, database passwords, and SMTP credentials in environment files or a secrets manager.
- Require documented justification before publishing a direct host port outside Traefik, DNS, or identity-provider requirements.
- Review any container with Docker socket access as privileged infrastructure.
- Run application containers as non-root users where supported and set `no-new-privileges` on ingress infrastructure.
- Expose application ports only to the shared proxy network; publish host ports only for deliberate ingress or DNS requirements.

## Secrets and Workload Identity

The current deployments use excluded environment files while the replacement workflow is being built. The target design uses GitLab-issued OIDC identity to authenticate each job to OpenBao. Policies bind access to the repository, protected branch, audience, and environment. Jobs receive short-lived provider tokens or SSH certificates instead of retaining deployment keys in GitLab.

OpenBao is planned for a dedicated VM with integrated storage, manual recovery shares, audit logging, encrypted transport, restricted network access, and off-host snapshots. This is intentionally a separate security boundary rather than another general-purpose container.

## Identity Provider

The live Authentik deployment currently uses automatic outpost management through the Docker socket. The replacement Compose design removes that access and deploys outposts explicitly. Existing providers, applications, and outposts will be imported into per-project GitLab state only after their OpenTofu declarations produce a zero-change plan.

The stream recorder runs under configurable non-root UID/GID values, uses a CSRF secret, and supports secure cookies behind HTTPS. Its application port is exposed only within Docker networking. The reverse proxy is responsible for public TLS and authentication.

## Certificate Handling

Traefik stores ACME material in a restricted data volume. Certificate ownership and renewal responsibility stay documented so failures are easy to troubleshoot without publishing domain details.

## Hardening Backlog

- Mount Traefik dynamic configuration read-only after the update workflow no longer requires write access.
- Enable structured access logs with explicit rotation and retention.
- Apply conservative security headers and TLS 1.2 minimums, then validate every routed application.
- Restrict administrative routes to trusted LAN or VPN sources in addition to identity-provider policy.
- Remove or proxy direct management ports that do not require host publication.
- Reduce or eliminate the Authentik worker's Docker socket access if integration requirements allow it.
- Complete the OpenBao VM, GitLab JWT roles, and short-lived SSH trust rollout.
- Restrict GitLab state and plan artifacts because sensitive attributes can remain present even when values are marked sensitive.
- Test secrets snapshots, unseal recovery, state recovery, and credential revocation before removing bootstrap access.
