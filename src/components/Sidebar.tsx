import type { ComponentType } from 'react'
import { useStore, type PageKey } from '../store'
import {
  IconClub,
  IconDashboard,
  IconLoyalty,
  IconOrders,
  IconPhone,
  IconPayments,
  IconReports,
  IconReviews,
  IconSettings,
  IconTable,
  IconTraining,
} from './Icons'

const ITEMS: Array<[PageKey, string, ComponentType<{ size?: number }>]> = [
  ['dashboard', 'Dashboard', IconDashboard],
  ['orders', 'Orders', IconOrders],
  ['payments', 'Payments', IconPayments],
  ['tableView', 'Table View', IconTable],
  ['reviews', 'Reviews', IconReviews],
  ['reports', 'Reports', IconReports],
  ['loyalty', 'Loyalty', IconLoyalty],
  ['myClub', 'My Club', IconClub],
]

export function Sidebar() {
  const { page, setPage, closeOverlays } = useStore()
  const go = (p: PageKey) => {
    closeOverlays()
    setPage(p)
  }
  const item = ([key, label, Icon]: (typeof ITEMS)[number]) => (
    <button
      key={key}
      className={`nav-item ${page === key ? 'active' : ''}`}
      onClick={() => go(key)}
      data-tour={`nav-${key}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  )
  return (
    <nav className="sidebar">
      <div className="logo">
        qlub<span>::</span>
      </div>
      {ITEMS.map(item)}
      <div className="nav-divider" />
      {item(['training', 'Staff Training', IconTraining])}
      {item(['customerApp', 'Customer App', IconPhone])}
      <div style={{ flex: 1 }} />
      {item(['settings', 'Settings', IconSettings])}
    </nav>
  )
}
