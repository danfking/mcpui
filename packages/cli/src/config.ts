/**
 * Build an MCP config object from CLI options and write it to a temp file.
 * McpHub.initialize() requires a file path, so we materialize the config.
 */

import { writeFile, mkdtemp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import type { McpServersConfig } from '@burnish/server';
import type { CliOptions } from './cli.js';

export async function buildConfigFile(opts: CliOptions): Promise<string> {
    if (opts.configPath) {
        return resolve(opts.configPath);
    }

    let config: McpServersConfig;

    if (opts.sseUrl) {
        config = {
            mcpServers: {
                server: { url: opts.sseUrl },
            },
        };
    } else if (opts.serverArgs && opts.serverArgs.length > 0) {
        const command = opts.serverArgs[0];
        const args = opts.serverArgs.slice(1);
        // Derive a readable name: for "npx @modelcontextprotocol/server-filesystem",
        // use the package name rather than "npx"
        let name: string;
        if ((command === 'npx' || command === 'npx.cmd') && args.length > 0) {
            // Skip npx flags like -y, --yes to find the package name
            const pkgArg = args.find(a => !a.startsWith('-')) || args[0];
            name = pkgArg.split('/').pop()?.replace(/^@/, '') || 'server';
        } else {
            name = command.split('/').pop()?.replace(/^@/, '') || 'server';
        }
        config = {
            mcpServers: {
                [name]: { command, args },
            },
        };
    } else {
        throw new Error('No server configuration provided');
    }

    const tmpDir = await mkdtemp(resolve(tmpdir(), 'burnish-cli-'));
    const configPath = resolve(tmpDir, 'mcp-servers.json');
    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return configPath;
}
