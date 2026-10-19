import { useEffect, useState } from 'react'
import { IconChevron, IconDots, IconPrint, IconQr, IconRefresh, IconRefund, IconSearch } from '../components/Icons'
import { TopBar } from '../components/TopBar'
import { ORDERS, type Payment } from '../data/demoVenue'
import { formatDateTime, inPeriod, money } from '../data/periods'
import { useStore } from '../store'

const STATUSES = ['All', 'Accepted', 'Rejected', 'Refunded'] as const

/** Order ID, last 4 digits, card brand ("visa") or an amount ("131.90", "$131.90"). */
export function matches(p: Payment, raw: string) {
  const q = raw.trim().toLowerCase()
  if (!q) return true
  if (p.orderId.includes(q) || p.last4 === q) return true
  if (q.length >= 3 && p.method.toLowerCase().includes(q)) return true
  if (/^\$?\s*[\d.,]+$/.test(q)) {
    const v = parseFloat(q.replace(/[$,\s]/g, ''))
    const near = (x: number) => Math.abs(x - v) < 0.006
    return !isNaN(v) && (near(p.paid) || near(p.paid + p.tip + p.dinerFee))
  }
  return false
}

export function Payments() {
  const { payments, period, setRefundTarget, canRefund, panelFilter } = useStore()
  const [q, setQ] = useState(panelFilter.paymentsQuery ?? '')
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('All')
  const [statusOpen, setStatusOpen] = useState(false)
  const [menuFor, setMenuFor] = useState<string | null>(null)

  useEffect(() => {
    const close = () => setMenuFor(null)
    window.addEventListener('scroll', close, true)
    return () => window.removeEventListener('scroll', close, true)
  }, [])

  const rows = payments
    .filter((p) => inPeriod(p.time, period))
    .filter((p) => matches(p, q))
    .filter((p) => status === 'All' || p.status === status)
    .sort((a, b) => b.time.localeCompare(a.time))

  return (
    <>
      <TopBar
        title={
          <>
            Payments <span className="refresh"><IconRefresh size={16} /></span>
          </>
        }
        showExport
      />
      <div className="content" onClick={() => setMenuFor(null)}>
        <div className="filters">
          <label className="input-wrap grow" data-tour="payments-search">
            <IconSearch size={15} />
            <input placeholder="Search by order id, last 4 digits, card or amount" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <div className="dropdown">
            <button
              className="input select-like"
              onClick={(e) => {
                e.stopPropagation()
                setStatusOpen((v) => !v)
              }}
              data-tour="payments-status-filter"
            >
              {status === 'All' ? 'Status' : status} <IconChevron size={14} />
            </button>
            {statusOpen && (
              <div className="menu right">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    data-tour={`payments-status-${s.toLowerCase()}`}
                    onClick={() => {
                      setStatus(s)
                      setStatusOpen(false)
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="card flush">
          <table className="grid caps" data-tour="payments-table">
            <thead>
              <tr>
                <th />
                <th>Order ID</th>
                <th>Date &amp; Time</th>
                <th>Table Name</th>
                <th>Bill Amount</th>
                <th>Paid Amount</th>
                <th>Tip Amount</th>
                <th>Qlub Diner Fee</th>
                <th>Total Amount</th>
                <th data-tour="payments-col-status">Status</th>
                <th data-tour="payments-col-method">Method</th>
                <th>Last 4 Digits</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={13} className="empty">No payments match. Try a wider date range or clear the search.</td>
                </tr>
              )}
              {rows.map((p) => {
                const order = ORDERS.find((o) => o.id === p.orderId)!
                return (
                  <tr key={p.id} data-tour={`payment-row-${p.id}`}>
                    <td>{p.method !== 'Loyalty' && <span className="qr-badge"><IconQr size={14} /></span>}</td>
                    <td className="mono">{p.orderId}</td>
                    <td>{formatDateTime(p.time)}</td>
                    <td>{order.tableName}</td>
                    <td>{money(order.bill)}</td>
                    <td>{money(p.paid)}</td>
                    <td>{money(p.tip)}</td>
                    <td>{money(p.dinerFee)}</td>
                    <td>{money(p.paid + p.tip + p.dinerFee)}</td>
                    <td>
                      <span className={`pill ${p.status === 'Accepted' ? 'green' : p.status === 'Refunded' ? 'grey' : 'red'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{p.method === 'Loyalty' ? '' : p.method}</td>
                    <td>{p.last4}</td>
                    <td className="menu-cell">
                      <button
                        className="icon-btn"
                        data-tour={`payment-menu-${p.id}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setMenuFor(menuFor === p.id ? null : p.id)
                        }}
                      >
                        <IconDots size={16} />
                      </button>
                      {menuFor === p.id && (
                        <div className="row-menu" onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-primary" data-tour="payment-print">
                            <IconPrint size={14} /> Print
                          </button>
                          <button
                            className="btn btn-danger-soft"
                            data-tour="payment-refund"
                            disabled={!canRefund || p.status !== 'Accepted' || p.method === 'Loyalty'}
                            title={canRefund ? undefined : 'Needs refund access. Ask a manager.'}
                            onClick={() => {
                              setMenuFor(null)
                              setRefundTarget(p.id)
                            }}
                          >
                            <IconRefund size={14} /> Refund
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="table-foot muted small">
            {rows.length} payment{rows.length === 1 ? '' : 's'}
            {!canRefund && ' · Refunds need a manager login'}
          </div>
        </div>
      </div>
    </>
  )
}
