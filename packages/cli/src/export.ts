/**
 * Export MCP server schema as JSON to stdout.
 */

import { McpHub } from '@burnish/server';
import { buildConfigFile } from './config.js';
import type { CliOptions } from './cli.js';

export async function exportSchema(opts: CliOptions): Promise<void> {
    const configPath = await buildConfigFile(opts);

    const mcpHub = new McpHub();

    console.error('[burnish] Connecting to MCP server...');

    try {
        await mcpHub.initialize(configPath);
    } catch (err) {
        console.error('[burnish] Failed to connect:', err instanceof Error ? err.message : err);
        process.exit(1);
    }

    const serverInfo = mcpHub.getServerInfo();
    const allTools = mcpHub.getAllTools();

    const schema = {
        burnish: '1.0',
        exportedAt: new Date().toISOString(),
        servers: serverInfo.map((s) => ({
            name: s.name,
            status: s.status,
            toolCount: s.toolCount,
        })),
        tools: allTools.map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema,
            serverName: t.serverName,
        })),
    };

    // Output to stdout (status messages go to stderr)
    console.log(JSON.stringify(schema, null, 2));

    await mcpHub.shutdown();
}
