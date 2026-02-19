# Chameleon Finance Builder

Chameleon is an AI-assisted, no-code-style finance app builder focused on budgeting, subscription tracking, and dashboard reporting.

- Production: [https://chameleon-finance.pages.dev](https://chameleon-finance.pages.dev)
- Stack: React, Vite, Zustand, Recharts, Cloudflare Pages Functions

## Product Direction (Base44 PRD Alignment)

This project is now aligned to the Base44-style product direction: natural-language driven app building, dashboard-first analytics, and iterative feature expansion.

### Implemented Today

- Finance tracker with CRUD records (income and expense)
- Subscription tracker with reminders and trends
- Dashboard visualizations: Bar, Line, Pie, Area, Treemap, Sankey
- Google Sheets sync with header-based mapping
- Finance import that respects sheet `gid` from connected Google Sheets URLs
- Local storage with optional cloud backup/restore via Cloudflare endpoints

### In Progress / Next Phase

- Builder Chat (prompt-to-app workflow planner)
- Discussion Mode (sandboxed planning before applying changes)
- Expanded add-ons and integrations management
- Richer app-management layer (versioning/test dashboard/workflow builder)

## Core Features

### Finance Tracker

- Add, edit, delete records
- Record type support (Income, Utility, Loan, Credit Card)
- Summary cards and monthly overview
- Bank statement file import (`.csv/.tsv/.txt`) with normalization and dedupe
- Brand icon detection via domain (logo service)

### Subscription Tracker

- Add/edit/delete subscriptions
- Monthly/yearly cost overview
- Upcoming renewals
- Trend and category visualizations

### Sync + Data

- Google Sheets pull sync
- JSON import/export
- Local-first persistence via browser storage
- Optional cloud backup and restore

## Google Sheets Sync

No API key is required when sheets are shared as **Anyone with the link can view**.

Expected tabs:

- `Subscriptions`
- `Budget`
- `Trends`
- Finance tab:
  - if the connected sheet URL includes `gid`, that tab is used
  - otherwise, fallback tab is `Sheet1`

Finance template:

- [https://docs.google.com/spreadsheets/d/1zhSnlIoqUSCkPMOCPT711rnsaIEDHhCjnBHixnBzXeo/copy](https://docs.google.com/spreadsheets/d/1zhSnlIoqUSCkPMOCPT711rnsaIEDHhCjnBHixnBzXeo/copy)

## Local Development

```bash
git clone https://github.com/KunanonJ/abdull-finance.git
cd abdull-finance
npm install
npm run dev
```

Open `http://localhost:5173`.

## Testing

```bash
npm test
npm run test:e2e
```

## Cloudflare Deploy

```bash
npm run build
CLOUDFLARE_ACCOUNT_ID=187ab61ed9dbc6e616cb23e6b95aa8f1 \
npx wrangler pages deploy dist --project-name=chameleon-finance --commit-dirty=true
```

## Runtime Bindings

- `LOGO_DEV_API_TOKEN`
- `R2_BUCKET`
- D1 binding for DB backup endpoint (preferred `USER_DB`, also supports `DB` and `ABDULL_DB`)

## Key Paths

- `/Users/kunanonjarat/Desktop/subgrid/src/App.jsx`
- `/Users/kunanonjarat/Desktop/subgrid/src/features/finance/useFinanceSheetsSync.js`
- `/Users/kunanonjarat/Desktop/subgrid/src/features/sync/sheetsApi.js`
- `/Users/kunanonjarat/Desktop/subgrid/src/shared/lib/serverStorage.js`
- `/Users/kunanonjarat/Desktop/subgrid/AI_HANDOFF.md`
