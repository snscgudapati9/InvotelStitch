# InvotelStitch — Restaurant & Bar Inventory

Full inventory + purchase + wastage + sales + owner-intelligence platform
for Tanah Kitchen & Bar. See in-app sidebar for the full module list
(Item Master, Purchases, Multi-Item Invoices, Stock, Daily Indent, Branch
Inventory, Food/Bar Costing, Wastage, Sales, Vendor Payables, Recurring
Payments, Bar Purchases/Inventory/Wastage, Cutlery, Settings).

## Run locally

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (usually http://localhost:5173).

## ⚠️ IMPORTANT — fixing "data shows zero when I share the live link"

If you deploy the site and share the URL, **every new visitor's browser
starts with empty local storage**. Unless the backend is baked into the
build, they'll see zero data until they manually paste the Google Sheets
URL into Settings themselves — which defeats the purpose of a shared app.

**Fix: set the backend URL as a build-time environment variable.**

1. Copy `.env.example` to `.env` and paste your Apps Script Web App URL:
   ```
   VITE_BACKEND_URL=https://script.google.com/macros/s/XXXX/exec
   ```
2. For local dev, this makes `npm run dev` connect automatically.
3. For the **live Vercel site**: go to your Vercel project → Settings →
   Environment Variables → add `VITE_BACKEND_URL` with the same value →
   redeploy. Now every visitor to your shared link connects to the same
   Google Sheet automatically, with no manual Settings step.

A person can still override this per-browser via Settings → Google Sheets
Backend if they ever need to point at a different sheet.

## Data storage: local vs. shared (Google Sheets backend)

By default (no `VITE_BACKEND_URL` set and nothing saved in Settings),
data is saved to that browser's `localStorage` only.

To set up the free Google Sheets backend from scratch:

1. Open `google-apps-script/Code.gs` — full step-by-step setup
   instructions are in the comment at the top (includes email sending
   via Gmail's MailApp, free, no per-transaction spam).
2. Follow those steps to create the Google Sheet, paste the script, and
   deploy it as a Web App. You'll get a URL ending in `/exec`.
3. Use that URL either via `VITE_BACKEND_URL` (recommended, see above)
   or paste it into Settings → Google Sheets Backend on one device.

The app is **offline-first**: every change saves to local storage
immediately regardless of connectivity, and syncs to the Google Sheet
in the background. If you're offline, changes queue up and sync
automatically the moment you're back online (see the banner at the top
of the app).

Note: Google Apps Script has usage quotas (fine for a single
restaurant's daily use) and is slightly slower than a real database
since every save/load is a network round-trip to Google. If you outgrow
it, migrating to a proper backend (Node/Postgres, Firebase, Supabase)
later is a drop-in replacement for just the `loadKey`/`saveKey`
functions in `src/App.jsx`.

## Access control

- **Team PIN** (Settings): a shared PIN gate so a random person with the
  link can't open the app. Not per-person accounts.
- **Logged in as + Role** (sidebar footer): every add/edit/delete
  requires a name to be set first (enforced app-wide), and is recorded
  in the activity log. Roles (Owner/Manager/Store Manager/Chef/Cashier)
  control which sidebar modules are visible — set in the same sidebar
  footer dropdown.
- Both are lightweight, no real authentication server — fine for a
  small trusted team, not for public/adversarial use.

## Owner Intelligence

The Dashboard's top panel surfaces plain-language observations computed
from your own data — no AI/ML service required: month-over-month
purchase cost trend, per-item wastage-rate trend, cheapest-vendor
comparison, and days-until-stockout projections. It appears once you
have enough real purchase/wastage/indent history to compare against.

## Known limitations / next steps

- Dish and cocktail recipes you add reference your real Item Master
  catalog — but if you haven't added fresh produce, meat, or liquor as
  items yet, add those first so recipes can reference them.
- Owner email notifications are live (Google Apps Script MailApp) but
  manual-trigger only (Settings → Send Test Email / Send Activity
  Digest, and Branch Inventory → Email Summary to Owner) — no automatic
  per-transaction email, to stay under Gmail's free daily send limit.
- Browser notifications (Settings → Browser Notifications) only fire
  while a tab is open — true push-to-phone (like WhatsApp) needs a paid
  messaging API later.
- Multi-Item Invoice and single-item Purchase entry are separate flows
  for now; Vendor Payables aggregates the single-item Purchase flow only.

## Tech stack

React + Vite + Tailwind + Recharts + lucide-react + xlsx + jsPDF.
