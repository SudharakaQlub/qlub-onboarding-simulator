import { TopBar } from '../components/TopBar'

export function Placeholder({ title }: { title: string }) {
  return (
    <>
      <TopBar title={title} showDate={false} />
      <div className="content">
        <div className="card empty-state">
          <h3>{title}</h3>
          <p className="muted">Not part of the training demo yet. A future training pack can add this screen.</p>
        </div>
      </div>
    </>
  )
}
