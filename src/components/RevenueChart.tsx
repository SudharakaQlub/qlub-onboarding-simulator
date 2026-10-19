import { useEffect, useRef, useState } from 'react'
import { shortDay } from '../data/periods'

export interface DayValue {
  day: string
  value: number
}

function smoothPath(pts: Array<[number, number]>) {
  if (pts.length < 2) return ''
  let d = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    const cx = (x0 + x1) / 2
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`
  }
  return d
}

function niceMax(v: number) {
  if (v <= 0) return 120
  const step = Math.pow(10, Math.floor(Math.log10(v)))
  const m = Math.ceil(v / step) * step
  return m % 4 === 0 ? m : Math.ceil(v / (step / 2)) * (step / 2)
}

export function RevenueChart({ data, selected, onSelect }: {
  data: DayValue[]
  selected: string
  onSelect: (day: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(800)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.max(320, e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const h = 190
  const pad = { l: 36, r: 16, t: 12, b: 26 }
  const max = niceMax(Math.max(...data.map((d) => d.value)))
  const step = data.length > 1 ? (w - pad.l - pad.r) / (data.length - 1) : 0
  const X = (i: number) => pad.l + i * step
  const Y = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b)
  const pts = data.map((d, i) => [X(i), Y(d.value)] as [number, number])
  const line = smoothPath(pts)
  const area = line && `${line} L${X(data.length - 1)},${Y(0)} L${X(0)},${Y(0)} Z`
  const labelEvery = Math.ceil(data.length / 16)
  const selIdx = data.findIndex((d) => d.day === selected)

  return (
    <div className="chart" ref={ref}>
      <svg width={w} height={h} role="img" aria-label="Daily revenue">
        <defs>
          <linearGradient id="rev-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#7D00D4" stopOpacity="0.9" />
            <stop offset="1" stopColor="#7D00D4" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={pad.l} x2={w - pad.r} y1={Y(max * f)} y2={Y(max * f)} className="gridline" />
            <text x={pad.l - 6} y={Y(max * f) + 3} textAnchor="end" className="axis">
              {Math.round(max * f)}
            </text>
          </g>
        ))}
        {area && <path d={area} fill="url(#rev-fill)" />}
        {line && <path d={line} fill="none" stroke="#6A00B8" strokeWidth={1.6} />}
        {data.map((d, i) =>
          i % labelEvery === 0 || i === data.length - 1 ? (
            <text key={d.day} x={X(i)} y={h - 8} textAnchor="middle" className="axis">
              {shortDay(d.day)}
            </text>
          ) : null,
        )}
        {selIdx >= 0 && (
          <g>
            <line x1={X(selIdx)} x2={X(selIdx)} y1={pad.t} y2={Y(0)} stroke="#7D00D4" strokeDasharray="3 3" />
            <circle cx={X(selIdx)} cy={Y(data[selIdx].value)} r={4} fill="#7D00D4" />
          </g>
        )}
        {data.map((d, i) => (
          <rect
            key={d.day}
            x={X(i) - Math.max(step, 16) / 2}
            y={pad.t}
            width={Math.max(step, 16)}
            height={h - pad.t - pad.b}
            fill="transparent"
            className="chart-hit"
            data-tour={`chart-day-${d.day}`}
            onClick={() => onSelect(d.day)}
          >
            <title>{`${shortDay(d.day)} · $${d.value.toFixed(2)}`}</title>
          </rect>
        ))}
      </svg>
      {selIdx >= 0 && (
        <div
          className="chart-tag"
          style={{ left: Math.min(Math.max(X(selIdx) - 50, 0), w - 110), top: Math.max(Y(data[selIdx].value) - 34, 0) }}
        >
          {shortDay(data[selIdx].day)} · ${data[selIdx].value.toFixed(2)}
        </div>
      )}
    </div>
  )
}
