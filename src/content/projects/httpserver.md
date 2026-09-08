---
title: httpServer
description: An HTTP/1.1 server built on TCP sockets in Go, with incremental request parsing, header handling, and explicit response writing.
date: 2026-08-01
tech: ["Go", "TCP", "HTTP/1.1", "State machines"]
github: "https://github.com/marcusw0/httpServer"
featured: true
order: 2
focus: Network programming
role: Developer
outcomes:
  - Implemented a request parser that advances through request-line, header, and body states.
  - Built a TCP listener that dispatches connections to concurrent handlers.
  - Added response writing and tests for request parsing and header handling.
---

## The Goal

I built httpServer to understand what happens below a web framework: how bytes arriving over a TCP connection become an HTTP request, and how a handler turns its result back into a response.

## From Bytes to a Request

The parser keeps its state across reads, progressing through the request line, headers, and a body sized by `Content-Length`. It tracks the bytes consumed so that incomplete input can remain in the buffer for the next read.

Header parsing is a separate package. The server accepts TCP connections and starts a goroutine for each connection, then passes the parsed request and a response writer to a handler.

The response writer exposes status-line, header, and body operations. The example application uses those operations to serve HTML responses for success, client errors, and server errors.

## Run It

Start the example server from the repository:

```bash
go run ./cmd/httpserver
```

From another terminal, inspect the responses:

```bash
curl -i http://localhost:9988/
curl -i http://localhost:9988/yourproblem
curl -i http://localhost:9988/myproblem
```

## Engineering Evidence

- [Request parser and tests](https://github.com/marcusw0/httpServer/tree/main/internal/request)
- [Header parser and tests](https://github.com/marcusw0/httpServer/tree/main/internal/headers)
- [TCP server](https://github.com/marcusw0/httpServer/blob/main/internal/server/server.go)

## Scope and Lessons

This is a focused implementation for learning HTTP and stream parsing. It currently handles one request per connection and bodies with a declared content length. Chunked request bodies, persistent connections, and production server hardening remain outside its implemented scope.

The useful engineering lesson is that a read boundary is not a message boundary. Explicit parser states and tests make that distinction visible.
