import { describe, it, expect, afterEach } from 'vitest';
import { buildConfigFile, cleanupTempConfig } from './config.js';
import { readFile } from 'node:fs/promises';
import type { CliOptions } from './cli.js';

const BASE_OPTS: Pick<CliOptions, 'command' | 'port' | 'open'> = {
    command: 'serve',
    port: 3000,
    open: false,
};

afterEach(async () => {
    await cleanupTempConfig();
});

describe('buildConfigFile', () => {
    it('returns resolved configPath when opts.configPath is provided', async () => {
        const result = await buildConfigFile({ ...BASE_OPTS, configPath: '/some/path/mcp-servers.json' });
        expect(result).toMatch(/mcp-servers\.json$/);
    });

    it('creates a temp config file with SSE URL config', async () => {
        const path = await buildConfigFile({ ...BASE_OPTS, sseUrl: 'http://localhost:3000/sse' });
        const content = JSON.parse(await readFile(path, 'utf-8'));
        expect(content.mcpServers).toBeDefined();
        expect(content.mcpServers.server.url).toBe('http://localhost:3000/sse');
    });

    it('creates a temp config file with server args', async () => {
        const path = await buildConfigFile({ ...BASE_OPTS, serverArgs: ['node', 'server.js', '--port', '4000'] });
        const content = JSON.parse(await readFile(path, 'utf-8'));
        expect(content.mcpServers).toBeDefined();
        const servers = Object.values(content.mcpServers) as any[];
        expect(servers).toHaveLength(1);
        expect(servers[0].command).toBe('node');
        expect(servers[0].args).toEqual(['server.js', '--port', '4000']);
    });

    it('derives server name from npx package name', async () => {
        const path = await buildConfigFile({
            ...BASE_OPTS,
            serverArgs: ['npx', '-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
        });
        const content = JSON.parse(await readFile(path, 'utf-8'));
        const serverNames = Object.keys(content.mcpServers);
        // Should use the package name, not 'npx'
        expect(serverNames[0]).not.toBe('npx');
        expect(serverNames[0]).toContain('server-filesystem');
    });

    it('throws when no server configuration is provided', async () => {
        await expect(buildConfigFile({ ...BASE_OPTS })).rejects.toThrow('No server configuration provided');
    });
});

describe('cleanupTempConfig', () => {
    it('does not throw when no temp dir was created', async () => {
        await expect(cleanupTempConfig()).resolves.toBeUndefined();
    });

    it('cleans up temp dir created by buildConfigFile', async () => {
        const path = await buildConfigFile({ ...BASE_OPTS, sseUrl: 'http://localhost:3000/sse' });
        await cleanupTempConfig();
        // After cleanup, reading the file should fail
        await expect(readFile(path, 'utf-8')).rejects.toThrow();
    });
});
