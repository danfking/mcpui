import { LitElement, html, css } from 'lit';

export class McpuiStatBar extends LitElement {
    static properties = {
        items: { type: String },
        _activeFilter: { state: true },
    };

    static styles = css`
        :host { display: block; width: 100%; min-width: 0; }
        .stat-bar { display: flex; gap: var(--mcpui-space-md, 12px); flex-wrap: wrap; }
        .stat-chip {
            display: flex; align-items: center; gap: var(--mcpui-space-sm, 8px);
            background: var(--mcpui-surface, #fff);
            border-radius: var(--mcpui-radius-pill, 20px);
            padding: var(--mcpui-space-sm, 8px) var(--mcpui-space-lg, 16px);
            box-shadow: var(--mcpui-shadow-sm);
            font-size: var(--mcpui-font-size-md, 14px);
            transition: all var(--mcpui-transition-fast);
            cursor: pointer;
            user-select: none;
            border: 2px solid transparent;
        }
        .stat-chip:hover { transform: translateY(-1px); box-shadow: var(--mcpui-shadow-md); }
        .stat-chip.active {
            border-color: var(--mcpui-accent, #4f6df5);
            box-shadow: var(--mcpui-shadow-md);
        }
        .stat-chip.dimmed { opacity: 0.4; }
        .stat-dot { width: 10px; height: 10px; border-radius: var(--mcpui-radius-round, 50%); }
        .stat-value { font-weight: 700; font-size: var(--mcpui-font-size-xl, 18px); margin-right: var(--mcpui-space-xs, 4px); }
        .stat-label { color: var(--mcpui-text-secondary, #6b7280); }
    `;

    declare items: string;
    declare _activeFilter: string | null;

    constructor() {
        super();
        this._activeFilter = null;
    }

    private _getColor(color?: string): string {
        const map: Record<string, string> = {
            success: 'var(--mcpui-success, #16a34a)', healthy: 'var(--mcpui-success, #16a34a)',
            warning: 'var(--mcpui-warning, #ca8a04)',
            error: 'var(--mcpui-error, #dc2626)', failing: 'var(--mcpui-error, #dc2626)',
            info: 'var(--mcpui-info, #6366f1)',
            muted: 'var(--mcpui-muted, #9ca3af)', 'no-data': 'var(--mcpui-muted, #9ca3af)',
        };
        return map[color || ''] || color || 'var(--mcpui-muted, #9ca3af)';
    }

    private _handleClick(label: string) {
        // Toggle: click same chip to deselect
        this._activeFilter = this._activeFilter === label ? null : label;

        this.dispatchEvent(new CustomEvent('mcpui-filter', {
            detail: { filter: this._activeFilter },
            bubbles: true,
            composed: true,
        }));
    }

    render() {
        let data: Array<{ label: string; value: string | number; color?: string }> = [];
        try { data = JSON.parse(this.items || '[]'); } catch { /* graceful */ }

        return html`
            <div class="stat-bar">
                ${data.map(item => {
                    const isActive = this._activeFilter === item.label;
                    const isDimmed = this._activeFilter && !isActive;
                    return html`
                        <div class="stat-chip ${isActive ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}"
                             @click=${() => this._handleClick(item.label)}>
                            <span class="stat-dot" style="background:${this._getColor(item.color)}"></span>
                            <span class="stat-value">${item.value}</span>
                            <span class="stat-label">${item.label}</span>
                        </div>
                    `;
                })}
            </div>
        `;
    }
}

customElements.define('mcpui-stat-bar', McpuiStatBar);
