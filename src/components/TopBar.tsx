import type { ReactNode } from 'react'
import { PERIOD_LABELS } from '../data/periods'
import { useStore } from '../store'
import { IconCalendar, IconExport } from './Icons'

export function TopBar({ title, extra, showDate = true, showExport = false }: {
  title: ReactNode
  extra?: ReactNode
  showDate?: boolean
  showExport?: boolean
}) {
  const { period, setTimeSettingsOpen } = useStore()
  return (
    <header className="topbar">
      <h1>{title}</h1>
      <div className="topbar-actions">
        {extra}
        {showExport && (
          <button className="btn btn-primary" data-tour="export-button">
            <IconExport size={15} /> Export
          </button>
        )}
        {showDate && (
          <button className="btn btn-outline" data-tour="date-button" onClick={() => setTimeSettingsOpen(true)}>
            <IconCalendar size={15} /> {PERIOD_LABELS[period.key]}
          </button>
        )}
        <div className="venue-chip" title="Demo venue">AU Diner Demo</div>
      </div>
    </header>
  )
}
