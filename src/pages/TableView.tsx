import { useState } from 'react'
import { IconChevron, IconHeart, IconLoyalty, IconQr, IconSliders } from '../components/Icons'
import { TopBar } from '../components/TopBar'
import { DEMO_NOW } from '../data/demoVenue'
import { daysAgo, summarize } from '../data/orders'
import { formatDateTime, money } from '../data/periods'
import { useStore } from '../store'

export function TableView() {
  const { payments } = useStore()
  const [open, setOpen] = useState<string | null>(null)
  const rows = summarize(payments)
  return (
    <>
      <TopBar
        title="Table View"
        showDate={false}
        extra={
          <button className="icon-btn" title="View and filter options" data-tour="tableview-options">
            <IconSliders />
          </button>
        }
      />
      <div className="content">
        <div className="legend" data-tour="tableview-legend">
          <span><i className="sw yellow" /> Partially paid, still owes</span>
          <span><i className="sw lightgreen" /> Paid, incl. loyalty</span>
          <span><i className="sw green" /> Fully paid (heart = tip)</span>
        </div>
        {rows.map((o) => {
          const color = o.status === 'Partially Paid' ? 'yellow' : o.loyalty > 0 ? 'lightgreen' : 'green'
          const isOpen = open === o.id
          return (
            <div key={o.id} className={`tile ${color}`} data-tour={`table-tile-${o.id}`}>
              <button className="tile-head" onClick={() => setOpen(isOpen ? null : o.id)} data-tour={`table-toggle-${o.id}`}>
                <div>
                  <div className="tile-name">{o.tableName}</div>
                  <div className="tile-badges">
                    <span className="age">{daysAgo(o.time, DEMO_NOW)}</span>
                    <span className="qr-mini"><IconQr size={12} /></span>
                  </div>
                </div>
                <div className="tile-amounts">
                  {o.loyalty > 0 && <span className="small">Paid by Party: {money(o.paid)}&nbsp;</span>}
                  <b>
                    {money(o.paid + o.loyalty)} / {money(o.bill)}
                  </b>
                  {o.tip > 0 && (
                    <span className="tip-chip">
                      <IconHeart size={10} /> {money(o.tip)}
                    </span>
                  )}
                  {o.loyalty > 0 && (
                    <span className="tip-chip">
                      <IconLoyalty size={10} /> {money(o.loyalty)}
                    </span>
                  )}
                </div>
                <span className={`chev ${isOpen ? 'up' : ''}`}><IconChevron /></span>
              </button>
              {isOpen && (
                <div className="tile-body" data-tour={`table-details-${o.id}`}>
                  <div><span>Creation Date:</span><span>{formatDateTime(o.time)}</span></div>
                  <div><span>Qlub Order ID:</span><span>{o.id}</span></div>
                  <div><span>Customer Paid:</span><span>{money(o.customerPaid)}</span></div>
                  <div data-tour={`table-remaining-${o.id}`}>
                    <span>Remaining:</span>
                    <span className={o.remaining > 0 ? 'remaining owe' : 'remaining'}>{money(o.remaining)}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
