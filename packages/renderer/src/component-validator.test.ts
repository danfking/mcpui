import { describe, it, expect, vi } from 'vitest';
import { validateElement$, validateHtml, createValidator } from './component-validator.js';

describe('validateElement$', () => {
    it('validates a valid burnish-card element', () => {
        const result = validateElement$('<burnish-card title="Test">', { silent: true });
        expect(result.valid).toBe(true);
        expect(result.issues).toHaveLength(0);
    });

    it('reports error for missing required attribute', () => {
        const result = validateElement$('<burnish-card>', { silent: true });
        expect(result.valid).toBe(false);
        expect(result.issues.some(i => i.attr === 'title' && i.severity === 'error')).toBe(true);
    });

    it('reports error for invalid JSON in items attribute', () => {
        const result = validateElement$('<burnish-stat-bar items="not-json">', { silent: true });
        expect(result.valid).toBe(false);
        expect(result.issues.some(i => i.attr === 'items' && i.severity === 'error')).toBe(true);
    });

    it('validates valid JSON items attribute', () => {
        const items = JSON.stringify([{ label: 'Open', value: 5 }]);
        const result = validateElement$(`<burnish-stat-bar items='${items}'>`, { silent: true });
        expect(result.valid).toBe(true);
    });

    it('warns when items array items missing expected keys', () => {
        const items = JSON.stringify([{ name: 'Open', count: 5 }]);
        const result = validateElement$(`<burnish-stat-bar items='${items}'>`, { silent: true });
        expect(result.issues.some(i => i.attr === 'items' && i.severity === 'warning')).toBe(true);
    });

    it('returns valid for non-burnish elements', () => {
        const result = validateElement$('<div class="foo">', { silent: true });
        expect(result.valid).toBe(true);
        expect(result.issues).toHaveLength(0);
    });

    it('returns valid for unknown burnish tags', () => {
        // Unknown component — not in registry, so no issues
        const result = validateElement$('<burnish-unknown foo="bar">', { silent: true });
        expect(result.valid).toBe(true);
        expect(result.issues).toHaveLength(0);
    });

    it('reports error for invalid trend enum on burnish-metric', () => {
        const result = validateElement$('<burnish-metric value="42" trend="sideways">', { silent: true });
        expect(result.valid).toBe(false);
        expect(result.issues.some(i => i.attr === 'trend' && i.severity === 'error')).toBe(true);
    });

    it('validates valid trend enum on burnish-metric', () => {
        const result = validateElement$('<burnish-metric value="42" trend="up">', { silent: true });
        expect(result.valid).toBe(true);
    });

    it('reports soft warning (not error) for unknown card status', () => {
        const result = validateElement$('<burnish-card title="T" status="unknown-status">', { silent: true });
        // status is soft, so valid should still be true
        expect(result.valid).toBe(true);
        expect(result.issues.some(i => i.attr === 'status' && i.severity === 'warning')).toBe(true);
    });

    it('calls custom logger when issue found and not silent', () => {
        const logger = vi.fn();
        validateElement$('<burnish-card>', { logger, silent: false });
        expect(logger).toHaveBeenCalled();
    });

    it('does not call logger when silent is true', () => {
        const logger = vi.fn();
        validateElement$('<burnish-card>', { logger, silent: true });
        expect(logger).not.toHaveBeenCalled();
    });
});

describe('validateHtml', () => {
    it('validates all components in an HTML string', () => {
        const html = '<burnish-card title="A"></burnish-card><burnish-card title="B"></burnish-card>';
        const result = validateHtml(html, { silent: true });
        expect(result.valid).toBe(true);
        expect(result.issues).toHaveLength(0);
    });

    it('collects errors from multiple components', () => {
        // Two cards with missing titles
        const html = '<burnish-card></burnish-card><burnish-card></burnish-card>';
        const result = validateHtml(html, { silent: true });
        expect(result.valid).toBe(false);
        expect(result.issues.length).toBeGreaterThanOrEqual(2);
    });

    it('returns valid for empty string', () => {
        const result = validateHtml('', { silent: true });
        expect(result.valid).toBe(true);
        expect(result.issues).toHaveLength(0);
    });

    it('ignores non-burnish tags', () => {
        const html = '<div><p>Hello</p></div>';
        const result = validateHtml(html, { silent: true });
        expect(result.valid).toBe(true);
    });
});

describe('createValidator', () => {
    it('returns a function that validates HTML and returns html unchanged', () => {
        const validate = createValidator({ silent: true });
        const html = '<burnish-card title="Test"></burnish-card>';
        const result = validate(html);
        expect(result.html).toBe(html);
        expect(result.valid).toBe(true);
    });

    it('returns validation issues alongside html', () => {
        const validate = createValidator({ silent: true });
        const result = validate('<burnish-card></burnish-card>');
        expect(result.valid).toBe(false);
        expect(result.issues.length).toBeGreaterThan(0);
        expect(result.html).toBe('<burnish-card></burnish-card>');
    });
});
