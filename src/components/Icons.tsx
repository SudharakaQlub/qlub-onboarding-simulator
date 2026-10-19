import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }
const base = ({ size = 18, ...p }: P) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
})

export const IconDashboard = (p: P) => (
  <svg {...base(p)}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 9v12" /></svg>
)
export const IconOrders = (p: P) => (
  <svg {...base(p)}><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
)
export const IconPayments = (p: P) => (
  <svg {...base(p)}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h4" /></svg>
)
export const IconTable = (p: P) => (
  <svg {...base(p)}><path d="M4 8h16M6 8v8M18 8v8M9 8v4M15 8v4M10 16h4" /></svg>
)
export const IconReviews = (p: P) => (
  <svg {...base(p)}><rect x="4" y="4" width="16" height="14" rx="2" /><path d="M12 8v6M9 11h6M9 18l-2 3" /></svg>
)
export const IconReports = (p: P) => (
  <svg {...base(p)}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></svg>
)
export const IconLoyalty = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /></svg>
)
export const IconClub = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="9" r="5" /><path d="M9 13.5 8 21l4-2 4 2-1-7.5" /></svg>
)
export const IconTraining = (p: P) => (
  <svg {...base(p)}><path d="M3 8.5 12 4l9 4.5-9 4.5z" /><path d="M7 10.5V15c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5M21 8.5V14" /></svg>
)
export const IconSettings = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" /></svg>
)
export const IconCalendar = (p: P) => (
  <svg {...base(p)}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>
)
export const IconExport = (p: P) => (
  <svg {...base(p)}><path d="M12 15V4M8 8l4-4 4 4M5 14v5h14v-5" /></svg>
)
export const IconSearch = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5" /></svg>
)
export const IconInfo = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
)
export const IconDots = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="12" cy="19" r="1.7" /></svg>
)
export const IconClose = (p: P) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
)
export const IconChevron = (p: P) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
)
export const IconPrint = (p: P) => (
  <svg {...base(p)}><path d="M7 9V3h10v6M7 17H5v-7h14v7h-2M7 14h10v7H7z" /></svg>
)
export const IconDownload = (p: P) => (
  <svg {...base(p)}><path d="M12 4v11M8 11l4 4 4-4M5 20h14" /></svg>
)
export const IconRefund = (p: P) => (
  <svg {...base(p)}><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4" /></svg>
)
export const IconRefresh = IconRefund
export const IconHeart = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
)
export const IconSliders = (p: P) => (
  <svg {...base(p)}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>
)
export const IconQr = (p: P) => (
  <svg {...base(p)}><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h2v2M18 18h2M14 20h2" /></svg>
)
export const IconCheck = (p: P) => (
  <svg {...base(p)}><path d="m5 12 5 5 9-10" /></svg>
)
export const IconPlay = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none"><path d="M8 5v14l11-7z" /></svg>
)
export const IconMic = (p: P) => (
  <svg {...base(p)}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
)
export const IconVolume = (p: P) => (
  <svg {...base(p)}><path d="M11 5 6 9H3v6h3l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>
)
export const IconMute = (p: P) => (
  <svg {...base(p)}><path d="M11 5 6 9H3v6h3l5 4V5z" /><path d="m22 9-6 6M16 9l6 6" /></svg>
)
export const IconPhone = (p: P) => (
  <svg {...base(p)}><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></svg>
)
