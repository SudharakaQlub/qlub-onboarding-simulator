import { useEffect, useState } from 'react'
import { money, round2 } from '../data/periods'
import { useStore } from '../store'
import { IconClose } from './Icons'

// Concept screen: the real refund dialog was not captured (needs a manager login).
export function RefundDialog() {
  const { refundTarget, setRefundTarget, payments, refund } = useStore()
  const p = payments.find((x) => x.id === refundTarget)
  const max = p ? round2(p.paid + p.tip - p.refunded) : 0
  const [mode, setMode] = useState<'full' | 'partial'>('full')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('Guest overcharged')
  useEffect(() => {
    setMode('full')
    setAmount(max ? max.toFixed(2) : '')
  }, [refundTarget, max])
  if (!p) return null
  const value = Number(amount)
  const valid = value > 0 && value <= max
  return (
    <div className="scrim center" onClick={() => setRefundTarget(null)}>
      <div className="modal small" onClick={(e) => e.stopPropagation()} data-tour="refund-dialog">
        <div className="modal-head">
          <b>Refund payment</b>
          <button className="icon-btn" onClick={() => setRefundTarget(null)}>
            <IconClose />
          </button>
        </div>
        <div className="modal-body">
          <p className="muted">
            The guest gets the money back on the same card. Order {p.orderId} · {p.method} {p.last4 && `•••• ${p.last4}`} · up to {money(max)}
          </p>
          <div className="field" data-tour="refund-amount">
            <span>Amount to refund</span>
            <div className="seg">
              <button
                className={mode === 'full' ? 'on' : ''}
                onClick={() => {
                  setMode('full')
                  setAmount(max.toFixed(2))
                }}
              >
                Full<small>{money(max)}</small>
              </button>
              <button
                className={mode === 'partial' ? 'on' : ''}
                onClick={() => {
                  setMode('partial')
                  setAmount('')
                }}
                data-tour="refund-partial"
              >
                Partial<small>Enter amount</small>
              </button>
            </div>
            {mode === 'partial' && (
              <input autoFocus placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
            )}
          </div>
          <label className="field">
            <span>Reason</span>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option>Guest overcharged</option>
              <option>Item not served</option>
              <option>Duplicate payment</option>
              <option>Other</option>
            </select>
          </label>
          <p className="concept-note">Concept screen: replace with the real dialog once captured with a manager login.</p>
        </div>
        <div className="modal-foot">
          <button className="btn btn-text" onClick={() => setRefundTarget(null)}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            disabled={!valid}
            data-tour="refund-confirm"
            onClick={() => {
              refund(p.id, value)
              setRefundTarget(null)
            }}
          >
            Refund {valid ? money(value) : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
