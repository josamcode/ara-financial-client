# ARA Financial Frontend

React 18 + Vite frontend for ARA Financial.

## Stack

- React 18
- Vite
- React Router
- TanStack Query
- i18next / react-i18next
- Tailwind CSS
- Axios
- React Hook Form + Zod
- lucide-react icons

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
npm run build
```

The dev server is provided by Vite. Configure API access through `.env` using the existing
environment variables in `.env.example`.

`npm run verify` currently runs the production build because no lint/check tooling is configured.

## Current Route Surface

- Auth: login, register, forgot/reset password, accept invite
- Setup: 5-step tenant onboarding wizard
- Accounting: dashboard, chart of accounts, journal entries, ledger
- Reports: trial balance, income statement, balance sheet, cash flow, AR aging, AP aging
- Admin: users, fiscal periods, audit logs, settings
- AR/AP: customers, suppliers, invoices, bills, statements, print pages

## Important Entry Points

- `src/App.jsx`
- `src/app/router/index.jsx`
- `src/app/providers/`
- `src/app/i18n/`
- `src/widgets/AppSidebar/index.jsx`
- `src/shared/api/client.js`

## Notes

- The product is Arabic-first and RTL-aware.
- Route-level auth and permission guards are implemented through `ProtectedRoute`.
- The frontend contains AR/AP screens, but tax, multi-currency, SaaS billing, and advanced workflow features are not complete roadmap items yet.
