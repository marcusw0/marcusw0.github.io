---
title: GitLab Deployment Platform
description: In-progress migration from manually managed Docker stacks to reviewed GitLab pipelines, OpenTofu state, short-lived credentials, and independently owned service repositories.
date: 2026-07-03
tags: ["gitops", "iac", "security"]
tech: ["GitLab CE", "OpenTofu", "OpenBao", "Docker Compose", "Renovate", "Traefik", "Authentik", "Technitium DNS"]
featured: true
status: ongoing
role: Designer and implementer
outcomes:
  - Defined independent repository and state boundaries for infrastructure services.
  - Designed workload identity and short-lived SSH access for deployment jobs.
  - Established an import-first migration strategy for existing identity resources.
---

## Objective

I'm converting my manually maintained Docker deployments into a controlled delivery platform. Each active service gets an independent GitLab repository, validation pipeline, Renovate policy, deployment boundary, and rollback documentation. Services with stable APIs use OpenTofu; file-oriented services keep reviewed YAML — I'm not forcing every configuration into Terraform.

## Target Architecture

```d2
direction: down

engineer: Reviewed merge request
gitlab: Self-hosted GitLab
validate: Compose and configuration validation
plan: OpenTofu plan
oidc: Short-lived job identity
secrets: OpenBao
jobtoken: Scoped job token
sshcert: Short-lived SSH certificate
state: Per-project GitLab state { shape: cylinder }
apis: DNS and identity APIs
hosts: Deployment hosts
services: Independent Compose stacks

engineer -> gitlab
gitlab -> validate
gitlab -> plan
gitlab -> oidc
oidc -> secrets
secrets -> jobtoken
secrets -> sshcert
plan -> state
jobtoken -> apis
sshcert -> hosts
hosts -> services
```

The design separates code, state, and secrets. GitLab stores versioned state per repository. OpenBao validates GitLab identity claims and returns narrowly scoped credentials. Deployment hosts trust an SSH certificate authority instead of long-lived runner keys.

## Security Decisions

- Bind workload identity to the exact project, protected branch, audience, and environment.
- Keep provider credentials in process environment variables instead of ordinary Terraform inputs.
- Protect plan artifacts because plans and state can contain sensitive resource attributes.
- Require manual production deployment and apply jobs.
- Run the secrets service in a dedicated virtual-machine security boundary with encrypted transport and off-host snapshots.
- Replace direct Docker socket access with explicitly deployed Authentik outposts.
- Pin container versions and digests, then review Renovate merge requests.

## Current Progress

Repository scaffolds now exist for secrets management, ingress, DNS, identity, tunneling, VPN-isolated downloads, and application deployment. Technitium has a YAML-backed DNS model. Authentik has YAML relationships for providers, applications, and outposts plus a staged import workflow. GitLab HTTP backends and OpenBao workload-identity patterns are defined for the IaC repositories.

These definitions are not all deployed. The next dependency is adapting the OpenBao scaffold for its dedicated VM and end-to-end TLS. Work then proceeds through workload identity, short-lived SSH, ingress migration, DNS deployment, and zero-diff Authentik imports.

## Import and Recovery Discipline

Existing identity objects are imported one dependency chain at a time. Code must match the live object before import, and a zero-change plan is the acceptance criterion. Persistent services require backups and tested rollback paths before migration. It's slower than a bulk import, but it means adopting IaC can't quietly reconfigure live identity infrastructure along the way.

