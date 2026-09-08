---
title: homelabctl
description: A Go CLI for service health checks and runbooks, with bounded concurrency, configurable checks, and an interactive Markdown viewer.
date: 2026-09-07
tech: ["Go", "Concurrency", "TOML", "Bubble Tea"]
github: "https://github.com/marcusw0/homelabctl"
featured: true
order: 1
focus: Developer tooling
status: active
role: Developer and maintainer
outcomes:
  - Built HTTP, TCP, TLS, and DNS checks behind a shared service-check interface.
  - Added a bounded worker pool with cancellation for checking multiple services.
  - Connected TOML service inventories to configurable checks and interactive runbooks.
---

## The Problem

Checking a service often means switching between commands, configuration files, and troubleshooting notes. I am building homelabctl to bring those tasks into one terminal workflow, with results that help explain where a failure occurs.

## How It Works

Services live in a TOML inventory. Each service can select its checks, expected HTTP status, redirect behavior, timeout, and certificate warning window. The check layer returns protocol-specific results; the CLI handles presentation and exit codes.

A worker pool limits how many services run at once. Context cancellation flows through the runner and checks, allowing work to stop when the caller cancels. Separating the runner from the concrete checks also makes concurrency behavior testable.

Runbooks sit alongside the service configuration. A Bubble Tea viewer renders their Markdown, opens an editor on request, and reloads the document when editing finishes.

## Try the Workflow

```bash
homelabctl config init
homelabctl config add myservice
homelabctl check service myservice
homelabctl check --all
homelabctl runbook myservice
```

## Engineering Evidence

The repository includes tests for the worker limit, service-check concurrency, configuration round trips, HTTP expectations, failure exit codes, and TLS error handling. These exercise behavior across the CLI, configuration, and check layers.

- [Worker pool and concurrency test](https://github.com/marcusw0/homelabctl/tree/main/internal/runner)
- [Protocol checks and tests](https://github.com/marcusw0/homelabctl/tree/main/internal/check)
- [CLI behavior and tests](https://github.com/marcusw0/homelabctl/tree/main/internal/cli)

## Current Direction

The CLI and interactive runbook viewer are implemented. A broader TUI dashboard is in development. The project is where I practice designing usable tools around interfaces, concurrent work, configuration, and actionable errors.
