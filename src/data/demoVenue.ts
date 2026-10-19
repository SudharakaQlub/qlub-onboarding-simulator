// Demo venue data for "AU Diner Demo (Pay Only)".
// Figures match Rohan's Vendor Panel Training deck: Last 30 Days revenue $2,001.79,
// tips $185.55, diner fee $48.70, vendor fee $57.54. No real customer data.

export const VENUE_NAME = 'AU Diner Demo'
export const CURRENCY = '$'
/** The demo is pinned to this "now" so periods match the deck screenshots. */
export const DEMO_NOW = new Date('2026-10-19T15:00:00')
export const VENDOR_FEE_RATE = 0.028745

export type Method = 'Visa' | 'Mastercard' | 'Amex' | 'Apple Pay' | 'qlubcardwallet' | 'Loyalty'
export type PaymentStatus = 'Accepted' | 'Rejected' | 'Refunded'

export interface Payment {
  id: string // payment reference (shown in Payments)
  orderId: string
  time: string // ISO local datetime
  paid: number
  tip: number
  dinerFee: number
  method: Method
  last4: string
  status: PaymentStatus
  refunded: number
}

export interface OrderItem {
  qty: number
  name: string
  unit: number
}

export interface Order {
  id: string // 10-digit ticket / order id
  time: string
  tableId: string
  tableName: string
  bill: number
  items: OrderItem[]
}

export const MENU: Record<string, number> = {
  Negroni: 10,
  Tiramisu: 8,
  Arancini: 12,
  Gelato: 7.5,
  Diavola: 30,
  Chianti: 22,
  Capricciosa: 26.5,
  Gnocchi: 14,
  Prosecco: 24,
  Margherita: 22,
  Carbonara: 26,
  Spritz: 14,
  Burrata: 18,
  Espresso: 4,
}

/** Builds a plausible item list that adds up exactly to the bill. */
function itemsFor(bill: number, seed: number): OrderItem[] {
  const names = Object.keys(MENU)
  const items: OrderItem[] = []
  let left = Math.round(bill * 100)
  let i = seed
  let guard = 0
  while (left > 0 && guard++ < 40) {
    const name = names[i % names.length]
    const unit = Math.round(MENU[name] * 100)
    i += 3
    if (unit > left) continue
    const qty = Math.max(1, Math.min(3, Math.floor(left / unit / 3)))
    const existing = items.find((x) => x.name === name)
    if (existing) existing.qty += qty
    else items.push({ qty, name, unit: unit / 100 })
    left -= unit * qty
    if (left > 0 && left < 400) {
      items.push({ qty: 1, name: "Chef's special", unit: left / 100 })
      left = 0
    }
  }
  return items
}

type Seed = [
  orderId: string,
  time: string,
  tableId: string,
  tableName: string,
  bill: number,
  payments: Array<[paid: number, tip: number, fee: number, method: Method, last4: string, minuteOffset?: number]>,
]

const SEEDS: Seed[] = [
  ['7159271922', '2026-10-16T17:06', '2', '2', 175, [[5.8, 0, 0.09, 'qlubcardwallet', '', 1]]],
  ['5551688701', '2026-10-16T17:06', '1', 'Table 1', 113, [[113, 17.2, 1.7, 'Visa', '4242']]],
  ['9819620144', '2026-10-13T10:59', '3', '3', 115, [[115, 11.5, 0, 'Visa', '1881']]],
  ['0470267735', '2026-10-07T15:52', '3', '3', 106, [[106, 10.88, 2.8, 'Visa', '0551']]],
  ['9728289016', '2026-10-07T10:47', '3', '3', 180.5, [[180.5, 18.52, 4.66, 'Mastercard', '1622']]],
  ['4030421857', '2026-10-01T18:33', '4', '4', 86, [[86, 0, 2.3, 'Mastercard', '1622']]],
  ['2419981163', '2026-10-01T14:44', '3', '3', 155.5, [[155.5, 15.95, 4.04, 'Mastercard', '1622']]],
  ['3200850479', '2026-09-29T16:27', '2', '2', 124.5, [[119.76, 0, 3.26, 'Visa', '4242'], [4.74, 0, 0, 'Loyalty', '']]],
  ['0865913340', '2026-09-29T15:19', '4', '4', 30.5, [[30.5, 4.71, 0.91, 'Mastercard', '1622']]],
  ['6634107295', '2026-09-29T14:40', '3', '3', 114, [[114, 11.7, 3.0, 'Visa', '7310']]],
  ['1187430562', '2026-09-29T12:10', '5', '5', 98.5, [[98.5, 22.51, 3.4, 'Amex', '1009']]],
  ['8302215547', '2026-09-28T20:41', '1', 'Table 1', 145.25, [[145.25, 14.53, 4.21, 'Visa', '8820']]],
  ['2950746618', '2026-09-28T13:05', '6', '6', 84.75, [[84.75, 8.48, 2.46, 'Apple Pay', '3391']]],
  ['7741902836', '2026-09-25T19:22', '3', '3', 232.75, [[232.75, 0, 3.85, 'Mastercard', '5512']]],
  ['4418820973', '2026-09-24T21:15', '2', '2', 162.48, [[162.48, 24.37, 4.71, 'Visa', '4242']]],
  ['6029384415', '2026-09-24T13:48', '4', '4', 132, [[132, 13.2, 3.83, 'Mastercard', '1622']]],
  ['3376150289', '2026-09-21T19:30', '1', 'Table 1', 120, [[120, 12, 3.48, 'Visa', '2207']]],
]

function addMinutes(iso: string, m: number) {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() + m)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export const ORDERS: Order[] = SEEDS.map(([id, time, tableId, tableName, bill], idx) => ({
  id,
  time,
  tableId,
  tableName,
  bill,
  items:
    id === '7159271922'
      ? [
          { qty: 3, name: 'Tiramisu', unit: 8 },
          { qty: 2, name: 'Capricciosa', unit: 26.5 },
          { qty: 1, name: 'Gnocchi', unit: 14 },
          { qty: 2, name: 'Diavola', unit: 30 },
          { qty: 1, name: 'Prosecco', unit: 24 },
        ]
      : itemsFor(bill, idx * 5 + 1),
}))

export const INITIAL_PAYMENTS: Payment[] = SEEDS.flatMap(([orderId, time, , , , pays]) =>
  pays.map(([paid, tip, fee, method, last4, off], i) => ({
    id: `${orderId}${i ? `-${i + 1}` : ''}`,
    orderId,
    time: addMinutes(time, off ?? 0),
    paid,
    tip,
    dinerFee: fee,
    method,
    last4,
    status: 'Accepted' as PaymentStatus,
    refunded: 0,
  })),
)

export const POPULAR_ITEMS: Array<[string, number, number]> = [
  ['Negroni', 84, 10],
  ['Tiramisu', 66, 8],
  ['Arancini', 60, 12],
  ['Gelato', 57, 7.5],
  ['Diavola', 56, 30],
  ['Chianti', 52, 22],
  ['Capricciosa', 47, 26.5],
  ['Spritz', 41, 14],
  ['Burrata', 33, 18],
  ['Espresso', 29, 4],
]

export interface StaffMember {
  id: string
  name: string
  role: 'Waiter' | 'Cashier' | 'Manager'
}

export const SEED_STAFF: StaffMember[] = [
  { id: 'priya', name: 'Priya', role: 'Waiter' },
  { id: 'ali', name: 'Ali', role: 'Cashier' },
  { id: 'sara', name: 'Sara', role: 'Manager' },
]
