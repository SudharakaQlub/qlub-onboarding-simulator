import { ORDERS, type Order, type Payment } from './demoVenue'
import { round2 } from './periods'

export interface OrderSummary extends Order {
  paid: number // card + wallet
  tip: number
  dinerFee: number
  customerPaid: number
  remaining: number
  loyalty: number
  status: 'Fully paid' | 'Partially Paid'
  payments: Payment[]
}

export function summarize(payments: Payment[]): OrderSummary[] {
  return ORDERS.map((o): OrderSummary => {
    const ps = payments.filter((p) => p.orderId === o.id && p.status !== 'Rejected')
    const card = ps.filter((p) => p.method !== 'Loyalty')
    const loyalty = round2(ps.filter((p) => p.method === 'Loyalty').reduce((s, p) => s + p.paid, 0))
    const paid = round2(card.reduce((s, p) => s + p.paid, 0))
    const tip = round2(ps.reduce((s, p) => s + p.tip, 0))
    const dinerFee = round2(ps.reduce((s, p) => s + p.dinerFee, 0))
    const remaining = round2(Math.max(0, o.bill - paid - loyalty))
    return {
      ...o,
      paid,
      tip,
      dinerFee,
      loyalty,
      customerPaid: round2(paid + tip + dinerFee + loyalty),
      remaining,
      status: remaining > 0 ? 'Partially Paid' : 'Fully paid',
      payments: ps,
    }
  }).sort((a, b) => b.time.localeCompare(a.time))
}

export function daysAgo(iso: string, now: Date) {
  const d = Math.floor((now.getTime() - new Date(iso).getTime()) / 864e5)
  return d <= 0 ? 'today' : d === 1 ? '1 day ago' : `${d} days ago`
}
