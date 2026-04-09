import { describe, it, expect } from 'vitest';
import {
    BURNISH_COMPONENTS,
    buildSanitizerConfig,
    buildSanitizerConfigWithPrefix,
} from './sanitizer.js';

describe('BURNISH_COMPONENTS', () => {
    it('includes all core burnish components', () => {
        const tags = BURNISH_COMPONENTS.map(c => c.tag);
        expect(tags).toContain('burnish-card');
        expect(tags).toContain('burnish-table');
        expect(tags).toContain('burnish-stat-bar');
        expect(tags).toContain('burnish-chart');
        expect(tags).toContain('burnish-section');
        expect(tags).toContain('burnish-metric');
        expect(tags).toContain('burnish-message');
    });

    it('each component has at least one attribute', () => {
        for (const comp of BURNISH_COMPONENTS) {
            expect(comp.attrs.length).toBeGreaterThan(0);
        }
    });
});

describe('buildSanitizerConfig', () => {
    it('returns ADD_TAGS with all component tags', () => {
        const config = buildSanitizerConfig();
        for (const comp of BURNISH_COMPONENTS) {
            expect(config.ADD_TAGS).toContain(comp.tag);
        }
    });

    it('returns ADD_ATTR with all component attributes', () => {
        const config = buildSanitizerConfig();
        // Check a representative set of expected attributes
        expect(config.ADD_ATTR).toContain('title');
        expect(config.ADD_ATTR).toContain('items');
        expect(config.ADD_ATTR).toContain('columns');
        expect(config.ADD_ATTR).toContain('rows');
        expect(config.ADD_ATTR).toContain('config');
    });

    it('includes class in ADD_ATTR by default', () => {
        const config = buildSanitizerConfig();
        expect(config.ADD_ATTR).toContain('class');
    });

    it('accepts extra attrs', () => {
        const config = buildSanitizerConfig(BURNISH_COMPONENTS, ['class', 'data-foo']);
        expect(config.ADD_ATTR).toContain('data-foo');
    });

    it('accepts custom components', () => {
        const custom = [{ tag: 'custom-widget', attrs: ['value', 'label'] }];
        const config = buildSanitizerConfig(custom);
        expect(config.ADD_TAGS).toContain('custom-widget');
        expect(config.ADD_ATTR).toContain('value');
        expect(config.ADD_ATTR).toContain('label');
    });

    it('deduplicates attrs shared across components', () => {
        const config = buildSanitizerConfig();
        // 'title' appears in multiple components — should appear exactly once
        const titleCount = config.ADD_ATTR.filter(a => a === 'title').length;
        expect(titleCount).toBe(1);
    });
});

describe('buildSanitizerConfigWithPrefix', () => {
    it('remaps burnish- tags to the new prefix', () => {
        const config = buildSanitizerConfigWithPrefix('xm-');
        expect(config.ADD_TAGS).toContain('xm-card');
        expect(config.ADD_TAGS).toContain('xm-table');
        expect(config.ADD_TAGS).not.toContain('burnish-card');
    });

    it('includes attributes from remapped components', () => {
        const config = buildSanitizerConfigWithPrefix('xm-');
        expect(config.ADD_ATTR).toContain('title');
        expect(config.ADD_ATTR).toContain('items');
    });

    it('includes extra components in output', () => {
        const extras = [{ tag: 'xm-custom', attrs: ['foo'] }];
        const config = buildSanitizerConfigWithPrefix('xm-', extras);
        expect(config.ADD_TAGS).toContain('xm-custom');
        expect(config.ADD_ATTR).toContain('foo');
    });
});
