---
title: Homelab Services
description: Sanitized inventory of the homelab's ingress, DNS, identity, source-control, database, and recording services.
date: 2026-07-03
tags: ["services", "docker", "operations"]
tech: ["Docker", "GitLab CE", "OpenTofu", "OpenBao", "Traefik", "Technitium DNS", "Authentik", "PostgreSQL", "Python"]
section: "services"
order: 4
---

## Managed Stacks

| Stack | Components | Operational model |
| --- | --- | --- |
| Traefik | Reverse proxy and file-provider routes | Publishes HTTP/S, redirects to TLS, and joins the shared frontend network |
| Technitium DNS | Recursive DNS, filtering, logs, and management UI | Publishes DNS directly and stores configuration and logs in named volumes |
| Authentik | Server, worker, PostgreSQL, optional certificate job | Waits for database health before application startup; only the server joins the frontend network |
| GitLab CE | Package-managed source control on a dedicated Ubuntu VM | Uses Traefik TLS termination, Authentik OIDC, SMTP notifications, and local recovery authentication |
| Stream recorder | Python web service, SQLite state, Streamlink, and FFmpeg | Runs as a non-root user, exposes its UI only to the proxy network, and persists state and recordings separately |

## Migration Projects

| Project | Intended ownership | Progress |
| --- | --- | --- |
| OpenBao | Job identity, KV secrets, SSH certificate authority, future database credentials | Repository scaffolded; dedicated-VM and TLS changes remain |
| Technitium IaC | Internal zone and records loaded from reviewed YAML | Compose, GitLab state, and provider model scaffolded |
| Authentik IaC | Providers, applications, outposts, and later policy bindings | YAML model and import workflow scaffolded; live inventory not imported |
| Traefik | Static and dynamic file-provider configuration | Repository scaffolded; route validation and cutover remain |
| Cloudflare Tunnel | Tunnel runtime, with tunnel and DNS APIs considered for OpenTofu | Repository scaffolded |
| VPN download stack | qBittorrent sharing Gluetun's network namespace | Repository scaffolded; egress and leak testing remain |

Traefik also maintains routes for services managed outside this Compose workspace, including container administration, photo management, media playback, and media automation. Those routes are documented as external dependencies; their deployment files live elsewhere.

## Ingress

Traefik 3.7 uses a static configuration plus watched dynamic files. It publishes ports 80 and 443, performs permanent HTTPS redirection, obtains wildcard certificates through DNS-01 validation, and runs with `no-new-privileges`. It does not mount the Docker socket; routes are declared explicitly through the file provider.

## DNS

Technitium permits recursion only for private networks, enables domain blocking, forwards upstream requests over HTTPS, and persists configuration and logs. DNS uses TCP and UDP port 53 because clients reach it directly rather than through HTTP ingress.

The replacement repository consolidates the previous Technitium variants and models records in YAML decoded by OpenTofu. Deployment and client cutover remain pending; the complete internal authoritative zone must be reviewed first.

## Identity

Authentik uses separate server and worker processes backed by PostgreSQL 16. PostgreSQL has an explicit readiness check, and both application processes wait for it to become healthy. Secrets are required through environment variables instead of being embedded in Compose files.

## Source Control

GitLab CE 19.1 runs from the Linux package on a dedicated Ubuntu Server 24.04 LTS VirtualBox VM with four virtual CPU cores, 8 GB of memory, and a 100 GB virtual hard disk. The instance is internal only. Traefik terminates TLS, Authentik provides OIDC authentication, and SMTP supports email notifications. Local GitLab authentication remains enabled as a recovery path.

GitLab Runners, automated backups, restore validation, monitoring, and a documented patching and upgrade procedure remain future work. The planned runners use GitLab OIDC with OpenBao and short-lived SSH certificates rather than persistent deployment keys.

## Stream Recording

The custom recorder monitors configured accounts and captures live streams through Streamlink and FFmpeg. It writes MKV during capture for crash tolerance, then remuxes clean recordings to MP4 without re-encoding. The service includes request pacing, global cooldowns after repeated upstream failures, per-user retry backoff, minimum-free-space enforcement, and a container health endpoint.

State lives in SQLite separately from recordings. The deployment procedure includes functional smoke tests, restart verification, deliberate low-disk testing, and a 24–48 hour soak test.

## Recovery Priorities

Restore network and DNS first, then ingress and identity, followed by application state. Back up DNS configuration, proxy configuration and certificate state, the Authentik database and data directories, and recorder database state. Large recordings require a separate retention and capacity strategy.
