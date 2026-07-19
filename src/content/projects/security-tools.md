---
title: Security Tools
description: Python learning tools for directory discovery, TCP port scanning, vulnerability scanner for HTTP Headers.
date: 2025-04-28
tags: ["security", "python", "networking"]
tech: ["Python", "Requests", "Sockets", "ThreadPoolExecutor", "YAML", "TLS"]
github: "https://github.com/SemperCode06/pentest-tools"
featured: true
role: Developer
outcomes:
  - Built sequential and multithreaded TCP port-scanning implementations.
  - Added configurable directory discovery with bounded recursion and result logging.
  - Combined port, HTTP-header, and TLS certificate checks in a single CLI workflow.
---

## Overview

Small Python tools I wrote as proof of concept to learn how common reconnaissance checks actually work. The repository contains a directory fuzzer, sequential and multithreaded TCP port scanners, and a basic vulnerability-scanning workflow. These are learning utilities for systems I own or am explicitly authorized to test.

## Implemented Tools

- **Directory fuzzer:** reads a wordlist, sends concurrent HTTP requests with configurable timeouts and accepted status codes, logs discoveries, and supports recursive checks.
- **Sequential port scanner:** reads a target and port range from YAML, attempts TCP connections with a one-second timeout, and labels a small set of common services.
- **Multithreaded port scanner:** uses `ThreadPoolExecutor` with ten workers, supports multiple targets, and records open ports and errors through Python logging.
- **Vulnerability scanner:** combines TCP port checks with three HTTP security-header checks and TLS certificate validation using Python's default trust context.

## Implementation Sample

The threaded scanner isolates one connection attempt per task and only returns ports that accept a TCP connection:

```python
def scan_port(target, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as connection:
        connection.settimeout(1)
        if connection.connect_ex((target, port)) == 0:
            return port
    return None
```

This keeps the concurrency model straightforward: generate a bounded set of tasks, collect completed results, and log failures without treating a closed port as an exception.

## Validation and Limits

The repository demonstrates the intended control flow, configuration handling, timeouts, and result logging. It does not currently include automated tests, packaging, rate controls, or a comprehensive service-signature database. The HTTP check uses `HEAD` requests and tests only Content Security Policy, HTTP Strict Transport Security, and frame protection. I keep those limits visible on purpose — this isn't a production vulnerability-management tool and shouldn't read like one.

## Lessons Learned

Writing the checks myself made socket timeouts, bounded concurrency, and TLS trust validation concrete in a way reading about them never did. It also gave me real respect for where mature scanners earn their complexity — target normalization, retry policy, protocol-aware detection, and safe request pacing all turn out to need deliberate design.
