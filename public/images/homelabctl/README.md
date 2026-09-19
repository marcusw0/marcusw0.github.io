# homelabctl screenshots

Captured from the running homelabctl dashboard on September 18, 2026, using local
checkout `592795f`. These are screenshots of the terminal application, with a
separate demo configuration.

- `dashboard.png`: `notes` and `status` return HTTP 200 and accept TCP connections
  on localhost ports 18761 and 18762. Nothing listens on the `api` port, 18763.
- `service-details.png`: the selected `api` service reports connection refused.
- Only HTTP and TCP checks are enabled. DNS and TLS are skipped.

To reproduce the scenario, run two local HTTP servers on ports 18761 and 18762,
leave port 18763 closed, and configure all three services with `fqdn = "localhost"`,
`ip = "127.0.0.1"`, `enabled = true`, `checks = ["http", "tcp"]`,
`expect_status = 200`, and `timeout = "2s"`. Give each service its matching `port`
and `http_url`, then run `homelabctl -config demo.toml dashboard`.

The capture used a 1360 × 560 terminal view with DejaVu Sans Mono at 20px. Select
`api` with the arrow keys and press Enter for the second screenshot; service order
can vary between runs.
