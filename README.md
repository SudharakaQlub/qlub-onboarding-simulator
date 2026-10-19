# qlub Onboarding Simulator

Ops Hackathon 2026. A mock qlub Vendor Panel with a **Staff Training** tab: new staff learn by doing,
following guided steps on the real panel screens, then answer check questions. Trained staff can ask a
question and get walked through the answer on screen.

Internal demo only. Runs entirely on mock data for the "AU Diner Demo" venue. No customer or production data.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm start          # serve dist/ on $PORT (used by Railway)
```

## Demo script

1. **Staff Training** opens first. Type a new name (e.g. "Nimal") and press Continue: a personal plan with 3 modules.
2. **Start: Dashboard.** The panel dims, a red box highlights what to click, and the card explains why.
   Steps advance when you click the highlighted item (or press Next on "read this" steps).
3. After each module: check questions from the training deck. A wrong answer explains and lets you retry.
4. Back on Staff Training the module is ticked, and **Team progress** (manager view) updates.
5. Pick **Ali** (already trained): the page leads with **Ask a question**. Type "guest wants money back"
   → "How do I refund a guest?" → **Show me on the panel** replays just the refund lesson.
6. "Reset demo progress" under Team progress restores the seeded staff.

## How it's built

- React 18 + TypeScript + Vite. No backend; progress is kept in the browser (localStorage).
- `src/pages/*`: mock Vendor Panel screens (Dashboard, Orders, Payments, Table View) on demo data in
  `src/data/demoVenue.ts`. Last 30 Days figures match the training deck ($2,001.79 revenue, $185.55 tips,
  $48.70 diner fee, $57.54 vendor fee).
- `src/training/TourOverlay.tsx`: the guided-tour engine (spotlight, step card, click-to-advance, checks).
- `public/packs/*`: **training content as JSON**. The app loads every pack listed in `public/packs/index.json`.

## Adding a training (no code changes)

1. Create `public/packs/<pack-id>/pack.json` (copy `vendor-panel-basics/pack.json` as a template).
2. Add `<pack-id>` to `"packs"` in `public/packs/index.json`.
3. Refresh. The pack appears in the catalog, its modules join every trainee's plan, and its FAQs join
   **Ask a question**.

Each step points at a `data-tour` target on screen. Open the app with **`?targets=1`** to see every target
on the current screen outlined with its id. Full format and target list: [docs/AUTHORING.md](docs/AUTHORING.md).

New screens (e.g. Customer App, SoftPOS) need a mock page with `data-tour` attributes first; after that,
their trainings are JSON only.

## Deploying (Qlub Apps)

Per the Qlub Apps rules: repo under `github.com/qlubapps`, deploy on Qlub's Railway account, served at
`<name>.qlubapps.com`, and run the `clubpay/ai-builder-skills` security checks before sharing.
Railway settings: build `npm ci && npm run build`, start `npm start` (it binds to `$PORT`).

## Not done yet

- Voice agent (speech in/out + Claude). Steps already carry a `say` line, and "Listen" reads it aloud
  with the browser's voice as a placeholder.
- The refund dialog is a concept screen (the real one wasn't captured; needs a manager login).
- Payout formula and Table View colours still need Finance / Product confirmation (flagged in the steps).
