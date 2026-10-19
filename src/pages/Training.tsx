import { useMemo, useState } from 'react'
import { IconCheck, IconMic, IconPlay, IconSearch } from '../components/Icons'
import { TopBar } from '../components/TopBar'
import { moduleKey } from '../training/packs'
import type { Faq, TrainingPack } from '../training/types'
import { useStore } from '../store'
import type { PackIndex } from '../training/types'

export function Training({ index }: { index: PackIndex | null }) {
  const { packs, trainees, activeTraineeId, setActiveTrainee } = useStore()
  const me = trainees.find((t) => t.id === activeTraineeId)
  return (
    <>
      <TopBar title="Staff Training" showDate={false} />
      <div className="content training">
        {me ? <PersonalPlan /> : <WhoIsTraining />}
        <Catalog packs={packs} index={index} />
        <TeamProgress onPick={setActiveTrainee} />
      </div>
    </>
  )
}

function WhoIsTraining() {
  const { trainees, setActiveTrainee, addTrainee, packs } = useStore()
  const [name, setName] = useState('')
  const total = packs.reduce((s, p) => s + p.modules.length, 0)
  const submit = () => {
    const n = name.trim()
    if (!n) return
    const found = trainees.find((t) => t.name.toLowerCase() === n.toLowerCase())
    setActiveTrainee(found ? found.id : addTrainee(n))
    setName('')
  }
  return (
    <div className="card hero" data-tour="who-card">
      <div className="hero-text">
        <div className="eyebrow">ONBOARDING SIMULATOR</div>
        <h2>Who's training today?</h2>
        <p className="muted">No login needed. Type your name and we'll pick up where you left off.</p>
        <form
          className="name-form"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            className="input big"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-tour="name-input"
          />
          <button className="btn btn-primary" type="submit" data-tour="name-continue">
            Continue
          </button>
          <button type="button" className="btn btn-outline mic" disabled title="Voice sign-in comes with the voice agent">
            <IconMic size={16} />
          </button>
        </form>
        <div className="staff-chips">
          {trainees.map((t) => {
            const done = Object.keys(t.completed).length
            return (
              <button key={t.id} className="chip" onClick={() => setActiveTrainee(t.id)} data-tour={`staff-${t.id}`}>
                <span className="avatar">{t.name[0]}</span>
                {t.name}
                <span className="muted small">
                  {done >= total && total > 0 ? 'trained' : `${done}/${total}`}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PersonalPlan() {
  const { trainees, activeTraineeId, setActiveTrainee, packs, startTour } = useStore()
  const me = trainees.find((t) => t.id === activeTraineeId)!
  const modules = packs.flatMap((p) => p.modules.map((m) => ({ pack: p, m, key: moduleKey(p.id, m.id) })))
  const done = modules.filter((x) => me.completed[x.key]).length
  const trained = modules.length > 0 && done === modules.length
  const next = modules.find((x) => !me.completed[x.key])
  const minutesLeft = modules.filter((x) => !me.completed[x.key]).reduce((s, x) => s + x.m.minutes, 0)

  return (
    <>
      <div className="card hero">
        <div className="hero-text">
          <div className="eyebrow">{trained ? 'TRAINED' : 'YOUR TRAINING PLAN'}</div>
          <h2>
            Hi {me.name}
            {trained ? ', you’re all set.' : '.'}
          </h2>
          <p className="muted">
            {trained
              ? 'You’ve finished every module. Ask anything below and we’ll walk you through it on the real screen.'
              : `${done} of ${modules.length} modules done · about ${minutesLeft} minutes left. Each step happens on the real panel: click what’s highlighted.`}
          </p>
          <div className="progress">
            <div style={{ width: `${modules.length ? (done / modules.length) * 100 : 0}%` }} />
          </div>
          <div className="row gap">
            {next && (
              <button className="btn btn-primary" onClick={() => startTour(next.pack.id, next.m.id)} data-tour="start-next">
                <IconPlay size={14} /> {done ? 'Continue' : 'Start'}: {next.m.title}
              </button>
            )}
            <button className="btn btn-text" onClick={() => setActiveTrainee(null)}>
              Not {me.name}? Switch person
            </button>
          </div>
        </div>
      </div>

      <div className={`plan-grid ${trained ? 'trained' : ''}`}>
        <div className="card">
          <h3>Modules</h3>
          {modules.map(({ pack, m, key }, i) => {
            const c = me.completed[key]
            return (
              <div className={`module-row ${c ? 'done' : ''}`} key={key} data-tour={`module-${m.id}`}>
                <div className="module-num">{c ? <IconCheck size={16} /> : i + 1}</div>
                <div className="grow">
                  <b>{m.title}</b> <span className="muted small">· ~{m.minutes} min · {pack.product}</span>
                  <div className="muted small">{m.lessons.map((l) => l.title).join(' · ')}</div>
                  {c && (
                    <div className="small ok">
                      Passed {c.score}/{c.total} first try
                    </div>
                  )}
                </div>
                <button className={`btn ${c ? 'btn-outline' : 'btn-primary'} small`} onClick={() => startTour(pack.id, m.id)}>
                  {c ? 'Retake' : 'Start'}
                </button>
              </div>
            )
          })}
        </div>
        <AskBox highlight={trained} />
      </div>
    </>
  )
}

function score(f: Faq, q: string) {
  const words = q.toLowerCase().split(/\W+/).filter((w) => w.length > 2)
  if (!words.length) return 0
  const hay = `${f.q} ${f.a} ${(f.keywords ?? []).join(' ')}`.toLowerCase()
  return words.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0)
}

function AskBox({ highlight }: { highlight: boolean }) {
  const { packs, startTour } = useStore()
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState<{ f: Faq; pack: TrainingPack } | null>(null)
  const all = useMemo(() => packs.flatMap((pack) => pack.faqs.map((f) => ({ f, pack }))), [packs])
  const results = q.trim()
    ? all.map((x) => ({ ...x, s: score(x.f, q) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 5)
    : all.slice(0, 6).map((x) => ({ ...x, s: 0 }))

  const show = (x: { f: Faq; pack: TrainingPack }) => {
    if (!x.f.lesson) return
    const [moduleId, lessonId] = x.f.lesson.split('/')
    startTour(x.pack.id, moduleId, lessonId)
  }

  return (
    <div className={`card ask ${highlight ? 'glow' : ''}`} data-tour="ask-box">
      <h3>Ask a question</h3>
      <p className="muted small">Type it the way you'd say it. Voice is coming next.</p>
      <label className="input-wrap">
        <IconSearch size={15} />
        <input
          placeholder="e.g. How do I refund a guest?"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setPicked(null)
          }}
          data-tour="ask-input"
        />
        <IconMic size={16} className="muted" />
      </label>
      {picked ? (
        <div className="answer">
          <div className="answer-q">{picked.f.q}</div>
          <p>{picked.f.a}</p>
          <div className="row gap">
            {picked.f.lesson && (
              <button className="btn btn-primary small" onClick={() => show(picked)} data-tour="ask-show-me">
                <IconPlay size={12} /> Show me on the panel
              </button>
            )}
            <button className="btn btn-text small" onClick={() => setPicked(null)}>
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="faq-list">
          {!q.trim() && <div className="eyebrow">TOP QUESTIONS</div>}
          {results.length === 0 && <p className="muted small">No match yet. Ask your manager, or try other words.</p>}
          {results.map((x, i) => (
            <button key={i} className="faq" onClick={() => setPicked(x)} data-tour={i === 0 ? 'ask-first-result' : undefined}>
              {x.f.q}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Catalog({ packs, index }: { packs: TrainingPack[]; index: PackIndex | null }) {
  return (
    <div className="card">
      <div className="card-head">
        <h3>Training catalog</h3>
        <span className="muted small">Packs load from /packs. Add a folder to add a training.</span>
      </div>
      <div className="catalog">
        {packs.map((p) => (
          <div className="pack" key={p.id}>
            <div className="eyebrow">{p.product.toUpperCase()} · {p.market}</div>
            <b>{p.title}</b>
            <p className="muted small">{p.description}</p>
            <div className="muted tiny">
              {p.modules.length} modules · {p.modules.reduce((s, m) => s + m.steps.length, 0)} steps · v{p.version}
            </div>
          </div>
        ))}
        {index?.comingSoon?.map((c) => (
          <div className="pack soon" key={c.title}>
            <div className="eyebrow">{c.product.toUpperCase()}</div>
            <b>{c.title}</b>
            <p className="muted small">Content in progress · {c.owner}</p>
            <div className="muted tiny">Coming soon</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TeamProgress({ onPick }: { onPick: (id: string) => void }) {
  const { trainees, packs, resetProgress } = useStore()
  const modules = packs.flatMap((p) => p.modules.map((m) => ({ key: moduleKey(p.id, m.id), title: m.title })))
  return (
    <div className="card" data-tour="team-progress">
      <div className="card-head">
        <h3>Team progress</h3>
        <span className="muted small">Manager view</span>
      </div>
      <table className="grid">
        <thead>
          <tr>
            <th>Staff</th>
            <th>Role</th>
            {modules.map((m) => (
              <th key={m.key}>{m.title}</th>
            ))}
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {trainees.map((t) => {
            const done = modules.filter((m) => t.completed[m.key]).length
            return (
              <tr key={t.id} className="clickable" onClick={() => onPick(t.id)}>
                <td>
                  <span className="avatar sm">{t.name[0]}</span> {t.name}
                </td>
                <td>{t.role}</td>
                {modules.map((m) => {
                  const c = t.completed[m.key]
                  return (
                    <td key={m.key}>
                      {c ? (
                        <span className="ok">
                          <IconCheck size={14} /> {c.score}/{c.total}
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  )
                })}
                <td>
                  <span className={`pill ${done === modules.length && modules.length ? 'green' : done ? 'orange' : 'grey'}`}>
                    {done === modules.length && modules.length ? 'Ready' : done ? 'In progress' : 'Not started'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button className="btn btn-text small" onClick={resetProgress}>
        Reset demo progress
      </button>
    </div>
  )
}
