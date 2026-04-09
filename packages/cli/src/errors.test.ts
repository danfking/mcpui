import { describe, it, expect } from 'vitest';
import { formatMcpError } from './errors.js';

describe('formatMcpError', () => {
    describe('ENOENT / command not found', () => {
        it('formats ENOENT with spawn command', () => {
            const raw = 'spawn npx ENOENT';
            const result = formatMcpError(raw, 'my-server');
            expect(result).toContain('"my-server"');
            expect(result).toContain('npx');
            expect(result).toContain('not found');
        });

        it('formats ENOENT without spawn command', () => {
            const result = formatMcpError('ENOENT: no such file', 'my-server');
            expect(result).toContain('"my-server"');
            expect(result).toContain('command not found');
        });

        it('formats command not found pattern', () => {
            const result = formatMcpError('command not found: python');
            expect(result).toContain('server');
            expect(result).toContain('command not found');
        });
    });

    describe('ECONNREFUSED / connection refused', () => {
        it('formats ECONNREFUSED with URL', () => {
            const raw = 'ECONNREFUSED https://localhost:3000/sse';
            const result = formatMcpError(raw);
            expect(result).toContain('localhost:3000');
            expect(result).toContain('connection refused');
        });

        it('formats ECONNREFUSED without URL', () => {
            const result = formatMcpError('ECONNREFUSED', 'sse-server');
            expect(result).toContain('"sse-server"');
            expect(result).toContain('connection refused');
        });

        it('formats fetch failed', () => {
            const result = formatMcpError('fetch failed: network error', 'remote');
            expect(result).toContain('connection refused');
        });
    });

    describe('MCP protocol errors', () => {
        it('formats MCP error with code and detail', () => {
            const result = formatMcpError('MCP error -32000: Connection closed', 'my-server');
            expect(result).toContain('"my-server"');
            expect(result).toContain('Connection closed');
        });

        it('formats MCP error with no detail', () => {
            const result = formatMcpError('MCP error -32001:');
            expect(result).toContain('protocol error');
        });
    });

    describe('connection closed / transport errors', () => {
        it('formats connection closed error', () => {
            const result = formatMcpError('connection closed unexpectedly', 'srv');
            expect(result).toContain('"srv"');
            expect(result).toContain('closed unexpectedly');
        });

        it('formats transport error', () => {
            const result = formatMcpError('transport layer failure');
            expect(result).toContain('connection closed');
        });
    });

    describe('timeout errors', () => {
        it('formats timeout error', () => {
            const result = formatMcpError('Request timed out after 30s', 'srv');
            expect(result).toContain('"srv"');
            expect(result).toContain('did not respond in time');
        });

        it('formats timeout variant', () => {
            const result = formatMcpError('timeout: waiting for response');
            expect(result).toContain('did not respond in time');
        });
    });

    describe('fallback behavior', () => {
        it('returns first line of unrecognized errors', () => {
            const raw = 'Some unknown error\nWith extra stack trace line';
            const result = formatMcpError(raw);
            expect(result).toBe('Some unknown error');
        });

        it('uses generic "server" when no serverName provided', () => {
            const result = formatMcpError('ECONNREFUSED');
            expect(result).toContain('server');
            expect(result).not.toContain('"');
        });
    });
});
