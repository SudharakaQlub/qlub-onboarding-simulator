// Trainee progress, kept in this browser for the demo. A real build would store it per venue on the server.
import { SEED_STAFF, type StaffMember } from '../data/demoVenue'

export interface Completion {
  at: string
  score: number // checks answered right first time
  total: number
}

export interface Trainee extends StaffMember {
  completed: Record<string, Completion> // key = "packId/moduleId"
}

const KEY = 'qos.trainees.v1'

function seed(): Trainee[] {
  const done = (score: number, total: number): Completion => ({ at: '2026-10-12T10:00', score, total })
  return SEED_STAFF.map((s): Trainee => ({
    ...s,
    completed: (s.id === 'ali'
        ? {
            'vendor-panel-basics/dashboard': done(4, 4),
            'vendor-panel-basics/orders': done(3, 4),
            'vendor-panel-basics/payments': done(3, 3),
            'customer-app-basics/guest-journey': done(5, 5),
            'customer-app-basics/when-stuck': done(3, 3),
          }
        : s.id === 'sara'
          ? { 'vendor-panel-basics/dashboard': done(4, 4) }
          : {}) as Record<string, Completion>,
  }))
}

export function loadTrainees(): Trainee[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* storage unavailable: fall back to seed */
  }
  return seed()
}

export function saveTrainees(list: Trainee[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

export function resetTrainees() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
  return seed()
}
