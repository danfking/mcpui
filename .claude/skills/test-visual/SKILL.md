---
name: test-visual
description: Run visual regression tests with Playwright screenshots and vision analysis
disable-model-invocation: true
allowed-tools: Bash Read Write Glob
argument-hint: "[area: grid|text|components|states|responsive|all]"
---

# Visual Regression Testing

Run Playwright screenshots and analyze for visual defects in the Burnish UI.

## Prerequisites
- Server must be running at http://localhost:3000
- Playwright installed: `npx playwright install chromium`
- **All tests run headless. Never use --headed.**

## Test Areas

### grid
Card and section grid layout at multiple viewport widths (1920, 1280, 1024, 768, 480px).
Check: multi-column grid on desktop, single column on mobile, no full-width cards in sections.

### text
Text overflow, clipping, and truncation issues.
Check: long titles wrap, body text doesn't overflow cards, breadcrumb truncates, meta values visible.

### components
Each burnish-* component renders correctly with proper structure.
Check: stat-bar chips aligned, cards have status bars, tables have headers, sections have chevrons.

### states
Interactive states: empty, streaming, complete, collapsed, expanded.
Check: progress indicators during streaming, clean collapse/expand, proper button states.

### responsive
Exact responsive breakpoints: 1025/1024px, 769/768px, 481/480px, 375px.
Check: sidebar collapses at 1024, grid single-column at 768, compact layout at 480.

### all
Run all areas above.

## Workflow
1. Write Playwright test for the specified area in `tests/visual/`
2. Run tests (headless), save screenshots to `tests/visual/screenshots/`
3. Read each screenshot with vision and analyze for defects
4. For each defect found, create a GitHub issue:
   ```bash
   gh issue create --title "bug: [description]" --label "bug,priority:high" --body "[details]"
   ```
5. Report findings as a summary table: | Test | Screenshot | Status | Details | Issue |

## Target Area: $ARGUMENTS
