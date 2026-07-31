---
title: Homelab Security
description: The exposure, identity, secrets, and container controls I use—and the hardening work that remains.
date: 2026-07-30
tags: ["security", "identity", "secrets"]
tech: ["OpenBao", "GitLab OIDC", "Traefik", "Authentik", "TLS", "Docker"]
section: "security"
order: 3
---

The baseline is simple. Services should not become reachable by accident, privileged interfaces stay restricted, and sensitive dependencies remain private. I document unfinished controls alongside implemented ones so the site does not imply a stronger security posture than the lab currently has.

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

Authentik provides application authentication while local recovery paths remain available for critical internal services. Its database stays on a private network, and the replacement outpost design removes automatic Docker-socket management in favor of explicitly deployed outposts.

OpenBao runs in a separate restricted virtual-machine boundary. Production infrastructure plans can authenticate with GitLab ID tokens, and per-service roles define which secret path or signing action a job may use. Downstream cutovers and short-lived SSH trust are still in progress. Existing credentials remain until their replacements pass validation.

The design and deployment sequence are covered in [From Compose Folders to GitLab](/blog/from-compose-folders-to-gitlab/) instead of being repeated here.

## Hardening Backlog

- Restrict every administrative route to trusted LAN or VPN sources in addition to identity policy.
- Finish explicit Authentik outposts and remove unnecessary Docker-socket access.
- Apply and validate conservative security headers and TLS minimums across every route.
- Complete service-role and SSH-certificate cutovers before removing legacy credentials.
- Test OpenBao snapshots, recovery, state restoration, and credential revocation.
- Add structured access-log rotation, retention, and alerting for critical services.

See [Homelab Networking](/homelab/networking/) for the paths these controls protect and the [Homelab Overview](/homelab/architecture/) for recovery order.
