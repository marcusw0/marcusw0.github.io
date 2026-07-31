---
title: Docker Networking Notes for Homelab Services
description: The Docker network defaults I use, when macvlan is worth the trouble, and why most ports stay private.
date: 2026-03-05
tags: ["docker", "networking", "homelab"]
tech: ["Docker", "Linux", "DNS"]
---

My defaults for Docker networking are explicit networks per stack, documented port exposure, and a reverse proxy in front instead of publishing every service's ports directly. That cuts down on port conflicts and keeps fewer services exposed.

## Bridge Networks

Bridge networks are the default choice for most application stacks. They give you service-name DNS, keep ports private unless you publish them, and make Compose files easy to move between hosts. One thing I've learned is to use at least two networks—a frontend and a backend—so web interfaces stay separate from databases and other internal services.

```yaml
networks:
  proxy:
    external: true
  app:
    internal: true
```

## Macvlan

Macvlan is for the rare service that needs to look like a real device on the LAN. It adds enough overhead that I don't use it anywhere else, and I'm planning to move my DNS away from it too.

One catch with macvlan is that Linux doesn't let the parent interface communicate directly with its macvlan children. If the Docker host has one physical interface and needs to reach a macvlan container, create a macvlan shim on that interface and add a host route for each container.

```bash
sudo ip link add macvlan-shim link eth0 type macvlan mode bridge
sudo ip addr add 192.168.1.7/32 dev macvlan-shim # any unassigned IP
sudo ip link set macvlan-shim up
sudo ip route add 192.168.1.15/32 dev macvlan-shim # IP of macvlan child
```

## Final Notes

Publish ports for the reverse proxy, DNS, and the monitoring endpoints that genuinely need them. Everything else talks over named Docker networks or through the reverse proxy. Any port published beyond that gets its reason written down—otherwise, six months from now, you won't remember why it's open and will spend too much time investigating. Trust me on that lol.

