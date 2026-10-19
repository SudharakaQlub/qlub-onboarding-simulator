import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { INITIAL_PAYMENTS, type Payment } from './data/demoVenue'
import { periodFor, round2, type Period, type PeriodKey } from './data/periods'
import { loadTrainees, resetTrainees, saveTrainees, type Completion, type Trainee } from './training/progress'
import type { TrainingPack } from './training/types'

export type PageKey =
  | 'dashboard'
  | 'orders'
  | 'payments'
  | 'tableView'
  | 'reviews'
  | 'reports'
  | 'loyalty'
  | 'myClub'
  | 'training'
  | 'settings'

export interface TourState {
  packId: string
  moduleId: string
  /** Set when replaying a single lesson from quick help: no check questions at the end. */
  lessonId?: string
  stepIndex: number
  phase: 'steps' | 'checks' | 'done'
  checkIndex: number
  firstTryRight: number
}

interface Store {
  page: PageKey
  setPage: (p: PageKey) => void
  period: Period
  setPeriod: (key: PeriodKey, custom?: { start: string; end: string }) => void
  timeSettingsOpen: boolean
  setTimeSettingsOpen: (v: boolean) => void
  openOrderId: string | null
  setOpenOrderId: (id: string | null) => void
  payments: Payment[]
  refundTarget: string | null
  setRefundTarget: (id: string | null) => void
  refund: (paymentId: string, amount: number) => void
  closeOverlays: () => void
  /** Bumps when overlays are reset, so pages remount with fresh filters. */
  resetNonce: number

  packs: TrainingPack[]
  setPacks: (p: TrainingPack[]) => void
  trainees: Trainee[]
  activeTraineeId: string | null
  setActiveTrainee: (id: string | null) => void
  addTrainee: (name: string) => string
  completeModule: (key: string, c: Completion) => void
  resetProgress: () => void

  tour: TourState | null
  setTour: (t: TourState | null) => void
  startTour: (packId: string, moduleId: string, lessonId?: string) => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<PageKey>('training')
  const [period, setPeriodState] = useState<Period>(periodFor('today'))
  const [timeSettingsOpen, setTimeSettingsOpen] = useState(false)
  const [openOrderId, setOpenOrderId] = useState<string | null>(null)
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS)
  const [refundTarget, setRefundTarget] = useState<string | null>(null)
  const [packs, setPacks] = useState<TrainingPack[]>([])
  const [trainees, setTrainees] = useState<Trainee[]>(loadTrainees)
  const [activeTraineeId, setActiveTrainee] = useState<string | null>(null)
  const [tour, setTour] = useState<TourState | null>(null)
  const [resetNonce, setResetNonce] = useState(0)

  const setPeriod = useCallback((key: PeriodKey, custom?: { start: string; end: string }) => {
    setPeriodState(periodFor(key, custom))
  }, [])

  const refund = useCallback((paymentId: string, amount: number) => {
    setPayments((ps) =>
      ps.map((p) =>
        p.id === paymentId ? { ...p, refunded: round2(p.refunded + amount), status: 'Refunded' } : p,
      ),
    )
  }, [])

  const closeOverlays = useCallback(() => {
    setTimeSettingsOpen(false)
    setOpenOrderId(null)
    setRefundTarget(null)
    setResetNonce((n) => n + 1)
  }, [])

  const updateTrainees = useCallback((fn: (t: Trainee[]) => Trainee[]) => {
    setTrainees((prev) => {
      const next = fn(prev)
      saveTrainees(next)
      return next
    })
  }, [])

  const addTrainee = useCallback(
    (name: string) => {
      const id = `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36).slice(-4)}`
      updateTrainees((t) => [...t, { id, name: name.trim(), role: 'Waiter', completed: {} }])
      return id
    },
    [updateTrainees],
  )

  const completeModule = useCallback(
    (key: string, c: Completion) => {
      if (!activeTraineeId) return
      updateTrainees((t) =>
        t.map((x) => (x.id === activeTraineeId ? { ...x, completed: { ...x.completed, [key]: c } } : x)),
      )
    },
    [activeTraineeId, updateTrainees],
  )

  const resetProgress = useCallback(() => setTrainees(resetTrainees()), [])

  const startTour = useCallback((packId: string, moduleId: string, lessonId?: string) => {
    setPayments(INITIAL_PAYMENTS) // demo data back to its starting state, so every run looks the same
    setTour({ packId, moduleId, lessonId, stepIndex: 0, phase: 'steps', checkIndex: 0, firstTryRight: 0 })
  }, [])

  const value = useMemo<Store>(
    () => ({
      page,
      setPage,
      period,
      setPeriod,
      timeSettingsOpen,
      setTimeSettingsOpen,
      openOrderId,
      setOpenOrderId,
      payments,
      refundTarget,
      setRefundTarget,
      refund,
      closeOverlays,
      resetNonce,
      packs,
      setPacks,
      trainees,
      activeTraineeId,
      setActiveTrainee,
      addTrainee,
      completeModule,
      resetProgress,
      tour,
      setTour,
      startTour,
    }),
    [page, period, setPeriod, timeSettingsOpen, openOrderId, payments, refundTarget, refund, closeOverlays, resetNonce, packs, trainees, activeTraineeId, addTrainee, completeModule, resetProgress, tour, startTour],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside StoreProvider')
  return s
}
