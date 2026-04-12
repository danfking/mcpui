import { chromium } from '@playwright/test';

const DATE = '20260412';
const DIR = 'tests/visual/screenshots';
const BASE = 'http://localhost:3458/';

const logs = [];
const errors = [];

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`[console.error] ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

async function shot(name) {
  const p = `${DIR}/smoke-${DATE}-${name}.png`;
  await page.screenshot({ path: p, fullPage: false });
  logs.push(`saved ${p}`);
}

// Scenario 1 — Homepage
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await shot('s1-homepage');

// Dump header + main structure for inspection
const headerHTML = await page.locator('header, .header, [class*="header" i]').first().innerHTML().catch(() => '(no header)');
const hasPromptBar = await page.locator('[class*="prompt-bar" i], [class*="composer" i], textarea').count();
const starterChips = await page.locator('button, [role="button"]').allInnerTexts();
logs.push(`header html length: ${headerHTML.length}`);
logs.push(`prompt-bar/textarea count: ${hasPromptBar}`);
logs.push(`buttons sample: ${starterChips.slice(0, 20).join(' | ')}`);

// Scenario 2 — Click Available tools
const avail = page.getByText(/Available tools/i).first();
if (await avail.count()) {
  await avail.click();
  await page.waitForTimeout(800);
  await shot('s2-tools-browser');
  const toolCards = await page.locator('[class*="tool" i]').count();
  logs.push(`tool-related element count: ${toolCards}`);
} else {
  logs.push('FAIL s2: Available tools chip not found');
}

// Scenario 3 — Execute first Get tool
// Try clicking first Explore button / first tool card
const explore = page.getByText(/Explore/i).first();
if (await explore.count()) {
  await explore.click();
  await page.waitForTimeout(1500);
  await shot('s3-tool-result');
  const bodyHTML = await page.content();
  const componentMatches = bodyHTML.match(/burnish-[a-z-]+/g) || [];
  const uniqueComps = [...new Set(componentMatches)];
  logs.push(`burnish-* components on result page: ${uniqueComps.join(', ')}`);
  const hasLatency = /\d+\s*ms/i.test(await page.locator('body').innerText());
  logs.push(`latency badge (ms text) found: ${hasLatency}`);
} else {
  logs.push('FAIL s3: no Explore button');
}

// Scenario 4 — Theme toggle
const beforeTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || document.documentElement.className);
// find theme toggle — sun/moon
const themeBtn = page.locator('button[aria-label*="theme" i], button[title*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i]').first();
if (await themeBtn.count()) {
  await themeBtn.click();
  await page.waitForTimeout(400);
  const afterTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || document.documentElement.className);
  logs.push(`theme before=${beforeTheme} after=${afterTheme}`);
  await shot('s4-theme-toggled');
} else {
  logs.push('FAIL s4: theme toggle not found by aria-label');
}

// Scenario 5 — Perf panel
const perfBtn = page.locator('button[aria-label*="perf" i], button[aria-label*="performance" i], button[title*="perf" i], button[title*="performance" i]').first();
if (await perfBtn.count()) {
  await perfBtn.click();
  await page.waitForTimeout(600);
  await shot('s5-perf-panel');
  const panelText = await page.locator('body').innerText();
  const hasToolPerf = /Tool Performance/i.test(panelText);
  const hasModelPerf = /Model Performance/i.test(panelText);
  const hasTotalCost = /Total Cost/i.test(panelText);
  const hasPerModel = /Per Model/i.test(panelText);
  const hasTokens = /\bTokens\b/i.test(panelText);
  const hasModelCol = /\bModel\b(?!.*Performance)/i.test(panelText);
  logs.push(`perf: Tool Performance=${hasToolPerf} Model Performance=${hasModelPerf} Total Cost=${hasTotalCost} Per Model=${hasPerModel} Tokens=${hasTokens}`);
} else {
  logs.push('FAIL s5: perf button not found');
}

logs.push(`--- errors (${errors.length}) ---`);
for (const e of errors) logs.push(e);

console.log(logs.join('\n'));
await browser.close();
