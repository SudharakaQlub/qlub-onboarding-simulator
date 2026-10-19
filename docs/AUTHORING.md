# Authoring training packs

A training pack is one JSON file. The app reads `public/packs/index.json`, then loads
`public/packs/<id>/pack.json` for each id listed. Types live in `src/training/types.ts`.

## Pack

```jsonc
{
  "id": "vendor-panel-basics",        // folder name, unique
  "title": "Vendor Panel basics",
  "product": "Vendor Panel",          // shown in the catalog
  "market": "AU",
  "version": "1.0.0",                 // bump when you re-capture after a UI change
  "description": "…",
  "modules": [ /* see below */ ],
  "faqs": [ /* see below */ ]
}
```

## Module

```jsonc
{
  "id": "payments",
  "title": "Payments & Refunds",
  "minutes": 8,
  "summary": "…",
  "lessons": [{ "id": "3B", "title": "Issue a refund" }],
  "steps":   [ /* in order */ ],
  "checks":  [ /* shown after the last step */ ]
}
```

Progress is stored per `packId/moduleId`, so don't rename ids after people have trained on them.

## Step

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Unique within the module, e.g. `3B.2` |
| `lesson` | yes | Lesson id. Quick help replays one lesson on its own |
| `title`, `instruction` | yes | Shown in the step card |
| `target` | no | `data-tour` id to highlight. Leave out for a centred info card |
| `advance` | yes | `click`: moves on when the trainee clicks the target. `next`: trainee presses Next |
| `page` | no | Navigate here when the step starts: `dashboard`, `orders`, `payments`, `tableView`, `training` |
| `period` | no | Set the date range: `today`, `yesterday`, `thisWeek`, `last7`, `thisMonth`, `last30` |
| `reset` | no | Close drawers/dialogs and clear filters. Use on the first step of each lesson |
| `note` | no | Highlighted tip or common mistake |
| `say` | no | What the voice assistant would say. "Listen" reads it aloud |

Tip: give the first step of every lesson `reset`, `page` and `period`, so the lesson also works when
replayed alone from Ask a question.

## Check question

```json
{ "question": "…", "options": ["A", "B", "C"], "answer": 1, "explain": "Right. …" }
```

`answer` is the index of the right option. `explain` shows once they pick it.

## FAQ (Ask a question)

```json
{ "q": "How do I refund a guest?", "a": "Short spoken-style answer.", "lesson": "payments/3B",
  "keywords": ["refund", "money back"] }
```

`lesson` is `moduleId/lessonId` and powers the "Show me on the panel" button.

## Targets

Open the app with `?targets=1` to outline every target on screen with its id. Current targets:

**Everywhere:** `nav-dashboard`, `nav-orders`, `nav-payments`, `nav-tableView`, `nav-reviews`,
`nav-reports`, `nav-loyalty`, `nav-myClub`, `nav-training`, `nav-settings`, `date-button`, `export-button`

**Time Settings drawer:** `time-settings`, `time-option-today|yesterday|thisWeek|last7|thisMonth|last30|custom`,
`time-confirm`

**Dashboard:** `filter-qr`, `filter-products`, `kpi-row`, `kpi-revenue`, `kpi-tips`, `kpi-refunds`,
`kpi-dinerfee`, `kpi-vendorfee`, `chart-tabs`, `tab-revenue`, `tab-tips`, `chart-day-YYYY-MM-DD`,
`card-split`, `popular-items`

**Orders:** `orders-table-search`, `orders-id-search`, `orders-status-filter`,
`orders-status-all|paid|partially-paid|voucher|loyalty`, `orders-table`, `orders-col-customer-paid`,
`orders-col-status`, `order-row-<orderId>`, `order-details-<orderId>`

**Order details:** `order-modal`, `order-payments`, `order-items`, `order-print`, `order-close`

**Payments:** `payments-search`, `payments-status-filter`, `payments-status-all|accepted|rejected|refunded`,
`payments-table`, `payments-col-status`, `payments-col-method`, `payment-row-<paymentId>`,
`payment-menu-<paymentId>`, `payment-print`, `payment-refund`

**Refund dialog:** `refund-dialog`, `refund-amount`, `refund-confirm`

**Table View:** `tableview-options`, `tableview-legend`, `table-tile-<orderId>`, `table-toggle-<orderId>`,
`table-details-<orderId>`, `table-remaining-<orderId>`

**Staff Training:** `who-card`, `name-input`, `name-continue`, `ask-box`, `ask-input`, `team-progress`

Demo order ids are in `src/data/demoVenue.ts` (e.g. `7159271922` = table 2, partially paid;
`5551688701` = Table 1, Visa 4242).

## Adding a new screen

To train on something the mock doesn't have yet (Customer App, SoftPOS…), add a page under
`src/pages/`, register it in `App.tsx` and `Sidebar.tsx`, and put `data-tour="…"` on anything a step should
point at. From then on, trainings for it are JSON only.
