# TaxBombAI — Web Demo

A single-file, no-build interactive demo. Open `index.html` directly in a
browser, or serve it statically (GitHub Pages works well since the repo
already uses that pattern for the Prince Financial Solutions tools site).

The calculation logic here is duplicated in plain browser JS (no bundler)
so the page has zero build step. It mirrors `src/calculator.js` and
`src/rmdTable.js` — if you change the methodology in the library, update
both, or open an issue to convert this to a bundled build that imports
the library directly.

The page explains its own output in two tiers. A "What this means" summary
is always shown, generated entirely client-side by plain JS templating over
the computed schedule — no API key, no network call, no AI involved. Below
that, an optional "Get a deeper AI explanation" section calls the Anthropic
API directly from the browser using a user-pasted API key (never stored,
never sent anywhere but Anthropic) for a more nuanced, conversational
explanation. This two-tier design means the page is fully useful with zero
setup; the AI call is a genuine bonus, not a gate. Direct browser-to-API
calls are fine for a public demo but aren't how you'd want to ship a real
product — a real deployment should proxy that call through a small backend
so the API key never touches the client.

## Deploying

**GitHub Pages (matches the existing financial-tools deployment pattern):**
```bash
# from repo root
git subtree push --prefix web origin gh-pages
```
Or simplest: enable Pages on the repo, set source to `/web` on `main`.
