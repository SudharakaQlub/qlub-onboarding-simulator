import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { IconCheck, IconClose } from '../components/Icons'
import { useStore } from '../store'
import { moduleKey } from './packs'

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

const PAD = 6
const CARD_W = 340

function speak(text: string) {
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1.02
    window.speechSynthesis.speak(u)
  } catch {
    /* speech not available */
  }
}

export function TourOverlay() {
  const { tour, setTour, packs, setPage, setPeriod, closeOverlays } = useStore()
  const pack = packs.find((p) => p.id === tour?.packId)
  const mod = pack?.modules.find((m) => m.id === tour?.moduleId)
  const steps = mod ? (tour?.lessonId ? mod.steps.filter((s) => s.lesson === tour.lessonId) : mod.steps) : []
  const step = tour?.phase === 'steps' ? steps[tour.stepIndex] : undefined
  const [rect, setRect] = useState<Rect | null>(null)
  const [missing, setMissing] = useState(false)
  const scrolledFor = useRef<string | null>(null)

  const exit = useCallback(() => {
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
    setTour(null)
  }, [setTour])

  const next = useCallback(() => {
    if (!tour) return
    if (tour.stepIndex < steps.length - 1) setTour({ ...tour, stepIndex: tour.stepIndex + 1 })
    else if (tour.lessonId || !mod?.checks.length) setTour({ ...tour, phase: 'done' })
    else setTour({ ...tour, phase: 'checks', checkIndex: 0, firstTryRight: 0 })
  }, [tour, steps.length, mod, setTour])

  const back = useCallback(() => {
    if (tour && tour.stepIndex > 0) setTour({ ...tour, stepIndex: tour.stepIndex - 1 })
  }, [tour, setTour])

  // Prepare the screen when a step starts.
  useEffect(() => {
    if (!step) return
    if (step.reset) closeOverlays()
    if (step.page) setPage(step.page)
    if (step.period) setPeriod(step.period)
    setRect(null)
    setMissing(false)
    scrolledFor.current = null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step?.id, tour?.packId, tour?.moduleId])

  // Track the target element (it may appear after an animation or a page change).
  useLayoutEffect(() => {
    if (!step?.target) return
    let alive = true
    const started = Date.now()
    const tick = () => {
      if (!alive) return
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
      if (el) {
        if (scrolledFor.current !== step.id) {
          scrolledFor.current = step.id
          const r = el.getBoundingClientRect()
          if (r.top < 60 || r.bottom > window.innerHeight - 40) el.scrollIntoView({ block: 'center' })
        }
        const r = el.getBoundingClientRect()
        setRect((prev) =>
          prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height
            ? prev
            : { top: r.top, left: r.left, width: r.width, height: r.height },
        )
        setMissing(false)
      } else {
        setRect(null)
        if (Date.now() - started > 2500) setMissing(true)
      }
    }
    tick()
    const id = window.setInterval(tick, 120)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [step?.id, step?.target])

  // Advance when the trainee clicks the highlighted element.
  useEffect(() => {
    if (!step || step.advance !== 'click' || !step.target) return
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.closest(`[data-tour="${step.target}"]`)) window.setTimeout(next, 120)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [step, next])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [exit])

  if (!tour || !pack || !mod) return null

  if (tour.phase === 'checks') return <Checks key={tour.checkIndex} exit={exit} />
  if (tour.phase === 'done') {
    return (
      <div className="tour-scrim center">
        <div className="tour-card center-card">
          <div className="done-badge"><IconCheck size={22} /></div>
          <h3>{tour.lessonId ? 'That’s how it’s done.' : `${mod.title} complete`}</h3>
          <p className="muted">
            {tour.lessonId
              ? 'Try it again any time from Ask a question.'
              : `You answered ${tour.firstTryRight} of ${mod.checks.length} checks right first time.`}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              exit()
              closeOverlays()
              setPage('training')
            }}
          >
            Back to training
          </button>
        </div>
      </div>
    )
  }
  if (!step) return null

  const vw = window.innerWidth
  const vh = window.innerHeight
  const hole = rect && step.target
    ? { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }
    : null

  let cardStyle: React.CSSProperties
  if (hole) {
    const spaceRight = vw - (hole.left + hole.width)
    const spaceBelow = vh - (hole.top + hole.height)
    if (spaceRight > CARD_W + 24) {
      cardStyle = { left: hole.left + hole.width + 14, top: Math.min(Math.max(hole.top, 12), vh - 280) }
    } else if (spaceBelow > 230) {
      cardStyle = { top: hole.top + hole.height + 14, left: Math.min(Math.max(hole.left, 12), vw - CARD_W - 12) }
    } else if (hole.top > 230) {
      cardStyle = { bottom: vh - hole.top + 14, left: Math.min(Math.max(hole.left, 12), vw - CARD_W - 12) }
    } else {
      cardStyle = { left: Math.max(hole.left - CARD_W - 14, 12), top: Math.min(Math.max(hole.top, 12), vh - 280) }
    }
  } else {
    cardStyle = { left: (vw - CARD_W) / 2, top: Math.max(vh / 2 - 140, 20) }
  }

  const lessonTitle = mod.lessons.find((l) => l.id === step.lesson)?.title
  const needsClick = step.advance === 'click' && !!step.target && !missing

  return (
    <>
      {hole ? (
        <>
          <div className="tour-dim" style={{ top: 0, left: 0, right: 0, height: Math.max(hole.top, 0) }} />
          <div className="tour-dim" style={{ top: hole.top + hole.height, left: 0, right: 0, bottom: 0 }} />
          <div className="tour-dim" style={{ top: hole.top, left: 0, width: Math.max(hole.left, 0), height: hole.height }} />
          <div className="tour-dim" style={{ top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height }} />
          <div className="tour-ring" style={hole} />
        </>
      ) : (
        <div className="tour-dim" style={{ inset: 0 }} />
      )}
      <div className="tour-card" style={{ ...cardStyle, width: CARD_W }} data-testid="tour-card">
        <div className="tour-top">
          <span className="eyebrow">
            {step.lesson} · {lessonTitle}
          </span>
          <button className="icon-btn" onClick={exit} title="Exit training (Esc)">
            <IconClose size={16} />
          </button>
        </div>
        <h4>{step.title}</h4>
        <p>{step.instruction}</p>
        {step.note && <div className="tour-note">{step.note}</div>}
        {missing && <div className="tour-note">Can't find this on screen. Press Next to continue.</div>}
        <div className="tour-foot">
          <div className="dots">
            {steps.map((s, i) => (
              <i key={s.id} className={i === tour.stepIndex ? 'on' : i < tour.stepIndex ? 'past' : ''} />
            ))}
          </div>
          <div className="row gap-s">
            {step.say && (
              <button className="btn btn-text small" onClick={() => speak(step.say!)} title="Read aloud">
                Listen
              </button>
            )}
            {tour.stepIndex > 0 && (
              <button className="btn btn-text small" onClick={back}>
                Back
              </button>
            )}
            {needsClick ? (
              <span className="click-hint">Click the highlighted item</span>
            ) : (
              <button className="btn btn-primary small" onClick={next} data-testid="tour-next">
                {tour.stepIndex === steps.length - 1 ? (tour.lessonId ? 'Done' : 'Check yourself') : 'Next'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function Checks({ exit }: { exit: () => void }) {
  const { tour, setTour, packs, completeModule } = useStore()
  const pack = packs.find((p) => p.id === tour?.packId)
  const mod = pack?.modules.find((m) => m.id === tour?.moduleId)

  const t = tour!
  const q = mod!.checks[t.checkIndex]
  const [picked, setPicked] = useState<number | null>(null)
  const [wrongOnce, setWrongOnce] = useState(false)
  const right = picked === q.answer
  const last = t.checkIndex === mod!.checks.length - 1
  const proceed = () => {
    const firstTryRight = t.firstTryRight + (wrongOnce ? 0 : 1)
    if (last) {
      completeModule(moduleKey(pack!.id, mod!.id), {
        at: new Date().toISOString(),
        score: firstTryRight,
        total: mod!.checks.length,
      })
      setTour({ ...t, phase: 'done', firstTryRight })
    } else {
      setTour({ ...t, checkIndex: t.checkIndex + 1, firstTryRight })
    }
  }
  return (
    <div className="tour-scrim center">
      <div className="tour-card center-card checks" data-testid="check-card">
        <div className="tour-top">
          <span className="eyebrow">
            CHECK {t.checkIndex + 1} OF {mod!.checks.length} · {mod!.title.toUpperCase()}
          </span>
          <button className="icon-btn" onClick={exit}>
            <IconClose size={16} />
          </button>
        </div>
        <h4>{q.question}</h4>
        <div className="options">
          {q.options.map((o, i) => (
            <button
              key={i}
              className={`option ${picked === i ? (i === q.answer ? 'right' : 'wrong') : ''}`}
              disabled={right}
              onClick={() => {
                setPicked(i)
                if (i !== q.answer) setWrongOnce(true)
              }}
            >
              {o}
            </button>
          ))}
        </div>
        {picked !== null && (
          <div className={`tour-note ${right ? 'good' : ''}`}>{right ? q.explain : 'Not quite. Have another look and try again.'}</div>
        )}
        <div className="tour-foot end">
          <button className="btn btn-primary small" disabled={!right} onClick={proceed} data-testid="check-next">
            {last ? 'Finish module' : 'Next question'}
          </button>
        </div>
      </div>
    </div>
  )
}
