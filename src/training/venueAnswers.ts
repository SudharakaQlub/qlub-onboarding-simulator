// Answers questions about this venue's own numbers from the demo data, without an AI model.
// Every answer can open the panel on the screen and filters that prove it ("Open in panel").
// The voice agent can later call the same functions as tools.

import { DATA_FROM, POPULAR_ITEMS, type Payment } from '../data/demoVenue'
import { summarize } from '../data/orders'
import { addDays, businessDay, figuresFor, inPeriod, money, periodFor, round2, shortDay, ymd, type Period, type PeriodKey } from '../data/periods'
import { DEMO_NOW } from '../data/demoVenue'
import { matches } from '../pages/Payments'
import type { PanelPreset } from '../store'

export interface VenueAnswer {
  text: string
  lines?: Array<[string, string]>
  note?: string
  open?: PanelPreset & { label: string }
}

interface Range {
  label: string
  period: Period
  preset: { key: PeriodKey; start?: string; end?: string }
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const pad = (n: number) => String(n).padStart(2, '0')

function custom(label: string, start: string, end: string): Range {
  return { label, period: periodFor('custom', { start, end }), preset: { key: 'custom', start, end } }
}
function preset(key: PeriodKey, label: string): Range {
  return { label, period: periodFor(key), preset: { key } }
}

/** Finds a time period in the question. Defaults to the last 30 days (all the demo data). */
export function parsePeriod(q: string): Range {
  const today = ymd(DEMO_NOW)
  if (/\btoday|tonight\b/.test(q)) return preset('today', 'today')
  if (/\byesterday|last night\b/.test(q)) return preset('yesterday', 'yesterday')
  if (/\blast week\b/.test(q)) {
    const dow = (DEMO_NOW.getDay() + 6) % 7
    const mon = addDays(today, -dow - 7)
    return custom('last week', mon, addDays(mon, 6))
  }
  if (/\bthis week\b/.test(q)) return preset('thisWeek', 'this week')
  if (/\b(last|past) 7 days\b/.test(q)) return preset('last7', 'in the last 7 days')
  if (/\bthis month\b/.test(q)) return preset('thisMonth', 'this month')
  const dayMonth = q.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/) ||
    q.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\b/)
  if (dayMonth) {
    const [a, b] = /^\d/.test(dayMonth[1]) ? [dayMonth[1], dayMonth[2]] : [dayMonth[2], dayMonth[1]]
    const m = MONTHS.findIndex((x) => x.startsWith(b)) + 1
    const d = `${DEMO_NOW.getFullYear()}-${pad(m)}-${pad(Number(a))}`
    return custom(`on ${shortDay(d)}`, d, d)
  }
  if (/\blast month\b/.test(q)) {
    const m = DEMO_NOW.getMonth() // previous month index (0-based) + 1 = this
    const start = `${DEMO_NOW.getFullYear()}-${pad(m)}-01`
    const end = ymd(new Date(DEMO_NOW.getFullYear(), m, 0))
    return custom(`in ${MONTHS[m - 1][0].toUpperCase()}${MONTHS[m - 1].slice(1)}`, start, end)
  }
  const month = MONTHS.findIndex((m) => new RegExp(`\\b${m}\\b`).test(q))
  if (month >= 0) {
    const start = `${DEMO_NOW.getFullYear()}-${pad(month + 1)}-01`
    const end = ymd(new Date(DEMO_NOW.getFullYear(), month + 1, 0))
    const name = MONTHS[month][0].toUpperCase() + MONTHS[month].slice(1)
    return custom(`in ${name}`, start, end > today ? today : end)
  }
  return preset('last30', 'in the last 30 days')
}

const sum = (xs: Payment[], f: (x: Payment) => number) => round2(xs.reduce((s, x) => s + f(x), 0))
const cap = (s: string) => s[0].toUpperCase() + s.slice(1)
const table = (name: string) => (/^table/i.test(name) ? name : `Table ${name}`)
const brand = (m: string) => (m === 'qlubcardwallet' ? 'qlub wallet' : m)

