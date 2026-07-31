---
title: Traefik > NGINX Proxy Manager
description: Why I replaced NGINX Proxy Manager with file-based Traefik routing.
date: 2026-02-22
tags: ["traefik", "cloudflare", "tls"]
tech: ["Traefik", "Docker", "Cloudflare"]
---

When I first built my homelab, I went with NGINX Proxy Manager (NPM) because it showed up in so many videos and posts. I was a bit disappointed by how little control it gave me. You add a service, hit a few toggles for HSTS and other security settings, and that's about it. I started looking at the alternatives and found Traefik.

## How Traefik Won Me Over

Traefik is exactly what I was looking for. I get to define how the reverse proxy should behave. Cipher suites, custom health checks, allow lists, security headers, IPS middleware, and identity-provider authentication can all live in config. Once I saw how much control that gave me, I was sold.

## My Traefik Layout

There are several ways to manage Traefik, but I prefer files. Routers, middlewares, and services live in dynamic configuration that can be updated on the fly. You can keep everything in one file, split it by service, or split it by type. I use one file for middlewares, one for services, and one for routers.

Traefik watches those files, so saving a change applies it live — no container restart, no dropped connections. Here is what one route looks like end to end. In my setup, these three blocks live in separate files.

```yaml
http:
  routers:
    dashboard:
      rule: Host(`dashboard.example.com`)
      entryPoints:
        - websecure
      middlewares:
        - internal-only
        - security-headers
      service: dashboard@file
      tls:
        certResolver: cloudflare

  middlewares:
    internal-only:
      ipAllowList:
        sourceRange:
          - 192.168.1.0/24

  services:
    dashboard:
      loadBalancer:
        servers:
          - url: "http://dashboard:8080"
```

That `internal-only` middleware is the kind of thing NPM cannot really express. I can define it once and attach it to any router that should never be reachable from outside the LAN. The same idea works for authentication. One middleware points at the identity provider, and any service can require SSO by adding it to the router's middleware list.

## Certificates Without Opening Port 80

The other half of the setup is Cloudflare. Traefik's ACME resolver uses the DNS challenge, which means certificates get issued by creating a DNS record instead of answering an HTTP challenge. Internal-only services get real, trusted TLS without ever being exposed to the internet — no port 80, no self-signed cert warnings, and wildcard certs work too.

## Should You Switch?

To be fair to NPM, it got me routing traffic in less than an hour, and there is real value in that. Traefik's learning curve is steeper — the docs are dense, and the first working config takes an evening instead of ten minutes.

That config is the point, though. Everything above lives in files I can review instead of toggles in a web UI. If you've hit the ceiling of what NPM will let you do, Traefik is worth the steeper learning curve.
