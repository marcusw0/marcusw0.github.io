---
title: homelabctl
description: A Go tool for checking homelab services, with concurrent health checks, a terminal dashboard, and interactive runbooks.
date: 2026-09-18
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
  - Built a terminal dashboard with automatic refresh and details for each service.
  - Connected TOML service inventories to configurable checks and interactive runbooks.
---

## The Problem

Checking a service often means switching between commands, configuration files, and troubleshooting notes. I built homelabctl to bring those tasks into one tool so I can check a service and find its runbook from the terminal.

## Finding a Failed Service

Here is the dashboard checking three local demo services. I started `notes` and `status` and left the `api` port closed. This example runs HTTP and TCP checks; DNS and TLS are skipped.

<figure>
  <a href="/images/homelabctl/dashboard.png" aria-label="Open the homelabctl dashboard screenshot at full size">
    <img src="/images/homelabctl/dashboard.png" alt="homelabctl dashboard: notes and status have healthy HTTP and TCP checks; api shows an HTTP error and an unhealthy TCP check. DNS and TLS are skipped." width="1360" height="560" loading="lazy" decoding="async" class="w-full rounded-lg border border-(--border)" />
  </a>
  <figcaption class="mt-2 text-sm text-(--muted)">The running dashboard with a local demo configuration. Open either screenshot to view it at full size.</figcaption>
</figure>

1. The overview shows that `api` failed both checks while the other services are responding.
2. I select `api` with the arrow keys and press Enter to see the results.
3. Both errors say **connection refused** on `127.0.0.1:18763`. I would check whether the service is running and listening on the configured port before looking at its HTTP responses.

<figure>
  <a href="/images/homelabctl/service-details.png" aria-label="Open the API service details screenshot at full size">
    <img src="/images/homelabctl/service-details.png" alt="Details for the api demo service: HTTP and TCP connections to 127.0.0.1 on port 18763 are refused. DNS and TLS checks are skipped." width="1360" height="560" loading="lazy" decoding="async" class="w-full rounded-lg border border-(--border)" />
  </a>
  <figcaption class="mt-2 text-sm text-(--muted)">The details keep the errors from each check together. Esc returns to the overview.</figcaption>
</figure>

For this example, the API entry in `demo.toml` is:

```toml
[services.api]
fqdn = "localhost"
ip = "127.0.0.1"
port = 18763
enabled = true
checks = ["http", "tcp"]
http_url = "http://127.0.0.1:18763/"
expect_status = 200
timeout = "2s"
```

With that port closed, `homelabctl -config demo.toml dashboard` shows the failure. Starting an HTTP service there that returns `200` makes both checks healthy on the next refresh. The dashboard refreshes every 20 seconds.

## How It Works

Services live in a TOML inventory. Each service can select its checks, expected HTTP status, redirect behavior, timeout, and certificate warning window. The check layer returns protocol-specific results; the CLI handles presentation and exit codes.

A worker pool limits how many services run at once. Context cancellation flows through the runner and checks, allowing work to stop when the caller cancels. Separating the runner from the concrete checks also makes concurrency behavior testable.

Runbooks sit alongside the service configuration. A Bubble Tea viewer renders their Markdown, opens an editor on request, and reloads the document when editing finishes.

The terminal dashboard runs the same checks and refreshes them automatically. It shows HTTP, DNS, TLS, and TCP status for each enabled service. Selecting a service opens its results, including error messages and certificate expiration details.

## Try the Workflow

```bash
homelabctl config init
homelabctl config add myservice
homelabctl check service myservice
homelabctl check --all
homelabctl dashboard
homelabctl runbook myservice
```

## Tests and Source

The repository includes tests for the worker limit, service-check concurrency, configuration round trips, HTTP expectations, failure exit codes, and TLS error handling. These exercise behavior across the CLI, configuration, and check layers.

- [Worker pool and concurrency test](https://github.com/marcusw0/homelabctl/tree/main/internal/runner)
- [Protocol checks and tests](https://github.com/marcusw0/homelabctl/tree/main/internal/check)
- [CLI behavior and tests](https://github.com/marcusw0/homelabctl/tree/main/internal/cli)
- [Terminal dashboard](https://github.com/marcusw0/homelabctl/tree/main/internal/tui/dashboard)

## What I’m Learning

I’m continuing to develop the CLI, dashboard, and runbook viewer. Working on the same checks across all three has helped me think through where the checking logic ends and the interface begins. It also gives me a practical reason to work on concurrency, cancellation, and useful error messages.