export function answerVenue(raw: string, payments: Payment[]): VenueAnswer | null {
  const q = ` ${raw.toLowerCase().replace(/[?!]/g, ' ')} `
  const r = parsePeriod(q)
  const inR = payments.filter((p) => inPeriod(p.time, r.period) && p.status !== 'Rejected')
  const orders = summarize(payments)
  const range = (key = r) => ({ period: key.preset })

  // 1. A specific order, by its 10-digit ID.
  const oid = q.match(/\b(\d{10})\b/)
  if (oid) {
    const o = orders.find((x) => x.id === oid[1])
    if (!o) return { text: `I can't find order ${oid[1]}. Check the digits on the receipt.` }
    return {
      text: `Order ${o.id} is ${table(o.tableName)}'s bill from ${shortDay(businessDay(o.time))}: ${money(o.bill)}. ${
        o.remaining > 0 ? `${money(o.paid + o.loyalty)} paid so far, ${money(o.remaining)} still owed.` : 'Fully paid.'
      }`,
      lines: o.payments.map((p) => [`${p.time.slice(11)} · ${brand(p.method)} ${p.last4}`, `${money(p.paid + p.tip + p.dinerFee)} ${p.status}`]),
      open: { label: 'Open the order', page: 'orders', period: { key: 'last30' }, orderId: o.id },
    }
  }

  // 2. A guest's card, by its last 4 digits.
  const card = q.match(/(?:ending|last ?4|last four|digits|card)\D{0,12}(\d{4})\b/) || q.match(/^\s*(\d{4})\s*$/)
  if (card) {
    const xs = inR.filter((p) => p.last4 === card[1])
    if (!xs.length) return { text: `No payments from a card ending ${card[1]} ${r.label}. Check the digits, or try a wider date range.` }
    return {
      text: `${xs.length} payment${xs.length > 1 ? 's' : ''} from the ${brand(xs[0].method)} ending ${card[1]} ${r.label}, ${money(sum(xs, (x) => x.paid + x.tip + x.dinerFee))} in total.`,
      lines: xs.slice(0, 5).map((p) => [`${shortDay(businessDay(p.time))} · order ${p.orderId}`, money(p.paid + p.tip + p.dinerFee)]),
      open: { label: 'Show in Payments', page: 'payments', ...range(), paymentsQuery: card[1] },
    }
  }

  // 3. An amount the guest quotes.
  const amt = q.match(/\$\s?(\d+(?:\.\d{1,2})?)/) || q.match(/\b(?:paid|charged|amount|of)\s+(\d+\.\d{2})\b/)
  if (amt) {
    const xs = inR.filter((p) => matches(p, amt[1]))
    if (!xs.length)
      return { text: `No payment of ${money(Number(amt[1]))} ${r.label}. Guests often quote the total with the tip: try that amount, or their card's last 4 digits.` }
    const p = xs[0]
    return {
      text: `Found ${xs.length === 1 ? 'it' : `${xs.length} payments`}: ${money(p.paid + p.tip + p.dinerFee)} by ${brand(p.method)} ${p.last4}, order ${p.orderId}, ${shortDay(businessDay(p.time))}.`,
      open: { label: 'Show in Payments', page: 'payments', ...range(), paymentsQuery: amt[1] },
    }
  }

  // 4. Tables that still owe money.
  if (/\b(owe|owing|outstanding|unpaid|partially|part paid|part-paid|open bills?|still to pay|remaining)\b/.test(q)) {
    const xs = orders.filter((o) => o.remaining > 0 && inPeriod(o.time, r.period))
    if (!xs.length) return { text: `Nothing is still owed ${r.label}. Every bill is fully paid.` }
    return {
      text: `${xs.length} bill${xs.length > 1 ? 's' : ''} ${r.label} still owe${xs.length > 1 ? '' : 's'} ${money(xs.reduce((s, o) => s + o.remaining, 0))}.`,
      lines: xs.map((o) => [`${table(o.tableName)} · ${shortDay(businessDay(o.time))}`, `${money(o.remaining)} left`]),
      note: 'Older part-paid bills may have been settled at the POS. Check with your manager.',
      open: { label: 'Show in Orders', page: 'orders', ...range(), ordersStatus: 'Partially Paid' },
    }
  }

  const f = figuresFor(payments, r.period)

  // 5. Payout.
  if (/\b(payout|paid out|pay ?out|receivable|settle|settlement|will we (be|get) paid|owe us|transfer)\b/.test(q)) {
    return {
      text: `qlub owes the venue ${money(f.receivable)} ${r.label}.`,
      lines: [
        ['Revenue', money(f.revenue)],
        ['+ Tips', money(f.tips)],
        ['+ Loyalty credit', money(f.loyalty)],
        ['− Vendor Fee', money(f.vendorFee)],
        ...(f.refunds ? [['− Refunds', money(f.refunds)] as [string, string]] : []),
        ...(f.wallet ? [['− qlub wallet (settled separately)', money(f.wallet)] as [string, string]] : []),
      ],
      note: `The diner fee (${money(f.dinerFee)}) goes to qlub. Settlement dates: confirm with Finance.`,
      open: { label: 'Show the payout', page: 'dashboard', ...range(), payoutOpen: true },
    }
  }

  // 6. Tips.
  if (/\btips?\b|\bgratuit/.test(q)) {
    const withTip = inR.filter((p) => p.tip > 0)
    const top = [...withTip].sort((a, b) => b.tip - a.tip)[0]
    return {
      text: `Tips ${r.label}: ${money(f.tips)}. ${withTip.length} of ${inR.filter((p) => p.method !== 'Loyalty').length} card payments included a tip, about ${f.revenue ? ((f.tips / f.revenue) * 100).toFixed(1) : 0}% of revenue.`,
      note: top ? `Biggest: ${money(top.tip)} on ${shortDay(businessDay(top.time))}.` : undefined,
      open: { label: 'Show on the Dashboard', page: 'dashboard', ...range() },
    }
  }

  // 7. How guests paid (card brands).
  if (/\b(card|cards|brand|visa|mastercard|amex|wallet|how did (guests|people|they) pay|payment methods?|split)\b/.test(q)) {
    const by: Record<string, Payment[]> = {}
    inR.forEach((p) => (by[brand(p.method)] = [...(by[brand(p.method)] ?? []), p]))
    const rows = Object.entries(by).sort((a, b) => sum(b[1], (x) => x.paid) - sum(a[1], (x) => x.paid))
    if (!rows.length) return { text: `No payments ${r.label}.` }
    const day = r.period.start === r.period.end ? r.period.start : undefined
    return {
      text: `How guests paid ${r.label}:`,
      lines: rows.map(([k, xs]) => [`${k} · ${xs.length} payment${xs.length > 1 ? 's' : ''}`, money(sum(xs, (x) => x.paid))]),
      open: day
        ? { label: 'Show the card split', page: 'dashboard', period: { key: 'last30' }, day }
        : { label: 'Show in Payments', page: 'payments', ...range() },
    }
  }

  // 8. Average bill / spend.
  if (/\b(average|avg|per (table|bill|guest)|typical)\b/.test(q)) {
    const os = orders.filter((o) => inPeriod(o.time, r.period))
    if (!os.length) return { text: `No bills ${r.label}.` }
    return {
      text: `${os.length} bills ${r.label}. Average bill ${money(os.reduce((s, o) => s + o.bill, 0) / os.length)}, average payment ${money(sum(inR, (x) => x.paid + x.tip + x.dinerFee) / inR.length)} including tip and fees.`,
      open: { label: 'Show in Orders', page: 'orders', ...range() },
    }
  }

  // 9. Best sellers.
  if (/\b(popular|best ?sell|top (items?|sellers?|dishes)|sell(s|ing)? (the )?most|most (sold|ordered))\b/.test(q)) {
    return {
      text: `Top sellers this month: ${POPULAR_ITEMS.slice(0, 3).map(([n, c]) => `${n} (${c} sold)`).join(', ')}.`,
      note: 'From the Dashboard’s Popular Items.',
      open: { label: 'Show Popular Items', page: 'dashboard', ...range() },
    }
  }

  // 10. Busiest day.
  if (/\b(busiest|best day|biggest day)\b/.test(q)) {
    const by: Record<string, number> = {}
    inR.filter((p) => p.method !== 'Loyalty').forEach((p) => (by[businessDay(p.time)] = (by[businessDay(p.time)] ?? 0) + p.paid))
    const [d, v] = Object.entries(by).sort((a, b) => b[1] - a[1])[0] ?? []
    if (!d) return { text: `No payments ${r.label}.` }
    return {
      text: `The busiest day ${r.label} was ${shortDay(d)}, with ${money(v)} in revenue.`,
      open: { label: 'Show on the chart', page: 'dashboard', period: { key: 'last30' }, day: d },
    }
  }

  // 11. Takings / revenue.
  if (/\b(revenue|takings|take|took|sales|sold|made|make|earn|earned|turnover|money|how much|figures|numbers|performance)\b/.test(q)) {
    if (!f.payments) {
      const before = r.period.end < DATA_FROM
      return { text: before ? `The demo data starts on ${shortDay(DATA_FROM)}.` : `No payments ${r.label}. The last payment was on ${shortDay(businessDay(payments[0].time))}.` }
    }
    return {
      text: `${cap(r.label)} the venue took ${money(f.revenue)} in revenue, plus ${money(f.tips)} in tips, across ${f.orders} bill${f.orders > 1 ? 's' : ''}.`,
      lines: [
        ['Revenue', money(f.revenue)],
        ['Tips', money(f.tips)],
        ['Diner Fee (to qlub)', money(f.dinerFee)],
        ['Vendor Fee', money(f.vendorFee)],
      ],
      open: { label: 'Show on the Dashboard', page: 'dashboard', ...range() },
    }
  }

  return null
}

export const DATA_QUESTIONS = [
  'What did we take last week?',
  'Which tables still owe money?',
  'What will we be paid for the last 30 days?',
  'Payments from the card ending 4242',
  'How did guests pay on 29 Sep?',
  'What were tips this month?',
]
