import { useEffect, useState } from 'react'

/**
 * Authoring helper: open the app with ?targets=1 to outline every data-tour target
 * on the current screen with its id, so pack authors know what a step can point at.
 */
export function TargetDebug() {
  const on = new URLSearchParams(window.location.search).has('targets')
  const [boxes, setBoxes] = useState<Array<{ id: string; r: DOMRect }>>([])
  useEffect(() => {
    if (!on) return
    const t = window.setInterval(() => {
      setBoxes(
        Array.from(document.querySelectorAll<HTMLElement>('[data-tour]'))
          .map((el) => ({ id: el.dataset.tour!, r: el.getBoundingClientRect() }))
          .filter((b) => b.r.width > 0 && b.r.height > 0),
      )
    }, 500)
    return () => window.clearInterval(t)
  }, [on])
  if (!on) return null
  return (
    <div className="target-debug">
      {boxes.map((b, i) => (
        <div key={i} style={{ top: b.r.top, left: b.r.left, width: b.r.width, height: b.r.height }}>
          <span>{b.id}</span>
        </div>
      ))}
    </div>
  )
}
