// Training pack format. A pack is plain JSON in public/packs/<id>/pack.json,
// listed in public/packs/index.json. Adding a training never needs code changes
// as long as its steps point at existing data-tour targets (see docs/TARGETS.md).

import type { PeriodKey } from '../data/periods'
import type { PageKey } from '../store'

export interface TrainingStep {
  id: string
  /** Lesson this step belongs to, e.g. "1A". Quick help replays a single lesson. */
  lesson: string
  title: string
  /** What the trainee should do or notice. */
  instruction: string
  /** data-tour id of the element to highlight. Omit for a centred info card. */
  target?: string
  /** "click": advances when the trainee clicks the target. "next": trainee presses Next. */
  advance: 'click' | 'next'
  /** Navigate to this page when the step starts (skip for steps where the trainee clicks the menu). */
  page?: PageKey
  /** Close open drawers and dialogs when the step starts. */
  reset?: boolean
  /** Set the panel's date range when the step starts, so the screen has data to show. */
  period?: PeriodKey
  /** Act as a manager during this step (e.g. so Refund is enabled). */
  asManager?: boolean
  /** Highlighted tip, e.g. a common mistake. */
  note?: string
  /** What the assistant would say aloud (used by the voice agent later). */
  say?: string
}

export interface CheckQuestion {
  question: string
  options: string[]
  answer: number
  explain: string
}

export interface Lesson {
  id: string
  title: string
}

export interface TrainingModule {
  id: string
  title: string
  minutes: number
  summary: string
  lessons: Lesson[]
  steps: TrainingStep[]
  checks: CheckQuestion[]
}

export interface Faq {
  q: string
  a: string
  /** Lesson to replay as a walkthrough, "moduleId/lessonId". */
  lesson?: string
  keywords?: string[]
}

export interface TrainingPack {
  id: string
  title: string
  product: string
  market: string
  version: string
  description: string
  modules: TrainingModule[]
  faqs: Faq[]
}

export interface PackIndex {
  packs: string[]
  comingSoon?: Array<{ title: string; product: string; owner: string }>
}
