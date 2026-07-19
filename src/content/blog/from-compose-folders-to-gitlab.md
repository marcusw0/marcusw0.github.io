---
title: From Compose Folders to GitLab
description: Designing a staged migration from manually managed Docker services to independent repositories, git version control, and short-lived deployment access.
date: 2026-07-03
tags: ["gitlab", "opentofu", "openbao", "devsecops"]
tech: ["GitLab CI", "OpenTofu", "OpenBao", "Docker Compose", "Renovate", "Authentik", "Technitium DNS"]
draft: false
---

A directory full of Compose files and secrets pasted everywhere can run a useful homelab for years. It might work, but ask yourself these questions: What happens if a change breaks something and you don't remember what the config was before? Could the box be rebuilt without reconstructing manual steps from memory? What if your project folders were deleted? Are your secrets stored in a safe, centralized place?

This isn't theory for me — it's how I work professionally. Daily at work I'm interacting with GitLab deploying configs through pipelines, managing some services with Terraform, and maintaining a Python repo I wrote that rolls updates across Linux servers in separate groups — three groups at a time, one server per group — with health verification before and after each update. I know how much sanity git and pipelines buy, so I'm migrating each of my homelab services into its own GitLab repository early in my homelab journey. This may seem overboard to some but maybe I'll win you over. The point is to end up with explicit boundaries — who owns the code, where the state lives, which identity can read which secret, and how future me recovers the service.

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

Every active service gets a private project, a protected default branch, a validation pipeline, Renovate, deployment docs, and a rollback path. Services with useful APIs — DNS and identity, mainly — also get OpenTofu. This keeps services separated, allows Renovate to create merge requests for review when a new version of x service is released, and allows for easy rollback.

## Why Not a Monorepo

A monorepo might make the initial setup easier, but it also combines unrelated state files, credentials, deployment permissions, and failure domains into one blast radius. With independent repositories, the DNS pipeline can read DNS credentials without being able to touch identity or database credentials. Renovate can update one service without triggering a platform-wide deployment. A failed plan locks one state file instead of blocking everything.

Each IaC repository uses its own GitLab-managed state named for the production environment — versioned, locked, and controlled through project membership. That doesn't make state harmless: providers can serialize sensitive attributes, and plan artifacts can leak values even when command output marks them sensitive. So state access and plan artifacts stay restricted too.

## YAML as the Operator Interface

The records I edit most often are easier to review in YAML than in repetitive HCL. The DNS repository keeps its authoritative record inventory in YAML, and OpenTofu decodes it, validates it, and turns each stable map key into a resource address.

Authentik follows the same pattern: YAML describes providers, applications, outposts, and the references between them - while HCL resolves existing flow slugs and validates that every application and outpost points to a declared provider.

One note here: once an application lives at an address like `authentik_application.this["dashboard"]`, changing the YAML key changes the state address. Display names and slugs can evolve freely, but inventory keys need to stay put unless a deliberate state move goes with the rename.

## Avoiding Long-Lived Pipeline Credentials

Storing a protected variable in GitLab beats committing a secret, but it's still a durable credential — something that needs rotating and can be copied if a job is compromised. The target design uses GitLab-issued OIDC identity instead.

Each job presents a signed token to OpenBao. The role checks the issuer, audience, project path, protected reference, and environment before issuing a short-lived OpenBao token, and that token can only read the repository's production secret path or request a narrowly scoped action.

SSH works the same way: the runner creates an ephemeral keypair, sends just the public key to OpenBao, and gets back a certificate that lasts a few minutes. Deployment hosts trust the OpenBao SSH certificate authority and won't accept unsigned public keys.

I've already run this pattern in production. For my server-update pipeline at work, I found that Vault can sign SSH certificates, stood up a Vault SSH CA, and had jobs SSH into servers with Vault-signed certificates instead of distributed keys — paired with a sudoers file that restricts the job account to exactly the commands it needs. OpenBao is the open-source fork of Vault, so the homelab version of this is familiar.

Of course, this makes OpenBao itself the crown jewels and needs protecting. It'll run in a dedicated virtual-machine boundary with encrypted transport, integrated storage, audit logging, restricted network access, separately held recovery shares, and off-host snapshots.

## Importing Existing Infrastructure Safely

Adopting OpenTofu doesn't mean recreating resources that already work. Authentik in particular is full of providers, applications, policies, flows, and outposts whose relationships have to survive the migration intact.

My rule for imports: declare one dependency chain, import the existing object by its API identifier, and require a zero-change plan. If the plan proposes an update or a replacement, the code doesn't match up yet, and nothing gets applied until it does. This is slower than a bulk import, but the alternative is an IaC migration that doubles as an accidental identity outage. Backups and a downloaded state version precede each import batch.

The outpost transition follows the same principle. The current automatic deployment method relies on Docker socket access (I know, this was a terrible thing to do); the replacement uses explicitly deployed outpost containers with tokens pulled from OpenBao. The existing LDAP provider and outpost get imported first, and socket access will go away after the manual outposts pass authentication tests.

## Bootstrap Is Part of the Architecture

There's a chicken-and-egg problem the final design can't escape: OpenBao can't issue the credential used for its own initial deployment, DNS may not resolve the secrets endpoint yet, and Traefik may depend on a secret that will eventually live in OpenBao.

Rather than pretend those exceptions don't exist, I'm designing them in: a documented temporary SSH credential, one-time initialization from a trusted workstation, recovery material distributed outside Git, and bootstrap access removed once workload identity and SSH signing actually work. Pipelines distinguish bootstrap mode from normal operation, so a missing secret fails loudly instead of encouraging insecure fallback logic.

## Deployment Order

The order is driven by dependencies:

1. Finalize the dedicated OpenBao VM, TLS, storage, recovery, and audit design.
2. Configure GitLab JWT roles, per-project policies, secret paths, and SSH signing.
3. Migrate Traefik while preserving certificate state and validating every route.
4. Deploy Technitium, review the complete internal zone, and test DNS over TCP and UDP before changing clients.
5. Migrate Authentik and import existing objects one dependency chain at a time.
6. Move tunneling, VPN-isolated downloads, and application deployments into their repositories.

If this all works, the end state is magical: Renovate opens a focused merge request, validation runs, OpenTofu shows a comprehensible plan, I approve production, the job authenticates without any stored credential, health checks pass, and the state records exactly what changed. No more manual tracking of what app is behind on updates or defaulting to 'app:latest' and allowing a patch to break an app.

None of it is fully deployed yet. The OpenBao VM work has to be finished first, and production jobs stay manual until I've actually exercised backups, health checks, and rollback — not just written down.
