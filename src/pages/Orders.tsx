import { useState } from 'react'
import { IconChevron, IconInfo, IconSearch } from '../components/Icons'
import { TopBar } from '../components/TopBar'
import { summarize } from '../data/orders'
import { formatDateTime, inPeriod, money } from '../data/periods'
import { useStore } from '../store'

const STATUSES = ['All', 'Paid', 'Partially Paid', 'Voucher', 'Loyalty'] as const
type StatusFilter = (typeof STATUSES)[number]

export function Orders() {
  const { payments, period, setOpenOrderId, panelFilter } = useStore()
  const [table, setTable] = useState('')
  const [orderId, setOrderId] = useState(panelFilter.orderId ?? '')
  const [status, setStatus] = useState<StatusFilter>(panelFilter.ordersStatus ?? 'All')
  const [statusOpen, setStatusOpen] = useState(false)

  const rows = summarize(payments)
    .filter((o) => inPeriod(o.time, period))
    .filter((o) => !table || o.tableName.toLowerCase().includes(table.toLowerCase()))
    .filter((o) => !orderId || o.id.includes(orderId.trim()))
    .filter((o) =>
      status === 'All'
        ? true
        : status === 'Paid'
          ? o.status === 'Fully paid'
          : status === 'Partially Paid'
            ? o.status === 'Partially Paid'
            : status === 'Loyalty'
              ? o.loyalty > 0
              : false,
    )

  return (
    <>
      <TopBar title="Orders" showExport />
      <div className="content">
        <div className="card outlined">
          <div className="filters">
            <input
              className="input grow"
              placeholder="Table Name"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              data-tour="orders-table-search"
            />
            <label className="input-wrap grow" data-tour="orders-id-search">
              <span className="float-label">Order ID</span>
              <IconSearch size={15} />
              <input placeholder="Search" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
            </label>
            <div className="dropdown grow">
              <button className="input select-like" onClick={() => setStatusOpen((v) => !v)} data-tour="orders-status-filter">
                <span className="float-label">Status</span>
                {status} <IconChevron size={14} />
              </button>
              {statusOpen && (
                <div className="menu">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      data-tour={`orders-status-${s.toLowerCase().replace(' ', '-')}`}
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
          <table className="grid" data-tour="orders-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Table ID</th>
                <th>Table Name</th>
                <th>Bill Amount</th>
                <th>Paid Amount</th>
                <th>Tip Amount</th>
                <th>Qlub Diner Fee</th>
                <th data-tour="orders-col-customer-paid">Customer Paid</th>
                <th data-tour="orders-col-status">Status</th>
                <th>Remaining</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="empty">
                    No orders in this period. Try a wider date range.
                  </td>
                </tr>
              )}
              {rows.map((o) => (
                <tr key={o.id} data-tour={`order-row-${o.id}`}>
                  <td>{formatDateTime(o.time)}</td>
                  <td>{o.tableId}</td>
                  <td>{o.tableName}</td>
                  <td>{money(o.bill)}</td>
                  <td>{money(o.paid)}</td>
                  <td>{money(o.tip)}</td>
                  <td>{money(o.dinerFee)}</td>
                  <td>{money(o.customerPaid)}</td>
                  <td>
                    <span className="status-cell">
                      {o.loyalty > 0 && <span className="loyalty-tag">Loyalty</span>}
                      <span className={`pill ${o.status === 'Fully paid' ? 'green' : 'orange'}`}>{o.status}</span>
                    </span>
                  </td>
                  <td>{money(o.remaining)}</td>
                  <td>
                    <button className="link-btn" onClick={() => setOpenOrderId(o.id)} data-tour={`order-details-${o.id}`}>
                      <IconInfo size={14} /> details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-foot muted small">1–{rows.length} of {rows.length}</div>
        </div>
      </div>
    </>
  )
}
