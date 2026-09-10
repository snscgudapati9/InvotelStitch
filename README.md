# InvotelStitch — Restaurant & Bar Inventory

Full inventory management app for Tanah Kitchen & Bar covering:
Item Master (274 real items, edit/delete/search/category filter/price
tracking), Purchases + Vendor Payments (GST/Invoice), Bar Purchases,
Stock Inventory (Opening/Purchases/Indented/In-Hand/Physical Count/
Variance — matches the original Excel Stock_Balance sheet), Daily Indent
(Store -> Kitchen/Bar, with Indent Value), Branch Inventory + Monthly
Stock Take snapshot, Food Costing, Breakage/Wastage, Sales with
recipe-based auto stock deduction, Vendor Payables (overall / monthly /
yearly + yearly business volume), Recurring Payments (rent, salaries,
utilities, AMC, licenses), Bar Inventory / Costing / Wastage, Cutlery &
Crockery, and Owner Mail Settings.

Every report exports as CSV, XLS, or PDF. Deletes ask for confirmation
first. The UI is mobile-responsive (hamburger menu on small screens).

## Run locally

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (usually http://localhost:5173).

## Data storage: local vs. shared (Google Sheets backend)

By default, data is saved to your browser's `localStorage` — it survives
refreshes and restarts, but stays on that one computer/browser only.

To share data across every device your team uses (a free "backend" with
no cost and no server to run), you can connect the app to a Google Sheet:

1. Open the `google-apps-script/Code.gs` file in this project — it has
   full step-by-step setup instructions in the comment at the top.
2. Follow those steps to create the Google Sheet, paste the script, and
   deploy it as a Web App. You'll end up with a URL ending in `/exec`.
3. In the app, go to **Settings -> Google Sheets Backend**, paste that
   URL, and click **Save & Connect**. Refresh the page once.
4. From then on, every device that opens the app with the same URL saved
   in Settings reads/writes the same Google Sheet.

Note: Google Apps Script has usage quotas (fine for a single restaurant's
daily use) and is slightly slower than a real database since every
save/load is a network round-trip to Google. If you outgrow it, migrating
to a proper backend (Node/Postgres, Firebase, Supabase) later is a drop-in
replacement for just the `loadKey`/`saveKey` functions in `src/App.jsx`.

## Known limitations / next steps

- Dish and cocktail recipes still reference the original demo ingredient
  names (e.g. "Basmati Rice", "Chicken"), not the real 274-item catalog —
  the real catalog is dry-store/kirana items only (no fresh produce, meat,
  or liquor), so add those as new Item Master items first, then remap the
  recipes for accurate auto-deduction.
- No login/user roles yet — anyone with the app URL can edit everything.
- Owner email notifications are a UI placeholder — wiring real sending
  needs an email service (SendGrid, AWS SES) or a Google Apps Script
  `MailApp` trigger added to the backend script above.
- Bar Purchases are separate from the main Vendor Payables report for now.

## Tech stack

React + Vite + Tailwind + Recharts + lucide-react + xlsx + jsPDF.
