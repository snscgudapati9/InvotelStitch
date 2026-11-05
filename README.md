# InvotelStitch — Restaurant & Bar Inventory

## Run locally
    npm install
    npm run dev

## Deploy (Vercel + GitHub)
index.html, package.json, vite.config.js and src/ must be at the ROOT of the
GitHub repo (not inside an extra nested folder) or Vercel fails with
"Rollup failed to resolve import /src/main.jsx".

## Shared data
Set VITE_BACKEND_URL (see .env.example) locally and in Vercel -> Environment
Variables, then redeploy, so every visitor connects to the same Google Sheet.
Backend setup steps are at the top of google-apps-script/Code.gs.
After editing Code.gs: Deploy -> Manage deployments -> Edit -> New version.
