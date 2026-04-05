import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 120_000,
    use: {
        baseURL: 'http://localhost:3000',
    },
    webServer: process.env.CI ? {
        command: 'pnpm --filter demo dev',
        url: 'http://localhost:3000',
        reuseExistingServer: false,
        timeout: 30_000,
        env: {
            LLM_BACKEND: 'none',
        },
    } : undefined,
});
