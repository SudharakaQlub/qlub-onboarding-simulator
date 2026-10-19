import { useEffect, useState } from 'react'
import { periodFor, PERIOD_LABELS, rangeLabel, type PeriodKey } from '../data/periods'
import { useStore } from '../store'
import { IconInfo } from './Icons'

const KEYS: PeriodKey[] = ['today', 'yesterday', 'thisWeek', 'last7', 'thisMonth', 'last30', 'custom']

export function TimeSettings() {
  const { timeSettingsOpen, setTimeSettingsOpen, period, setPeriod } = useStore()
  const [choice, setChoice] = useState<PeriodKey>(period.key)
  const [start, setStart] = useState(period.start)
  const [end, setEnd] = useState(period.end)

  useEffect(() => {
    if (timeSettingsOpen) {
      setChoice(period.key)
      setStart(period.start)
      setEnd(period.end)
    }
  }, [timeSettingsOpen, period])

  if (!timeSettingsOpen) return null
  return (
    <div className="scrim" onClick={() => setTimeSettingsOpen(false)}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()} data-tour="time-settings">
        <h2>Time Settings</h2>
        <div className="radio-list">
          {KEYS.map((k) => (
            <div key={k}>
              <label className="radio-row" data-tour={`time-option-${k}`}>
                <input type="radio" name="period" checked={choice === k} onChange={() => setChoice(k)} />
                <span>{PERIOD_LABELS[k]}</span>
                <span className="muted">{k === 'custom' ? '' : rangeLabel(periodFor(k))}</span>
              </label>
              {k === 'today' && choice === 'today' && (
                <div className="info-box">
                  <IconInfo size={15} />
                  <span>
                    Today is calculated based on your restaurant's business day, which starts at{' '}
                    <b>October 19, 3:00 AM</b> and ends at <b>October 20, 2:59 AM</b>
                  </span>
                </div>
              )}
              {k === 'custom' && choice === 'custom' && (
                <div className="custom-range">
                  <label>
                    Start <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                  </label>
                  <label>
                    End <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="drawer-foot">
          <button className="btn btn-text danger" onClick={() => setTimeSettingsOpen(false)}>
            Cancel
          </button>
          <button
            className="btn btn-primary wide"
            data-tour="time-confirm"
            onClick={() => {
              setPeriod(choice, { start, end })
              setTimeSettingsOpen(false)
            }}
          >
            Confirm
          </button>
        </div>
      </aside>
    </div>
  )
}
