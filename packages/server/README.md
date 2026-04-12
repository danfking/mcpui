<p align="center">
  <img src="https://raw.githubusercontent.com/danfking/burnish/main/apps/demo/public/logo.png" alt="Burnish" width="120">
</p>

<h1 align="center">@burnishdev/server</h1>

<p align="center">
  <em>MCP hub and server-side primitives for Burnish.</em>
</p>

---

## Install

```bash
npm install @burnishdev/server
```

## Usage

Connect to a set of MCP servers and list their tools:

```ts
import { McpHub } from '@burnishdev/server';

const hub = new McpHub();
await hub.initialize('./mcp-servers.json');

for (const tool of hub.listTools()) {
  console.log(tool.server, tool.name, tool.description);
}

const result = await hub.callTool('filesystem', 'read_file', { path: '/tmp/x' });
```

## What this is

The server-side engine for [Burnish](https://github.com/danfking/burnish). Exports `McpHub` (multi-server MCP client), tool guards (`isWriteTool`, `authorizeToolCall`, `safePath`), and `resolveIntent` for intent-based tool disambiguation. Consumed by `burnish` (the CLI) and by any app embedding Burnish on the server side.

## Links

- [Burnish monorepo](https://github.com/danfking/burnish)
- [Documentation](https://github.com/danfking/burnish#readme)
- [Report an issue](https://github.com/danfking/burnish/issues)
