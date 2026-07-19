---
title: Docker Networking Notes for Homelab Services
description: Practical notes on bridge networks.
date: 2026-03-05
tags: ["docker", "networking", "homelab"]
tech: ["Docker", "Linux", "DNS"]
---

My defaults for Docker networking: explicit networks per stack, documented port exposure, and reverse proxy in front instead of publishing every service's ports directly. This will also limit the headache of port conflicts as well as improve security.

## Bridge Networks

Bridge networks are the default choice for most application stacks. They give you service-name DNS, keep ports private unless you publish them, and make Compose files easy to move between hosts. One big thing I've learned is to have at minimum 2 networks, frontend and backend, to separate webfronts/server interfaces from databases and other backend services.

```yaml
networks:
  proxy:
    external: true
  app:
    internal: true
```

## Macvlan

Macvlan is for the rare service that needs to look like a real device on the LAN. DNS is the usual case, since clients have to reach it before any proxy is involved. It adds enough operational overhead that I don't use it anywhere else and am also going to move away from it. If you do use macvlan then remember Linux doesn't allow a macvlan parent interface to communicate directly with its macvlan children. If the Docker host has one physical interface and must reach whatever you put on a macvlan, create a macvlan shim on that same interface and add a host route for each container.

```bash
sudo ip link add macvlan-shim link eth0 type macvlan mode bridge
sudo ip addr add 192.168.1.7/32 dev macvlan-shim # any unassigned IP
sudo ip link set macvlan-shim up
sudo ip route add 192.168.1.15/32 dev macvlan-shim # IP of macvlan child
```

## Final Notes

Publish ports for the reverse proxy, DNS, and the monitoring endpoints that genuinely need them. Everything else talks over named Docker networks or through the reverse proxy. Any port published beyond that gets its reason written down — otherwise six months from now you won't remember why it's open and spend too much time investigating. Trust me on that lol.
