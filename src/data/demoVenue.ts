// Demo venue data for "AU Diner Demo (Pay Only)", a qlub test venue. No real customer data.
// Payments are the venue's transactions export for 19 Sep – 19 Oct 2026 (22 rows). Totals match the
// Vendor Panel Training deck: revenue $2,001.79, tips $185.55, diner fee $48.70, vendor fee $57.54,
// loyalty credit $28.32, receivable from qlub $2,152.62.

export const VENUE_NAME = 'AU Diner Demo'
export const CURRENCY = '$'
/** The demo is pinned to this "now" so periods match the deck screenshots. */
export const DEMO_NOW = new Date('2026-10-19T15:00:00')
export const DATA_FROM = '2026-09-19'

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
  /** qlub commission on this payment (the Vendor Fee). From the export. */
  commission: number
  /** What qlub owes the venue for this payment (ReceivableFromQlub in the export). */
  receivable: number
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
  /** Only captured for some orders: the export has no item lines (they come from the POS). */
  items: OrderItem[]
}

// [time, orderId, bill, paid, tip, dinerFee, method, last4, commission, receivable]
type Row = [string, string, number, number, number, number, Method, string, number, number]

const EXPORT: Row[] = [
  ['2026-10-16T17:07', '7159271922', 175.0, 5.8, 0, 0.09, 'qlubcardwallet', '', 0.3, 0],
  ['2026-10-16T17:06', '5551688701', 113.0, 113.0, 17.2, 1.7, 'Visa', '4242', 3.41, 126.79],
  ['2026-10-13T11:10', '9819620179', 115.0, 115.0, 11.5, 0, 'Visa', '6159', 3.31, 123.19],
  ['2026-10-07T16:14', '0470267824', 106.0, 106.0, 10.88, 2.8, 'Visa', '6159', 3.07, 113.81],
  ['2026-10-07T11:05', '9728289344', 180.5, 180.5, 18.52, 4.66, 'Mastercard', '1622', 5.13, 193.89],
  ['2026-10-01T18:36', '4030421385', 86.0, 86.0, 0, 2.3, 'Mastercard', '1622', 2.3, 83.7],
  ['2026-10-01T14:45', '2419981174', 155.5, 155.5, 15.95, 4.04, 'Mastercard', '1622', 4.44, 167.01],
  ['2026-09-29T16:31', '3200850272', 124.5, 119.76, 0, 3.26, 'Visa', '4242', 3.14, 116.62],
  ['2026-09-29T16:30', '3200850272', 124.5, 4.74, 0, 0, 'Loyalty', '', 0, 4.74],
  ['2026-09-29T15:52', '0865913443', 30.5, 30.5, 4.71, 0.91, 'Mastercard', '1622', 1.03, 34.18],
  ['2026-09-29T14:56', '2086257266', 114.0, 114.0, 11.7, 3.0, 'Visa', '6159', 3.29, 122.41],
  ['2026-09-29T12:31', '3668599039', 108.5, 94.73, 14.64, 2.86, 'Visa', '4242', 2.88, 106.49],
  ['2026-09-29T12:22', '3668599039', 108.5, 13.77, 0, 0, 'Loyalty', '', 0, 13.77],
  ['2026-09-28T13:39', '6319049283', 124.0, 124.0, 12.72, 3.25, 'Mastercard', '1622', 3.57, 133.15],
  ['2026-09-28T11:24', '7544875269', 117.0, 117.0, 12.01, 3.08, 'Visa', '6159', 3.38, 125.63],
  ['2026-09-25T23:54', '3018594687', 188.0, 5.0, 0, 0.13, 'Visa', '4242', 0.28, 4.72],
  ['2026-09-25T23:48', '6998006922', 122.0, 9.81, 0, 0, 'Loyalty', '', 0, 9.81],
  ['2026-09-25T11:09', '2505621144', 92.0, 92.0, 0, 2.45, 'Mastercard', '1622', 2.45, 89.55],
  ['2026-09-25T10:56', '3978579965', 116.5, 116.5, 11.96, 3.06, 'Mastercard', '1622', 3.36, 125.1],
  ['2026-09-24T16:42', '7448778793', 146.0, 146.0, 14.98, 3.8, 'Mastercard', '1622', 4.17, 156.81],
  ['2026-09-24T15:56', '2152495418', 160.5, 160.5, 16.47, 4.16, 'Mastercard', '1622', 4.57, 172.4],
  ['2026-09-21T14:56', '7860932032', 120.0, 120.0, 12.31, 3.15, 'Mastercard', '1622', 3.46, 128.85],
]

/** The export lists every table as "Table 1"; names below were captured from the live panel's Orders tab. */
const TABLE_NAMES: Record<string, string> = {
  '7159271922': '2',
  '5551688701': 'Table 1',
  '9819620179': '3',
  '0470267824': '3',
  '9728289344': '3',
  '4030421385': '4',
  '2419981174': '3',
  '3200850272': '2',
  '0865913443': '4',
  '2086257266': '3',
  '3668599039': '5',
  '6319049283': '3',
  '7544875269': '3',
}

/** Item lines captured from the panel. Other orders show a note instead of invented items. */
const ITEMS: Record<string, OrderItem[]> = {
  '7159271922': [
    { qty: 3, name: 'Tiramisu', unit: 8 },
    { qty: 2, name: 'Capricciosa', unit: 26.5 },
    { qty: 1, name: 'Gnocchi', unit: 14 },
    { qty: 2, name: 'Diavola', unit: 30 },
    { qty: 1, name: 'Prosecco', unit: 24 },
  ],
}

const seen = new Map<string, number>()
export const INITIAL_PAYMENTS: Payment[] = EXPORT.map(([time, orderId, , paid, tip, dinerFee, method, last4, commission, receivable]) => {
  const n = (seen.get(orderId) ?? 0) + 1
  seen.set(orderId, n)
  return {
    id: n === 1 ? orderId : `${orderId}-${n}`,
    orderId,
    time,
    paid,
    tip,
    dinerFee,
    method,
    last4,
    status: 'Accepted' as PaymentStatus,
    refunded: 0,
    commission,
    receivable,
  }
})

export const ORDERS: Order[] = [...new Set(EXPORT.map((r) => r[1]))].map((id) => {
  const rows = EXPORT.filter((r) => r[1] === id)
  const time = rows.map((r) => r[0]).sort()[0]
  const tableName = TABLE_NAMES[id] ?? 'Table 1'
  return {
    id,
    time,
    tableId: tableName.replace(/^Table\s*/, ''),
    tableName,
    bill: rows[0][2],
    items: ITEMS[id] ?? [],
  }
})

export const POPULAR_ITEMS: Array<[string, number, number]> = [
  ['Negroni', 84, 10],
  ['Tiramisu', 66, 8],
  ['Arancini', 60, 12],
  ['Gelato', 57, 7.5],
  ['Diavola', 56, 30],
  ['Chianti', 52, 22],
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
