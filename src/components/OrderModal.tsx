import { summarize } from '../data/orders'
import { money } from '../data/periods'
import { useStore } from '../store'
import { IconClose, IconDownload, IconPrint, IconQr } from './Icons'

export function OrderModal() {
  const { openOrderId, setOpenOrderId, payments } = useStore()
  const order = summarize(payments).find((o) => o.id === openOrderId)
  if (!order) return null
  const pays = payments.filter((p) => p.orderId === order.id)
  const total = pays.reduce((s, p) => s + p.paid + p.tip + p.dinerFee, 0)
  const d = new Date(order.time)
  const hm = (iso: string) => iso.slice(11, 16)
  return (
    <div className="scrim center" onClick={() => setOpenOrderId(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()} data-tour="order-modal">
        <div className="modal-head">
          <b>{order.tableName}</b>
          <button className="icon-btn" onClick={() => setOpenOrderId(null)} data-tour="order-close">
            <IconClose />
          </button>
        </div>
        <div className="modal-body">
          <div className="ticket-row">
            <div className="muted">
              Ticket #{order.id}, {order.time.slice(0, 10)},<br />
              {hm(order.time)}, {d.toLocaleDateString('en-GB')}
            </div>
            <div className="big">{money(total)}</div>
          </div>
          <table className="grid compact" data-tour="order-payments">
            <thead>
              <tr>
                <th />
                <th>Time</th>
                <th>Tips</th>
                <th>Method</th>
                <th>Last 4 digits</th>
                <th>Status</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {pays.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="qr-badge">
                      <IconQr size={14} />
                    </span>
                  </td>
                  <td>{hm(p.time)}</td>
                  <td>{money(p.tip)}</td>
                  <td>{p.method}</td>
                  <td>{p.last4}</td>
                  <td>
                    <span className={`pill ${p.status === 'Accepted' ? 'green' : p.status === 'Refunded' ? 'grey' : 'red'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="num">{money(p.paid + p.tip + p.dinerFee)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ticket-row remaining-row" data-tour="order-remaining">
            <span className="muted">
              Bill {money(order.bill)} · Paid {money(order.paid + order.loyalty)}
            </span>
            <b className={order.remaining > 0 ? 'owe-text' : 'ok'}>Remaining {money(order.remaining)}</b>
          </div>

          <div className="order-details" data-tour="order-items">
            <div className="muted section-label">Order details</div>
            <div>
              <b>Table: {order.tableName}</b>
            </div>
            {order.items.length === 0 && (
              <div className="muted small">Item lines come from the POS and weren't captured for this order.</div>
            )}
            {order.items.map((it, i) => (
              <div className="item-row" key={i}>
                <span className="qty">{it.qty}x</span>
                <span className="grow">{it.name}</span>
                <span className="muted small">{money(it.unit)}</span>
                <span>{money(it.qty * it.unit)}</span>
              </div>
            ))}
            <div className="item-row accent">
              <span className="qty">$</span>
              <span className="grow">Your Bill</span>
              <span>{money(order.bill)}</span>
            </div>
          </div>
          <div className="ticket-row total">
            <span>Total paid</span>
            <b>{money(total)}</b>
          </div>
        </div>
        <div className="modal-foot" data-tour="order-print">
          <button className="btn btn-soft">
            <IconPrint size={15} /> Print
          </button>
          <button className="btn btn-primary">
            <IconDownload size={15} /> Download
          </button>
        </div>
      </div>
    </div>
  )
}
