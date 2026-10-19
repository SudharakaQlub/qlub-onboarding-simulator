import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { INITIAL_PAYMENTS, type Payment } from './data/demoVenue'
import { periodFor, round2, type Period, type PeriodKey } from './data/periods'
import { loadTrainees, resetTrainees, saveTrainees, type Completion, type Trainee } from './training/progress'
import type { TrainingPack } from './training/types'
import { loadVoiceOn, saveVoiceOn, stopSpeaking } from './training/voice'
import type { CustomerScreenId } from './data/customerApp'

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
  | 'customerApp'
  | 'settings'

/** Where "Open in panel" lands: a page, a date range and any filters to pre-fill. */
export interface PanelPreset {
  page: PageKey
  period?: { key: PeriodKey; start?: string; end?: string }
  paymentsQuery?: string
  ordersStatus?: 'All' | 'Paid' | 'Partially Paid' | 'Loyalty'
  orderId?: string
  payoutOpen?: boolean
  day?: string
}

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
  /** Filters the current page should start with (set by Open in panel). */
  panelFilter: Omit<PanelPreset, 'page' | 'period'>
  openInPanel: (p: PanelPreset) => void
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

  /** Narrate training steps and answers aloud. */
  voiceOn: boolean
  toggleVoice: () => void
  /** True while a training step needs manager rights. */
  asManager: boolean
  setAsManager: (v: boolean) => void
  /** Refund is allowed for managers, or while a lesson grants it. */
  canRefund: boolean

  /** Screen shown on the Customer App phone (guest view). */
  customerScreen: CustomerScreenId
  setCustomerScreen: (s: CustomerScreenId) => void

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
  const [tour, setTourState] = useState<TourState | null>(null)
  const [customerScreen, setCustomerScreen] = useState<CustomerScreenId>('landing')
  // Lessons change demo data (e.g. a refund). Put it back when a tour ends so figures match the deck again.
  const setTour = useCallback((t: TourState | null) => {
    if (!t) setPayments(INITIAL_PAYMENTS)
    setTourState(t)
  }, [])
  const [resetNonce, setResetNonce] = useState(0)
  const [asManager, setAsManager] = useState(false)
  const [voiceOn, setVoiceOn] = useState(loadVoiceOn)
  const toggleVoice = useCallback(() => {
    setVoiceOn((v) => {
      if (v) stopSpeaking()
      saveVoiceOn(!v)
      return !v
    })
  }, [])
  const [panelFilter, setPanelFilter] = useState<Omit<PanelPreset, 'page' | 'period'>>({})

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
    setPanelFilter({})
  }, [])

  const openInPanel = useCallback(
    ({ page: target, period: p, ...filter }: PanelPreset) => {
      closeOverlays()
      if (p) setPeriodState(periodFor(p.key, p.start && p.end ? { start: p.start, end: p.end } : undefined))
      setPanelFilter(filter)
      setPage(target)
      if (filter.orderId) setOpenOrderId(filter.orderId)
    },
    [closeOverlays],
  )

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

  const canRefund = asManager || trainees.find((t) => t.id === activeTraineeId)?.role === 'Manager'

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
      panelFilter,
      openInPanel,
      packs,
      setPacks,
      trainees,
      activeTraineeId,
      setActiveTrainee,
      addTrainee,
      completeModule,
      resetProgress,
      voiceOn,
      toggleVoice,
      asManager,
      setAsManager,
      canRefund,
      customerScreen,
      setCustomerScreen,
      tour,
      setTour,
      startTour,
    }),
    [page, period, setPeriod, timeSettingsOpen, openOrderId, payments, refundTarget, refund, closeOverlays, setTour, resetNonce, panelFilter, openInPanel, packs, trainees, activeTraineeId, addTrainee, completeModule, resetProgress, voiceOn, toggleVoice, asManager, canRefund, customerScreen, tour, startTour],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside StoreProvider')
  return s
}
