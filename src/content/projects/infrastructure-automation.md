---
title: Infrastructure Automation
description: OpenTofu, GitLab, and configuration-management patterns for reviewed infrastructure changes, isolated state, and rebuild-friendly operations.
date: 2026-01-18
tags: ["iac", "configuration", "operations"]
tech: ["OpenTofu", "GitLab CI", "OpenBao", "Ansible", "Linux", "Docker"]
featured: true
status: ongoing
role: Designer and implementer
outcomes:
  - Rebuild steps are captured as version-controlled infrastructure definitions.
  - Provisioning and host configuration have explicit ownership boundaries.
  - Documentation stays beside the automation it describes.
---

## Overview

This project is where I work out infrastructure-as-code patterns for repeatable provisioning and configuration. The problem I'm solving is configuration drift: manual commands and disconnected notes make recovery hard to test and impossible to repeat confidently.

Most of the reasoning here comes from professional experience rather than a lab incident. At work I deploy F5 load balancer configuration as AS3 through GitLab pipelines, manage other infrastructure with Terraform, and wrote a Python orchestrator that updates roughly 70 Linux servers in staged groups — three groups at a time, one server per group — with an update-check pipeline and health verification before and after each change. The lab is where I get to apply those patterns without a change board.

## Constraints

- The workflow must remain understandable without a hosted automation platform.
- Secrets and environment-specific values must stay outside version control.
- Provisioning, host configuration, and service deployment need clear ownership.
- A failed change must be diagnosable from the repository and tool output.

## Architecture

```d2
direction: right

git: Independent service repositories
pipeline: GitLab validation and plan
terraform: "OpenTofu: API resources"
ansible: "Ansible: configuration"
identity: OpenBao workload identity
state: Per-project GitLab state { shape: cylinder }
hosts: Provisioned hosts
services: Containerized services
checks: Health and availability checks

git -> pipeline
pipeline -> terraform
pipeline -> ansible
pipeline -> identity
terraform -> state
terraform -> hosts
ansible -> hosts
hosts -> services
services -> checks
```

*Automation flow and ownership boundaries. Credentials and environment-specific inventory are supplied outside the repository.*

## Implementation Notes

- OpenTofu owns API resources while GitLab stores state independently per repository.
- Ansible owns host configuration, packages, service files, and Docker Compose deployment.
- YAML remains the editing interface for frequently changed DNS and identity inventories; HCL decodes and validates it.
- OpenBao is the planned source for provider tokens and short-lived SSH certificates.
- Documentation lives beside modules so rebuild steps stay close to the implementation.
- Validation happens before changes are applied; post-deployment checks confirm service availability.

## Validation

Each change is reviewed as code, formatted, and validated before application. A rebuild is successful only when the target host converges without unexpected changes and service health checks pass. This keeps “configuration applied” separate from “service working.”

## Lessons Learned

The pattern that's paid off most — at work and in the lab — is staged rollouts with health gates: verify before, change a bounded set, verify after, and only then move on. Beyond that, keeping modules small with explicit inputs and conservative defaults makes the environment much easier to rebuild and audit. The current migration emphasizes import safety: existing resources move under state only after a zero-change plan. Next up is completing the workload-identity bootstrap and exercising restore paths before production cutover.
