import { describe, it, expect } from 'vitest';
import { containsTags, findStreamElements, extractHtmlContent } from './stream-parser.js';

describe('containsTags', () => {
    it('returns true when text contains a burnish- tag', () => {
        expect(containsTags('<burnish-card title="x">')).toBe(true);
    });

    it('returns false when no burnish- tags present', () => {
        expect(containsTags('Hello world')).toBe(false);
        expect(containsTags('<div class="foo">')).toBe(false);
    });

    it('supports custom prefix', () => {
        expect(containsTags('<xm-card title="x">', 'xm-')).toBe(true);
        expect(containsTags('<burnish-card title="x">', 'xm-')).toBe(false);
    });
});

describe('findStreamElements', () => {
    it('returns empty array for plain text', () => {
        expect(findStreamElements('No components here')).toEqual([]);
    });

    it('parses a complete leaf element', () => {
        const html = '<burnish-card title="Hello"></burnish-card>';
        const elements = findStreamElements(html);
        expect(elements).toHaveLength(1);
        expect(elements[0].type).toBe('leaf');
        expect(elements[0].tagName).toBe('burnish-card');
    });

    it('parses a container element as open/close pair', () => {
        const html = '<burnish-section label="S1"><burnish-card title="A"></burnish-card></burnish-section>';
        const elements = findStreamElements(html);
        expect(elements.some(e => e.type === 'open' && e.tagName === 'burnish-section')).toBe(true);
        expect(elements.some(e => e.type === 'close' && e.tagName === 'burnish-section')).toBe(true);
    });

    it('stops at incomplete element (waits for more data)', () => {
        // Incomplete tag — should return no leaf since close tag not found
        const html = '<burnish-card title="Hello">';
        const elements = findStreamElements(html);
        // No completed elements — waiting for closing tag
        expect(elements.filter(e => e.type === 'leaf')).toHaveLength(0);
    });

    it('strips MCP tool call XML blocks', () => {
        const html = '<use_mcp_tool>some_call</use_mcp_tool><burnish-card title="After"></burnish-card>';
        const elements = findStreamElements(html);
        expect(elements).toHaveLength(1);
        expect(elements[0].tagName).toBe('burnish-card');
    });

    it('handles multiple sibling leaf elements', () => {
        const html = '<burnish-card title="A"></burnish-card><burnish-card title="B"></burnish-card>';
        const elements = findStreamElements(html);
        expect(elements.filter(e => e.type === 'leaf')).toHaveLength(2);
    });

    it('handles incomplete MCP block gracefully (partial block remains)', () => {
        // Incomplete MCP block — open tag without close tag
        const html = 'some text <use_mcp_tool>incomplete';
        const elements = findStreamElements(html);
        expect(elements).toEqual([]);
    });
});

describe('extractHtmlContent', () => {
    it('returns trimmed text when no burnish tags present', () => {
        const result = extractHtmlContent('  Hello world  ');
        expect(result).toBe('Hello world');
    });

    it('extracts component HTML and strips preamble text', () => {
        const input = 'Here is your data:\n<burnish-card title="Test"></burnish-card>';
        const result = extractHtmlContent(input);
        expect(result).toBe('<burnish-card title="Test"></burnish-card>');
    });

    it('strips MCP tool call XML before extracting', () => {
        const input = '<use_mcp_tool>tool_call</use_mcp_tool><burnish-card title="X"></burnish-card>';
        const result = extractHtmlContent(input);
        expect(result).toBe('<burnish-card title="X"></burnish-card>');
    });

    it('returns empty string for empty input', () => {
        expect(extractHtmlContent('')).toBe('');
    });

    it('handles multiple components preserving all of them', () => {
        const input = '<burnish-section label="A"><burnish-card title="C1"></burnish-card></burnish-section>';
        const result = extractHtmlContent(input);
        expect(result).toContain('burnish-section');
        expect(result).toContain('burnish-card');
    });
});
