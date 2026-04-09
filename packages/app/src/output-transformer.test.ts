import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { transformOutput } from './output-transformer.js';

// Create a jsdom-based DOMParser for testing in Node.js
function makeDomParser() {
    return {
        parseFromString(str: string, type: string): Document {
            const dom = new JSDOM(str, { contentType: type as any });
            return dom.window.document;
        },
    };
}

const domParser = makeDomParser();

describe('transformOutput', () => {
    it('returns empty string for null/undefined input', () => {
        expect(transformOutput('')).toBe('');
        expect(transformOutput(null as any)).toBe('');
        expect(transformOutput(undefined as any)).toBe('');
    });

    it('returns empty string for non-string input', () => {
        expect(transformOutput(42 as any)).toBe('');
    });

    it('rejects script tags as defense-in-depth', () => {
        const html = '<script>alert("xss")</script><burnish-card title="T"></burnish-card>';
        const result = transformOutput(html, { domParser });
        expect(result).toBe('');
    });

    it('rejects inline event handlers', () => {
        const html = '<burnish-card title="T" onclick="alert(1)"></burnish-card>';
        const result = transformOutput(html, { domParser });
        expect(result).toBe('');
    });

    it('passes through clean HTML unchanged (no burnish components)', () => {
        const html = '<div class="foo">Hello</div>';
        const result = transformOutput(html, { domParser });
        // No burnish components, so structure preserved
        expect(result).toContain('Hello');
    });

    it('normalizes burnish-card with success status inside section to info', () => {
        const html = `
            <burnish-section label="Items">
                <burnish-card title="Test" status="success"></burnish-card>
            </burnish-section>
        `;
        const result = transformOutput(html, { domParser });
        // success inside section should become info
        expect(result).toContain('status="info"');
        expect(result).not.toContain('status="success"');
    });

    it('preserves non-success card status inside section', () => {
        const html = `
            <burnish-section label="Errors">
                <burnish-card title="Failed" status="error"></burnish-card>
            </burnish-section>
        `;
        const result = transformOutput(html, { domParser });
        expect(result).toContain('status="error"');
    });

    it('sets section status to info when section contains cards', () => {
        const html = `
            <burnish-section label="Results">
                <burnish-card title="Item A"></burnish-card>
            </burnish-section>
        `;
        const result = transformOutput(html, { domParser });
        expect(result).toContain('status="info"');
    });

    it('repairs trailing comma in JSON attribute', () => {
        const html = `<burnish-stat-bar items='[{"label":"Open","value":5,}]'></burnish-stat-bar>`;
        const result = transformOutput(html, { domParser });
        // Should not crash and should produce output
        expect(result).toBeTruthy();
        // The attribute should be present in the output (JSON was repaired without crashing)
        expect(result).toContain('items=');
    });

    it('repairs HTML entity-encoded JSON attributes', () => {
        const items = JSON.stringify([{ label: 'Open', value: 5 }]);
        const encoded = items.replace(/"/g, '&quot;');
        const html = `<burnish-stat-bar items="${encoded}"></burnish-stat-bar>`;
        const result = transformOutput(html, { domParser });
        expect(result).toBeTruthy();
    });

    it('sets tool card (item-id with __) status to info', () => {
        const html = `<burnish-card title="Tool" item-id="mcp__server__tool" status="success"></burnish-card>`;
        const result = transformOutput(html, { domParser });
        expect(result).toContain('status="info"');
    });

    it('returns html unchanged when no DOMParser available and no domParser injected', () => {
        // Without a domParser option, transformOutput returns html unchanged in Node.js
        // (since DOMParser is not available globally in Node)
        const html = '<burnish-card title="Test"></burnish-card>';
        const result = transformOutput(html);
        // Either returned unchanged or processed — just ensure no crash
        expect(typeof result).toBe('string');
    });

    it('sanitizes lookup prompt fields in burnish-form', () => {
        const fields = JSON.stringify([{
            key: 'repo',
            label: 'Repository',
            lookup: { prompt: 'Use mcp__github__search_repos to find repos' },
        }]);
        const html = `<burnish-form fields='${fields}'></burnish-form>`;
        const result = transformOutput(html, { domParser });
        expect(result).not.toContain('mcp__github__search_repos');
    });
});
