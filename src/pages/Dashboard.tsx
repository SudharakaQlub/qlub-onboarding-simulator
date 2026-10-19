import { useEffect, useMemo, useState } from 'react'
import { IconChevron, IconInfo } from '../components/Icons'
import { RevenueChart } from '../components/RevenueChart'
import { TopBar } from '../components/TopBar'
import { POPULAR_ITEMS } from '../data/demoVenue'
import { businessDay, daysOf, figuresFor, money, PERIOD_LABELS, round2, shortDay } from '../data/periods'
import { useStore } from '../store'

const KPI_HELP: Record<string, string> = {
  Revenue: 'Bill amounts paid by card or wallet. Excludes tips, fees and loyalty credit.',
  Tips: 'Tips guests added. They belong to the venue.',
  Refunds: 'Money returned to guests in the period.',
  'Diner Fee': 'qlub fee paid by the guest on top of the bill. Not venue money.',
  'Vendor Fee': 'qlub fee charged to the venue.',
}

export function Dashboard() {
  const { period, payments } = useStore()
  const [tab, setTab] = useState<'revenue' | 'tips'>('revenue')
  const label = PERIOD_LABELS[period.key]
  const f = figuresFor(payments, period)
  const days = useMemo(() => daysOf(period), [period])
  const [selected, setSelected] = useState(days[days.length - 1])
  useEffect(() => setSelected(days[days.length - 1]), [days])

  const series = days.map((day) => {
    const ps = payments.filter((p) => businessDay(p.time) === day && p.status !== 'Rejected')
    const value = tab === 'revenue'
      ? ps.filter((p) => p.method !== 'Loyalty').reduce((s, p) => s + p.paid, 0)
      : ps.reduce((s, p) => s + p.tip, 0)
    return { day, value: round2(value) }
  })

  const split = Object.entries(
    payments
      .filter((p) => businessDay(p.time) === selected && p.status !== 'Rejected')
      .reduce<Record<string, number>>((acc, p) => {
        const k = p.method === 'qlubcardwallet' ? 'Wallet' : p.method
        acc[k] = round2((acc[k] ?? 0) + p.paid)
        return acc
      }, {}),
  ).sort((a, b) => b[1] - a[1])

  const kpi = (name: string, value: number, tour: string) => (
    <div className="kpi" data-tour={tour}>
      <div className="kpi-label">
        {name} {label} <span title={KPI_HELP[name]}><IconInfo size={13} /></span>
      </div>
      <div className="kpi-value">{money(value)}</div>
    </div>
  )

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="content">
        <div className="filters right">
          <button className="select" data-tour="filter-qr">All QR Groups <IconChevron size={14} /></button>
          <button className="select" data-tour="filter-products">All Products <IconChevron size={14} /></button>
        </div>
        <div className="kpis" data-tour="kpi-row">
          {kpi('Revenue', f.revenue, 'kpi-revenue')}
          {kpi('Tips', f.tips, 'kpi-tips')}
          {kpi('Refunds', f.refunds, 'kpi-refunds')}
          {kpi('Diner Fee', f.dinerFee, 'kpi-dinerfee')}
          {kpi('Vendor Fee', f.vendorFee, 'kpi-vendorfee')}
        </div>

        <div className="card chart-card">
          <div className="chart-main">
            <div className="tabs" data-tour="chart-tabs">
              <button className={tab === 'revenue' ? 'active' : ''} onClick={() => setTab('revenue')} data-tour="tab-revenue">
                Revenue
              </button>
              <button className={tab === 'tips' ? 'active' : ''} onClick={() => setTab('tips')} data-tour="tab-tips">
                Tips
              </button>
            </div>
            <div className="eyebrow">{days.length === 7 && period.key !== 'last7' ? 'LAST 7 DAYS' : label.toUpperCase()}</div>
            <RevenueChart data={series} selected={selected} onSelect={setSelected} />
          </div>
          <div className="split-panel" data-tour="card-split">
            <div className="eyebrow">SPLIT BY CARD BRAND — {shortDay(selected).toUpperCase()}</div>
            {split.length === 0 ? (
              <p className="muted small">No card payments on this day.</p>
            ) : (
              split.map(([k, v]) => (
                <div className="split-row" key={k}>
                  <span>{k}</span>
                  <b>{money(v)}</b>
                </div>
              ))
            )}
            <p className="muted tiny">Tap a day on the chart to see its card brand split.</p>
          </div>
        </div>

        <div className="card" data-tour="popular-items">
          <div className="card-head">
            <h3>Popular Items</h3>
            <button className="select small">monthly <IconChevron size={14} /></button>
          </div>
          <table className="grid">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product Name</th>
                <th>Item Sold</th>
                <th>Average Price</th>
              </tr>
            </thead>
            <tbody>
              {POPULAR_ITEMS.map(([n, sold, avg], i) => (
                <tr key={n}>
                  <td>{i + 1}</td>
                  <td>{n}</td>
                  <td>{sold}</td>
                  <td>{avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
