import { LitElement, html, css } from 'lit';

export class BurnishBadge extends LitElement {
    static properties = {
        label: { type: String },
        variant: { type: String },
    };

    static styles = css`
        :host { display: inline-flex; }
        .badge {
            display: inline-flex;
            align-items: center;
            padding: var(--burnish-space-xs, 4px) var(--burnish-space-sm, 8px);
            border-radius: var(--burnish-radius-pill, 20px);
            font-size: var(--burnish-font-size-xs, 11px);
            font-weight: 600;
            letter-spacing: 0.3px;
            line-height: 1;
            white-space: nowrap;
        }
        .badge[data-variant="success"] {
            background: var(--burnish-border-success, #bbf7d0);
            color: var(--burnish-success, #16a34a);
        }
        .badge[data-variant="warning"] {
            background: var(--burnish-border-warning, #fef08a);
            color: var(--burnish-warning, #ca8a04);
        }
        .badge[data-variant="error"] {
            background: var(--burnish-border-error, #fecaca);
            color: var(--burnish-error, #dc2626);
        }
        .badge[data-variant="muted"] {
            background: var(--burnish-border-muted, #e5e7eb);
            color: var(--burnish-text-muted, #9ca3af);
        }
    `;

    declare label: string;
    declare variant: string;

    constructor() {
        super();
        this.variant = 'muted';
    }

    render() {
        return html`
            <span class="badge" data-variant="${this.variant || 'muted'}">
                ${this.label}
            </span>
        `;
    }
}

customElements.define('burnish-badge', BurnishBadge);
