/**
 * Drill-down helpers — prompt generation and write-tool detection.
 */

// NOTE: Intentionally duplicated from @burnish/server/guards.ts for runtime isolation
// (this package runs in the browser, server runs in Node)
const WRITE_TOOL_PATTERNS = /^(create|update|delete|remove|push|write|edit|move|fork|merge|add|set|close|lock|assign)/i;

/** Max length for drill-down prompt inputs */
const MAX_PROMPT_INPUT_LENGTH = 500;
/** Max total prompt length */
const MAX_PROMPT_LENGTH = 5000;

/**
 * Strip control characters (ASCII 0-31) except tab (9) and newline (10).
 */
function stripControlChars(s: string): string {
    return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

/**
 * Sanitize a user-influenced string for safe prompt inclusion.
 * Strips control chars and truncates to maxLen.
 */
function sanitizeInput(s: string, maxLen = MAX_PROMPT_INPUT_LENGTH): string {
    return stripControlChars(s).slice(0, maxLen);
}

/**
 * Classify a tool as a write/mutate operation based on its name.
 */
export function isWriteTool(toolName: string): boolean {
    // Extract the tool name from fully qualified name (mcp__server__toolname)
    const parts = toolName.split('__');
    const baseName = parts[parts.length - 1] || toolName;
    return WRITE_TOOL_PATTERNS.test(baseName);
}

/**
 * Build the drill-down prompt for a card click.
 */
export function getDrillDownPrompt(title: string, status?: string, itemId?: string): string {
    title = sanitizeInput(title || '');
    if (status) status = sanitizeInput(status, 50);
    if (itemId) itemId = sanitizeInput(itemId, 200);
    const idClause = itemId ? ` (tool: ${itemId})` : '';
    const looksLikeTool = itemId && (itemId.includes('__') || itemId.includes('mcp_'));

    if (looksLikeTool) {
        const toolName = title || '';
        const isWrite = WRITE_TOOL_PATTERNS.test(toolName);

        return `The user wants to use the "${title}" tool${idClause}.

${isWrite ? 'This is a WRITE operation — do NOT call it. Show a form.' : 'Check if this tool has required parameters.'}

RULES:
- If the tool has required parameters that need user input → show a burnish-form with the parameters as fields. Add lookup to fields where values can be searched. Do NOT guess parameter values.
- If the tool can run with NO parameters or has obvious defaults (like listing the current directory) → call it and show results.
${isWrite ? '- This is a write tool — ALWAYS show a form, never auto-invoke.' : '- Only auto-invoke if truly no user input is needed.'}

EXAMPLE — a tool with required params MUST produce a form like this:
<burnish-form title="${title}" tool-id="${itemId || 'tool_name'}" fields='[{"key":"query","label":"Search query","type":"text","required":true,"placeholder":"enter value"}]'></burnish-form>

Use ONLY burnish-* web components. Include burnish-actions with next steps after results.`.slice(0, MAX_PROMPT_LENGTH);
    }
    const prompt = `Explore "${title}"${idClause} in more detail. Call the appropriate tools to get real data and show the results using burnish-* web components. If a tool requires parameters, show a burnish-form instead of guessing. Include burnish-actions with next steps.`;
    return prompt.slice(0, MAX_PROMPT_LENGTH);
}

/**
 * Generate a fallback burnish-form from a tool's JSON schema.
 * Returns null if the schema has no properties.
 */
export function generateFallbackForm(
    toolName: string,
    schema: { properties?: Record<string, any>; required?: string[] },
): string | null {
    const props = schema.properties || {};
    const required = new Set(schema.required || []);
    const stripHtml = (s: string) => s.replace(/<[^>]*>/g, '');
    const sanitizeField = (s: string, maxLen = 200) => stripControlChars(stripHtml(s)).slice(0, maxLen);
    const fields = Object.entries(props).slice(0, 50).map(([key, prop]) => {
        const field: Record<string, any> = {
            key: sanitizeField(key, 100),
            label: sanitizeField(prop.title || key.replace(/_/g, ' '), 100),
            type: prop.type === 'number' || prop.type === 'integer' ? 'number' : prop.enum ? 'select' : 'text',
            required: required.has(key),
        };
        if (prop.description) field.placeholder = sanitizeField(prop.description, 300);
        if (prop.default !== undefined) field.value = sanitizeField(String(prop.default), 200);
        if (prop.enum) field.options = prop.enum.slice(0, 100).map((v: any) => sanitizeField(String(v), 100));
        return field;
    });
    if (fields.length === 0) return null;
    const displayName = (toolName.split('__').pop() || toolName).replace(/_/g, ' ');
    const escAttr = (s: string) => s.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    return `<burnish-form title="${escAttr(displayName)}" tool-id="${escAttr(toolName)}" fields='${JSON.stringify(fields).replace(/'/g, '&#39;')}'></burnish-form>`;
}
