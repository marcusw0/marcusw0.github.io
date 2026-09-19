---
title: Homelab Security
description: How I manage authentication, secrets, and service access, and the security work I am still finishing.
date: 2026-09-18
tags: ["security", "identity", "secrets"]
tech: ["OpenBao", "GitLab OIDC", "Traefik", "Authentik", "TLS", "Docker"]
section: "security"
order: 3
---

I want to know which services are reachable, who can access them, and what credentials they need. I use private networks, authentication, and scoped access to keep those connections limited. Some of that work is still in progress, especially moving services to OpenBao and tightening access to administrative interfaces.

## Control Summary

| Area | Current approach |
| --- | --- |
| Exposure | Traefik is the HTTP ingress point and direct host ports require a documented reason |
| Transport | HTTP redirects to HTTPS and certificates use DNS-01 validation |
| Administrative access | Authentik protects supported interfaces, with network restrictions planned or applied by route |
| Container boundaries | Applications run non-root where supported and private backends do not join the ingress network |
| Secrets | Environment files remain outside Git while services move toward scoped OpenBao access |
| Workload identity | Protected GitLab jobs exchange signed ID tokens for narrowly scoped, short-lived credentials |
| Recovery | Secret state, bootstrap material, and service data have separate backup responsibilities |

## Identity and Secrets

I use Authentik for application authentication and keep local recovery access for critical internal services. Its database stays on a private network. I am replacing automatically managed outposts with ones I deploy explicitly so they no longer need access to the Docker socket.

OpenBao runs on a separate virtual machine with restricted access. Infrastructure jobs can authenticate using GitLab ID tokens, and each service's role limits which secrets or signing operations a job can use. I am still moving services to those roles and configuring trust for short-lived SSH certificates. I keep existing credentials in place until I have tested their replacements.

## Hardening Backlog

The next steps are to:

- Restrict every administrative route to trusted LAN or VPN sources in addition to identity policy.
- Finish explicit Authentik outposts and remove unnecessary Docker-socket access.
- Apply and validate conservative security headers and TLS minimums across every route.
- Complete service-role and SSH-certificate cutovers before removing legacy credentials.
- Test OpenBao snapshots, recovery, state restoration, and credential revocation.
- Add structured access-log rotation, retention, and alerting for critical services.

See [Homelab Networking](/homelab/networking/) for the paths these controls protect and the [Homelab Overview](/homelab/architecture/) for recovery order.
