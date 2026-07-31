---
title: From Compose Folders to GitLab
description: Why I'm moving manually managed Docker services into separate GitLab repositories with reviewed changes and short-lived deployment access.
date: 2026-07-03
tags: ["gitlab", "opentofu", "openbao", "devsecops"]
tech: ["GitLab CI", "OpenTofu", "OpenBao", "Docker Compose", "Renovate", "Authentik", "Technitium DNS"]
draft: false
---

A directory full of Compose files can run a useful homelab for years. But can you roll back a bad change if you don't remember the old config? Could you rebuild the box without piecing manual steps together from memory? What happens if the project folders disappear? And are the secrets actually stored somewhere safe?

This is where platforms like GitHub and GitLab come in. I chose to host my own GitLab server because I'm already familiar with it in a professional setting, and self-hosting gives me the added benefit of running my own CI/CD runners. Getting an instance running was straightforward. Start an Ubuntu or Debian VM and follow the steps on GitLab's site.

Self-hosting a GitLab server may seem excessive for a homelab, but it makes changes, upgrades, and ongoing management much easier. You can attach Renovate to each Docker service repository, schedule it to check daily for new versions, and have it open a merge request with the relevant release notes. That's only one example, but it has been a genuinely useful addition.

The internal GitLab instance runs on a dedicated Ubuntu virtual machine. Traefik handles TLS, Authentik provides the normal OIDC login, SMTP delivers notifications, and local authentication remains available as a recovery path. The CI runner handles validation and protected manual jobs. Automated backups, restore testing, resource monitoring, and a documented upgrade process are still on the backlog.

## The Target Workflow

```d2
shape: sequence_diagram

engineer: Engineer
gitlab: GitLab
openbao: OpenBao
state: GitLab State
host: Deployment Host
api: Service API

engineer -> gitlab: Open merge request
gitlab -> gitlab: Validate Compose, YAML, and HCL
gitlab -> openbao: Exchange job OIDC token
openbao -> gitlab: Return scoped short-lived token { style.stroke-dash: 3 }
gitlab -> state: Read and lock project state
gitlab -> api: Generate reviewed OpenTofu plan
engineer -> gitlab: Approve protected production job
gitlab -> openbao: Request short-lived SSH certificate
openbao -> gitlab: Sign ephemeral public key { style.stroke-dash: 3 }
gitlab -> host: Deploy with temporary certificate
gitlab -> api: Apply reviewed infrastructure plan
```

Every active service gets a private project, a protected default branch, a validation pipeline, Renovate, deployment notes, and a rollback path. Services with useful APIs (mainly DNS and IDP) also get OpenTofu. Keeping the repos separate means Renovate can open a focused merge request for one service without kicking off a platform-wide deployment, and a rollback doesn't have to touch unrelated stacks.

State follows the same boundary. Each infrastructure project uses independent GitLab-managed state, and access to state and plan artifacts stays restricted because providers can serialize sensitive attributes. Frequently edited DNS and identity inventories remain in YAML while OpenTofu decodes and validates them.

Existing API resources are imported one dependency chain at a time. The declaration must produce a zero-change plan before I move forward. Otherwise, the code does not match the live object yet. Persistent services also need a backup and tested rollback path before migration.

## Avoiding Long-Lived Pipeline Credentials

Storing a protected variable in GitLab beats committing a secret, but it's still a durable credential—something that needs rotating and can be copied if a job is compromised. This is where OpenBao comes into play. I already have experience with Vault, so OpenBao seemed like the right choice after picking OpenTofu over Terraform. OpenBao is an identity-based secrets and encryption management system that allows services to authenticate themselves and retrieve the tokens or secrets they need. Compared with a traditional password manager, systems like these can issue short-lived, dynamic secrets for services such as databases or Kubernetes.

Each job presents a signed token to OpenBao. The role checks the issuer, audience, project path, protected reference, and environment before issuing a short-lived OpenBao token, and that token can only read the repository's production secret path or request a narrowly scoped action.

SSH follows the same idea. The runner creates an ephemeral keypair, sends just the public key to OpenBao, and gets back a certificate that lasts a few minutes. The CA and deployment role are now defined. Installing that trust on deployment hosts is still part of the cutover.

I've already run this pattern in production. For my server-update pipeline at work, I found that Vault can sign SSH certificates, stood up a Vault SSH CA, and had jobs SSH into servers with Vault-signed certificates instead of distributed keys — paired with a sudoers file that restricts the job account to exactly the commands it needs. OpenBao is the open-source fork of Vault, so the homelab version of this is familiar.

Of course, that makes OpenBao the crown jewel, so it needs protecting. It runs on its own VM with TLS and restricted network access, and its API resources are managed separately from the VM lifecycle. Snapshots, audit logs, and TLS state each have their own backup requirements.

## Bootstrap Is Part of the Architecture

OpenBao's initial deployment had a chicken-and-egg problem. It could not issue the credential used to bootstrap itself, and recovery could not depend on DNS or Traefik being available.

I kept those exceptions explicit. A fixed trust anchor is applied from a trusted operator session, the direct VM recovery path still verifies TLS without depending on the proxy, and recovery material stays outside Git.

Normal production plans use GitLab ID tokens. Bootstrap stays a separate, deliberate operation so a missing secret fails loudly instead of encouraging insecure fallback logic.

## Deployment Order

The order is driven by dependencies.

1. Move service secrets and downstream jobs onto the OpenBao roles that are now defined.
2. Validate the SSH CA path from GitLab runner to deployment host, then remove old static keys.
3. Migrate Traefik while preserving certificate state and validating every route.
4. Deploy Technitium, review the complete internal zone, and test DNS over TCP and UDP before changing clients.
5. Migrate Authentik and import existing objects one dependency chain at a time.
6. Move tunneling, VPN-isolated downloads, and application deployments into their repositories.

If this all works, the payoff is a pretty boring deployment. Renovate opens a focused merge request, validation runs, OpenTofu shows a plan I can understand, I approve production, the job authenticates without a stored credential, health checks pass, and the state records exactly what changed.

No more manually tracking which app is behind on updates or defaulting to the latest image tag and letting a patch break something.

The OpenBao foundation is now in place, but the migration isn't done. Downstream jobs still need to use the new service roles, secret values need to move, and the legacy credentials cannot disappear until the replacement path passes. Production jobs stay manual until I've exercised backups, health checks, and rollback — not just written them down.
