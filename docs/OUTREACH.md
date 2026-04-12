# MCP Server Outreach

Pre-launch list of MCP server repositories whose maintainers we'd like to personally ask to add the "Explore with Burnish" badge to their README. Target: at least 3 contacted by launch day, 5 badges live at 30 days (FINANCIAL-TARGETS leading indicator).

## Outreach Message Template

Keep it short, specific, and offer-first. Mention it's open source and zero-LLM. Do not pitch.

> Subject: One-click try button for `<server-name>`?
>
> Hi `<maintainer>`,
>
> I maintain Burnish — a small open-source project that renders any MCP server's tools as an interactive UI in the browser. No LLM, no account, nothing to install. It's basically Swagger UI for MCP.
>
> I've been testing it with `<server-name>` and it works nicely — your users can click through your tools and see live results without wiring up a client. If that sounds useful, there's a shields.io badge maintainers can paste at the top of their README so readers can try the server in one click:
>
> ```markdown
> [![Explore with Burnish](https://img.shields.io/badge/Explore%20with-Burnish-8B3A3A?style=flat)](https://burnish-demo.fly.dev/?server=<YOUR_SERVER_URL>)
> ```
>
> Happy to open a PR against your repo if you'd prefer. And of course happy to take feedback on the hosted demo if anything looks off for your server specifically.
>
> Code is AGPL-3.0: https://github.com/danfking/burnish
>
> Thanks for building `<server-name>` — it's one of the reasons the MCP ecosystem is getting interesting.

---

## Repository List

Status legend: `[ ] not contacted` / `[~] contacted` / `[x] added badge`

### Official reference servers (modelcontextprotocol/servers)

These live as subdirectories of the official monorepo at https://github.com/modelcontextprotocol/servers. High traffic, maintainer is the MCP core team.

| # | Repo / path | Maintainer | Why them | Status |
|---|---|---|---|---|
| 1 | https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem | @modelcontextprotocol | Most-used reference server, already our default demo target | `[ ] not contacted` |
| 2 | https://github.com/modelcontextprotocol/servers/tree/main/src/github | @modelcontextprotocol | Highest-visibility reference server; every MCP tutorial uses it | `[ ] not contacted` |
| 3 | https://github.com/modelcontextprotocol/servers/tree/main/src/postgres | @modelcontextprotocol | Databases are a top use case; visualizes table results well in Burnish | `[ ] not contacted` |
| 4 | https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite | @modelcontextprotocol | Lightweight, easy to try in the hosted demo | `[ ] not contacted` |
| 5 | https://github.com/modelcontextprotocol/servers/tree/main/src/slack | @modelcontextprotocol | Popular integration, schema-rich tools render well as cards | `[ ] not contacted` |
| 6 | https://github.com/modelcontextprotocol/servers/tree/main/src/google-drive | @modelcontextprotocol | Drive tools produce table-style results — good Burnish showcase | `[ ] not contacted` |
| 7 | https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search | @modelcontextprotocol | Search results map cleanly to `burnish-card` components | `[ ] not contacted` |
| 8 | https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer | @modelcontextprotocol | Browser automation server — visual drill-down is compelling here | `[ ] not contacted` |
| 9 | https://github.com/modelcontextprotocol/servers/tree/main/src/memory | @modelcontextprotocol | Tiny, makes a good first-time demo for new Burnish users | `[ ] not contacted` |
| 10 | https://github.com/modelcontextprotocol/servers/tree/main/src/fetch | @modelcontextprotocol | Generic HTTP fetch tool; low-friction demo path | `[ ] not contacted` |

### Third-party servers

| # | Repo | Maintainer | Why them | Status |
|---|---|---|---|---|
| 11 | https://github.com/cloudflare/mcp-server-cloudflare | @cloudflare | Vendor-backed, high-traffic README, Cloudflare credibility | `[ ] not contacted` |
| 12 | https://github.com/stripe/agent-toolkit | @stripe | Stripe MCP bindings — commerce results render well as metrics/tables | `[ ] not contacted` |
| 13 | https://github.com/supabase-community/supabase-mcp | @supabase-community | Supabase is huge with indie devs; maintainers are responsive | `[ ] not contacted` |
| 14 | https://github.com/upstash/mcp-server | @upstash | Redis/Kafka MCP; visualizing key listings in Burnish is a good showcase | `[ ] not contacted` |
| 15 | https://github.com/pydantic/pydantic-ai (MCP server examples) | @pydantic | High-profile Python crowd overlap; schema-first aligns with Burnish | `[ ] not contacted` |
| 16 | https://github.com/jlowin/fastmcp | @jlowin | FastMCP is the default Python MCP framework — reaches all Python server authors | `[ ] not contacted` |
| 17 | https://github.com/punkpeye/awesome-mcp-servers | @punkpeye | The awesome list — link there drives all downstream discovery | `[ ] not contacted` |
| 18 | https://github.com/smithery-ai/reference-servers | @smithery-ai | Smithery registry; badge could propagate to their listings | `[ ] not contacted` |

## Sources scanned

- https://github.com/modelcontextprotocol/servers (official monorepo — one candidate per `src/*` subdirectory)
- https://github.com/topics/mcp-server
- https://smithery.ai (featured list)
- https://glama.ai/mcp/servers
- https://mcp.so (featured)
- https://github.com/punkpeye/awesome-mcp-servers

## Tracking notes

- When a maintainer responds, log the thread URL next to their row.
- If they add the badge, flip status to `[x] added badge` and note the commit URL — this feeds the 30-day leading-indicator metric (5 badges target).
- Unrelated servers we discover during outreach get appended to the bottom of the third-party table.
