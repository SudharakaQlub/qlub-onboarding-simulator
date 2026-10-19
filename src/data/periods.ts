import { CURRENCY, DEMO_NOW, type Payment } from './demoVenue'

export type PeriodKey = 'today' | 'yesterday' | 'thisWeek' | 'last7' | 'thisMonth' | 'last30' | 'custom'

export interface Period {
  key: PeriodKey
  start: string // YYYY-MM-DD business day, inclusive
  end: string
}

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  last7: 'Last 7 Days',
  thisMonth: 'This Month',
  last30: 'Last 30 Days',
  custom: 'Custom',
}

const pad = (n: number) => String(n).padStart(2, '0')
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parseYmd = (s: string) => new Date(`${s}T12:00:00`)
export function addDays(s: string, n: number) {
  const d = parseYmd(s)
  d.setDate(d.getDate() + n)
  return ymd(d)
}

/** A venue's business day runs 03:00 to 02:59 the next morning. */
export function businessDay(iso: string) {
  const d = new Date(iso)
  if (d.getHours() < 3) d.setDate(d.getDate() - 1)
  return ymd(d)
}

export function periodFor(key: PeriodKey, custom?: { start: string; end: string }): Period {
  const t = ymd(DEMO_NOW)
  switch (key) {
    case 'today':
      return { key, start: t, end: t }
    case 'yesterday':
      return { key, start: addDays(t, -1), end: addDays(t, -1) }
    case 'thisWeek': {
      const dow = (DEMO_NOW.getDay() + 6) % 7 // Monday = 0
      return { key, start: addDays(t, -dow), end: t }
    }
    case 'last7':
      return { key, start: addDays(t, -7), end: t }
    case 'thisMonth':
      return { key, start: `${t.slice(0, 8)}01`, end: t }
    case 'last30':
      return { key, start: addDays(t, -30), end: t }
    case 'custom':
      return { key, start: custom?.start ?? addDays(t, -7), end: custom?.end ?? t }
  }
}

export const inPeriod = (iso: string, p: Period) => {
  const d = businessDay(iso)
  return d >= p.start && d <= p.end
}

export function daysOf(p: Period, minDays = 7) {
  let start = p.start
  const span = Math.round((parseYmd(p.end).getTime() - parseYmd(p.start).getTime()) / 864e5) + 1
  if (span < minDays) start = addDays(p.end, -(minDays - 1))
  const out: string[] = []
  for (let d = start; d <= p.end; d = addDays(d, 1)) out.push(d)
  return out
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const shortDay = (s: string) => `${s.slice(8)} ${MONTHS[Number(s.slice(5, 7)) - 1]}`
export const rangeLabel = (p: Period) =>
  p.start === p.end ? shortDay(p.start) : `${shortDay(p.start)} – ${shortDay(p.end)}`

export const money = (n: number) => `${CURRENCY} ${n.toFixed(2)}`
export const round2 = (n: number) => Math.round(n * 100) / 100

export function formatDateTime(iso: string) {
  const d = new Date(iso)
  let h = d.getHours()
  const ampm = h >= 12 ? 'pm' : 'am'
  h = h % 12 || 12
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()} ${pad(h)}:${pad(d.getMinutes())} ${ampm}`
}

export interface Figures {
  revenue: number
  tips: number
  refunds: number
  dinerFee: number
  vendorFee: number
  loyalty: number
  /** qlub wallet payments are settled separately, so they're not in the receivable. */
  wallet: number
  /** What qlub pays the venue: ReceivableFromQlub in the export, less refunds. */
  receivable: number
  payments: number
  orders: number
}

/** Revenue = card and wallet bill payments; loyalty credit and rejected payments are excluded. */
export function figuresFor(payments: Payment[], p: Period): Figures {
  const ps = payments.filter((x) => inPeriod(x.time, p) && x.status !== 'Rejected')
  const sum = (xs: Payment[], f: (x: Payment) => number) => round2(xs.reduce((s, x) => s + f(x), 0))
  const card = ps.filter((x) => x.method !== 'Loyalty')
  const refunds = sum(ps, (x) => x.refunded)
  return {
    revenue: sum(card, (x) => x.paid),
    tips: sum(ps, (x) => x.tip),
    refunds,
    dinerFee: sum(ps, (x) => x.dinerFee),
    vendorFee: sum(ps, (x) => x.commission),
    loyalty: sum(ps.filter((x) => x.method === 'Loyalty'), (x) => x.paid),
    wallet: sum(ps.filter((x) => x.method === 'qlubcardwallet'), (x) => x.paid + x.tip - x.commission),
    receivable: round2(sum(ps, (x) => x.receivable) - refunds),
    payments: ps.length,
    orders: new Set(ps.map((x) => x.orderId)).size,
  }
}
