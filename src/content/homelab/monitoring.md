---
title: Homelab Monitoring
description: Monitoring approach for Traefik routes, DNS health, certificate renewal, container health, logs, and alert conditions.
date: 2026-03-16
tags: ["monitoring", "logs", "alerts"]
tech: ["Traefik", "Technitium DNS", "Docker", "Alerting"]
section: "monitoring"
order: 5
---

## Monitoring Targets

Monitoring here has to answer four questions: are routed services reachable, does DNS resolve, are certificates renewing, and is identity infrastructure healthy?

```d2
direction: down

routes: Traefik routed hostnames
availability: HTTP availability checks
dns: "Technitium DNS :53"
dnschecks: DNS query checks
certs: ACME certificate storage
certchecks: Certificate expiration checks
auth: Authentik + PostgreSQL
health: Container health checks
docker: Docker logs
logreview: Operational log review
recorder: Recorder health + storage
capturechecks: Health and capacity checks
alerts: Alert rules

routes -> availability
dns -> dnschecks
certs -> certchecks
auth -> health
docker -> logreview
recorder -> capturechecks
availability -> alerts
dnschecks -> alerts
certchecks -> alerts
health -> alerts
capturechecks -> alerts
```

## Alert Priorities

- Reverse proxy, identity provider, or other routed services unavailable.
- DNS failures on TCP/UDP 53.
- Wildcard certificate expiration or failed ACME renewal.
- Authentik PostgreSQL healthcheck failure.
- Disk pressure on hosts with persistent volumes.
- Backup job failures for DNS config, Traefik certs/config, Authentik data, and PostgreSQL data.
- Recorder health staleness, low free space, repeated upstream cooldowns, or failed MKV-to-MP4 finalization.

## Near-Term Checks

- HTTP status checks for each Traefik file-provider route.
- DNS query check against Technitium for internal and public records.
- Certificate age and renewal checks for the lab wildcard certificate.
- Container restart count review for Traefik, Technitium, Authentik server, Authentik worker, and PostgreSQL.
- Recorder `/health` checks, recording-volume capacity, retained MKV review, and SQLite backup verification.

## Deployment Validation

The recorder has the most complete validation workflow in the current workspace: container health, UI state persistence, live capture, graceful shutdown, media playback, forced low-space failure, restart recovery, and a 24–48 hour soak test. The plan is to hold DNS, ingress, and identity changes to the same standard: validate the configuration, exercise the user path, force one safe failure, restart, and confirm persistent state survived.
