// Customer App (guest view) screens for the training simulator.
// Each screen is a screenshot in public/customer-app/<id>.jpg with tap targets on top.
// Hotspot rects are in the screenshot's own pixel space (`ref`), measured on the original capture,
// so they stay put when the phone is resized. Every hotspot becomes a data-tour target "ca-<id>".

export type CustomerScreenId = 'landing' | 'menu' | 'bill-items' | 'bill' | 'tip-pay' | 'success' | 'not-ordered'

export interface Hotspot {
  id: string
  label: string
  /** [x1, y1, x2, y2] in the original capture's pixels */
  rect: [number, number, number, number]
  /** Screen to open when tapped outside a lesson, so the phone can be explored like the real app. */
  goTo?: CustomerScreenId
}

export interface CustomerScreen {
  id: CustomerScreenId
  title: string
  /** Original capture size, and the slice of it kept in the image (status and browser bars removed). */
  ref: { w: number; h: number; top: number; bottom: number }
  hotspots: Hotspot[]
}

const PHONE = { w: 1188, h: 2576 }

export const CUSTOMER_SCREENS: CustomerScreen[] = [
  {
    id: 'landing',
    title: 'QR landing',
    ref: { ...PHONE, top: 160, bottom: 2330 },
    hotspots: [
      { id: 'landing-actions', label: 'Pay now and View menu', rect: [66, 1197, 1121, 1493] },
      { id: 'pay-now', label: 'Pay now', rect: [66, 1197, 1121, 1323], goTo: 'bill-items' },
      { id: 'view-menu', label: 'View menu', rect: [66, 1370, 1121, 1493], goTo: 'menu' },
    ],
  },
  {
    id: 'menu',
    title: 'Menu',
    ref: { w: 671, h: 1077, top: 0, bottom: 1077 },
    hotspots: [
      { id: 'menu-grid', label: 'Menu categories', rect: [17, 553, 659, 1070] },
      { id: 'menu-our-food', label: 'Our Food', rect: [17, 553, 328, 712] },
    ],
  },
  {
    id: 'bill-items',
    title: 'Bill',
    ref: { ...PHONE, top: 160, bottom: 2330 },
    hotspots: [
      { id: 'bill-table', label: 'Table number', rect: [55, 625, 1130, 760] },
      { id: 'bill-items', label: 'Items and total', rect: [55, 840, 1130, 1625] },
      { id: 'bill-pay-fully', label: 'Pay fully', rect: [605, 1877, 1121, 2003], goTo: 'tip-pay' },
    ],
  },
  {
    id: 'bill',
    title: 'Bill · pay options',
    ref: { ...PHONE, top: 160, bottom: 2330 },
    hotspots: [
      { id: 'bill-actions', label: 'Split bill and Pay fully', rect: [66, 1973, 1121, 2100] },
      { id: 'split-bill', label: 'Split bill', rect: [66, 1973, 582, 2100] },
      { id: 'pay-fully', label: 'Pay fully', rect: [605, 1973, 1121, 2100], goTo: 'tip-pay' },
    ],
  },
  {
    id: 'tip-pay',
    title: 'Tip and payment',
    ref: { ...PHONE, top: 150, bottom: 2420 },
    hotspots: [
      { id: 'tip-options', label: 'Tip options', rect: [60, 360, 1125, 600] },
      { id: 'tip-remove', label: 'Remove tip (×)', rect: [366, 348, 424, 404] },
      { id: 'custom-tip', label: 'Custom tip', rect: [60, 665, 1125, 745] },
      { id: 'you-pay', label: 'You pay', rect: [60, 1100, 1125, 1270] },
      { id: 'payment-methods', label: 'Payment methods', rect: [66, 1500, 1121, 1985] },
      { id: 'pay-button', label: 'Pay with Apple Pay', rect: [66, 2153, 1121, 2280], goTo: 'success' },
    ],
  },
  {
    id: 'success',
    title: 'Payment status and rating',
    ref: { ...PHONE, top: 160, bottom: 2330 },
    hotspots: [
      { id: 'status-card', label: 'Payment status', rect: [66, 200, 1121, 872] },
      { id: 'status-badge', label: 'Status and Left to pay', rect: [120, 410, 1065, 580] },
      { id: 'stars-low', label: '1–3 stars', rect: [240, 1105, 645, 1220] },
      { id: 'stars-high', label: '4–5 stars', rect: [695, 1105, 950, 1220] },
      { id: 'receipt', label: 'Get the Receipt', rect: [66, 1813, 1121, 1940] },
      { id: 'back-home', label: 'Back to home', rect: [66, 2007, 1121, 2133], goTo: 'landing' },
    ],
  },
  {
    id: 'not-ordered',
    title: 'Nothing to pay yet',
    ref: { ...PHONE, top: 160, bottom: 2330 },
    hotspots: [
      { id: 'not-ordered-msg', label: '“Looks like you have not ordered yet”', rect: [200, 1360, 990, 1650] },
      { id: 'try-again', label: 'Try again', rect: [240, 1732, 947, 1858], goTo: 'bill-items' },
      { id: 'check-menu', label: 'Check Menu', rect: [386, 1922, 802, 2047], goTo: 'menu' },
    ],
  },
]

export const screenById = (id: string) => CUSTOMER_SCREENS.find((s) => s.id === id) ?? CUSTOMER_SCREENS[0]

/** Hotspot position as percentages of the (cropped) screenshot. */
export function hotspotStyle(s: CustomerScreen, h: Hotspot) {
  const ch = s.ref.bottom - s.ref.top
  const [x1, y1, x2, y2] = h.rect
  return {
    left: `${(x1 / s.ref.w) * 100}%`,
    top: `${((y1 - s.ref.top) / ch) * 100}%`,
    width: `${((x2 - x1) / s.ref.w) * 100}%`,
    height: `${((y2 - y1) / ch) * 100}%`,
  }
}
