import { TopBar } from '../components/TopBar'
import { CUSTOMER_SCREENS, hotspotStyle, screenById } from '../data/customerApp'
import { useStore } from '../store'

/**
 * The guest's phone. Shows real Customer App screenshots with tap targets on top, so Customer App
 * lessons work exactly like Vendor Panel ones: steps point at "ca-…" data-tour targets.
 * Outside a lesson the phone can be explored: tapping a button opens the next screen.
 */
export function CustomerApp() {
  const { customerScreen, setCustomerScreen, tour } = useStore()
  const screen = screenById(customerScreen)
  const base = import.meta.env.BASE_URL

  return (
    <>
      <TopBar title="Customer App · guest view" showDate={false} />
      <div className="content ca-page">
        <div className="ca-stage">
          <div className="ca-phone" data-tour="ca-phone">
            <div className="ca-notch" />
            <div className="ca-screen" data-tour="ca-screen">
              <div className="ca-shot">
                <img src={`${base}customer-app/${screen.id}.jpg`} alt={`Customer App: ${screen.title}`} draggable={false} />
                {screen.hotspots.map((h) => (
                  <button
                    key={h.id}
                    className={`ca-hot ${h.goTo ? 'tappable' : ''}`}
                    style={hotspotStyle(screen, h)}
                    data-tour={`ca-${h.id}`}
                    aria-label={h.label}
                    title={h.goTo && !tour ? `${h.label}: opens ${screenById(h.goTo).title}` : h.label}
                    onClick={() => {
                      if (!tour && h.goTo) setCustomerScreen(h.goTo)
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="card ca-side">
          <div className="eyebrow">WHAT THE GUEST SEES</div>
          <h3>{screen.title}</h3>
          <p className="muted">
            Real Customer App screens. Tap the buttons on the phone to move through them like a guest would, or jump to a
            screen below. Customer App lessons in Staff Training run on this phone.
          </p>
          <div className="ca-screens">
            {CUSTOMER_SCREENS.map((s) => (
              <button
                key={s.id}
                className={`chip ${s.id === screen.id ? 'active' : ''}`}
                onClick={() => setCustomerScreen(s.id)}
                data-tour={`ca-pick-${s.id}`}
              >
                {s.title}
              </button>
            ))}
          </div>
          <p className="muted small ca-flag">
            Screens captured at live venues. Swap for demo-venue captures before sharing outside the team.
          </p>
        </aside>
      </div>
    </>
  )
}
