import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const assets = resolve(__dirname, '../assets');

// Create assets directory structure
mkdirSync(resolve(assets, 'components'), { recursive: true });
mkdirSync(resolve(assets, 'app'), { recursive: true });
mkdirSync(resolve(assets, 'renderer'), { recursive: true });

// Copy demo public files
const publicDir = resolve(root, 'apps/demo/public');
const filesToCopy = [
    'app.js', 'shared.js', 'view-renderers.js', 'contextual-actions.js',
    'deterministic-ui.js', 'copilot-ui.js', 'style.css', 'tokens.css',
];
for (const f of filesToCopy) {
    const src = resolve(publicDir, f);
    if (existsSync(src)) {
        cpSync(src, resolve(assets, f));
    } else {
        console.warn(`[burnish] Warning: ${f} not found in demo public/`);
    }
}

// Copy compiled components
const componentsDist = resolve(root, 'packages/components/dist');
if (existsSync(componentsDist)) {
    cpSync(componentsDist, resolve(assets, 'components'), { recursive: true });
} else {
    console.warn('[burnish] Warning: packages/components/dist not found — run pnpm build first');
}

// Copy component tokens.css
const componentTokens = resolve(root, 'packages/components/src/tokens.css');
if (existsSync(componentTokens)) {
    cpSync(componentTokens, resolve(assets, 'components/tokens.css'));
}

// Copy compiled app and renderer
const appDist = resolve(root, 'packages/app/dist');
if (existsSync(appDist)) {
    cpSync(appDist, resolve(assets, 'app'), { recursive: true });
} else {
    console.warn('[burnish] Warning: packages/app/dist not found — run pnpm build first');
}

const rendererDist = resolve(root, 'packages/renderer/dist');
if (existsSync(rendererDist)) {
    cpSync(rendererDist, resolve(assets, 'renderer'), { recursive: true });
} else {
    console.warn('[burnish] Warning: packages/renderer/dist not found — run pnpm build first');
}

// Copy index.html from demo
// The import map already uses /app/, /renderer/, /components/ paths which match our layout
const demoHtml = readFileSync(resolve(publicDir, 'index.html'), 'utf-8');
writeFileSync(resolve(assets, 'index.html'), demoHtml);

console.log('[burnish] Assets bundled to packages/cli/assets/');
