# Project Handoff: Chameleon Finance

Updated: 2026-06-16

## Snapshot

- Repo: `https://github.com/KunanonJ/chameleon-finance.git`
- Branch: `main`
- Cloudflare Pages project: `chameleon-finance`
- Production URL: `https://chameleon-finance.pages.dev`

## Product Positioning

Chameleon is a local-first finance and subscription tracker with dashboards, budgets,
Google Sheets import/sync, and optional Cloudflare backup.

Current app-facing copy should stay focused on:

- finance records
- subscriptions and renewals
- budgets and trends
- dashboard visualizations
- Google Sheets sync
- Cloudflare backup

## Existing Important Behavior

- Finance Google Sheets import respects the `gid` from the connected sheet URL.
- If no `gid` is found in the URL, finance sync falls back to `Sheet1`.
- Column mapping for finance import is header-based, not fixed-index.
- Cloudflare runtime helpers prefer current binding names and keep legacy fallbacks.

Key files for sync and backup logic:

- `src/features/finance/useFinanceSheetsSync.js`
- `src/features/sync/sheetsApi.js`
- `src/shared/lib/serverStorage.js`
- `functions/api/_lib/bindings.js`
- `functions/api/db/backup.js`
- `functions/api/r2/_middleware.js`

## Verification Checklist

Run before deploy:

```bash
npm test
npm run build
```

Run Playwright when user-facing flows change:

```bash
npm run test:e2e
```

## Deploy Runbook

```bash
npm run build
CLOUDFLARE_ACCOUNT_ID=187ab61ed9dbc6e616cb23e6b95aa8f1 \
npx wrangler pages deploy dist --project-name=chameleon-finance --commit-dirty=true
```
