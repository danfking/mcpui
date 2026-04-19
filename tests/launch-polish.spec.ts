import { test, expect } from '@playwright/test';

test.describe('launch polish (#414, #415)', () => {
    test('landing page defaults to dark theme on a clean context', async ({ browser }) => {
        // Fresh context = no localStorage
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('/');

        const theme = await page.evaluate(() =>
            document.documentElement.getAttribute('data-theme'),
        );
        expect(theme).toBe('dark');

        await context.close();
    });

    test('node header delete button removes the row without a confirm dialog', async ({ page }) => {
        let dialogShown = false;
        page.on('dialog', async (d) => {
            dialogShown = true;
            await d.dismiss();
        });

        await page.goto('/');

        const exploreBtns = page.locator('#server-buttons .card-action');
        try {
            await exploreBtns.first().waitFor({ state: 'visible', timeout: 30_000 });
        } catch {
            test.skip(true, 'MCP servers not connected in time');
            return;
        }
        await exploreBtns.first().click();
        await page.waitForSelector('.burnish-node', { timeout: 10_000 });

        const before = await page.locator('.burnish-node').count();
        expect(before).toBeGreaterThanOrEqual(1);

        await page.locator('.burnish-node-delete').first().click();

        // Wait for the row to be removed (no dialog needed)
        await expect(page.locator('.burnish-node')).toHaveCount(before - 1, {
            timeout: 5_000,
        });
        expect(dialogShown).toBe(false);
    });
});
