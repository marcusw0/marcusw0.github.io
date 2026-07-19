---
title: Traefik > NGINX Proxy Manager
description: Why I made the switch
date: 2026-02-22
tags: ["traefik", "cloudflare", "tls"]
tech: ["Traefik", "Docker", "Cloudflare"]
---

When I first built my homelab, I decided to go with NGINX Proxy Manager (NPM for short) because of how many videos and posts I saw about it. I was a bit disappointed by how little you have control over. You add a service, hit a few toggles for HSTS and security settings, and that's about it. I started looking into what else was out there and found Traefik.

## How Traefik Won Me Over

Traefik is exactly what I was looking for. You define how you want the reverse proxy to function. Want to define what Cipher Suites to allow? Configure custom health checks? Create allow lists, configure custom headers, add IPS middlewares, redirect to identity provider for auth before allowing access? You can do all of that and more. It's actually very impressive how feature packed Traefik is and I don't know why anyone would use NPM over it.

## My Traefik Layout

There's many ways you can manage Traefik, but my personal favorite is through files. How it works is you can have your routers, middlewares, and services in dynamic files that you can update on the fly. You can have it all in one dynamic file, split by service, or by type which is how I do it. One file for middlewares, one for services, and one for routers.

Traefik watches those files, so saving a change applies it live — no container restart, no dropped connections. Here's what one route looks like end to end (in my setup these three blocks live in their separate files):

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

That `internal-only` middleware is the kind of thing NPM can't really express: define it once, attach it to any router that should never be reachable from outside the LAN. Same story for auth — one middleware pointing at the identity provider, and any service can require SSO just by adding it to the router's middleware list.

## Certificates Without Opening Port 80

The other half of the setup is Cloudflare. Traefik's ACME resolver uses the DNS challenge, which means certificates get issued by creating a DNS record instead of answering an HTTP challenge. Internal-only services get real, trusted TLS without ever being exposed to the internet — no port 80, no self-signed cert warnings, and wildcard certs work too.

## Should You Switch?

To be fair to NPM: it got me routing traffic in less than an hour, and there's real value in that. Traefik's learning curve is steeper — the docs are dense, and the first working config takes an evening instead of ten minutes.

That config is the point though. Everything above lives in dynamic files instead of toggles in a web UI. I have full control over everything. If you've ever hit the ceiling of what NPM will let you do, that's the sign to switch.
