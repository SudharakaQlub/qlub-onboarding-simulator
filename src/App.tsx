import { useEffect } from 'react'
import { OrderModal } from './components/OrderModal'
import { RefundDialog } from './components/RefundDialog'
import { Sidebar } from './components/Sidebar'
import { TimeSettings } from './components/TimeSettings'
import { CustomerApp } from './pages/CustomerApp'
import { Dashboard } from './pages/Dashboard'
import { Orders } from './pages/Orders'
import { Payments } from './pages/Payments'
import { Placeholder } from './pages/Placeholder'
import { TableView } from './pages/TableView'
import { Training } from './pages/Training'
import { StoreProvider, useStore } from './store'
import { TargetDebug } from './training/TargetDebug'
import { TourOverlay } from './training/TourOverlay'
import { usePacks } from './training/packs'

function Shell() {
  const { page, setPacks, resetNonce } = useStore()
  const { packs, index, error } = usePacks()
  useEffect(() => {
    if (packs) setPacks(packs)
  }, [packs, setPacks])

  return (
    <div className="app">
      <Sidebar />
      <main className="main" key={resetNonce}>
        {error && <div className="banner">Training packs failed to load: {error}</div>}
        {page === 'dashboard' && <Dashboard />}
        {page === 'orders' && <Orders />}
        {page === 'payments' && <Payments />}
        {page === 'tableView' && <TableView />}
        {page === 'training' && <Training index={index ?? null} />}
        {page === 'customerApp' && <CustomerApp />}
        {page === 'reviews' && <Placeholder title="Reviews" />}
        {page === 'reports' && <Placeholder title="Reports" />}
        {page === 'loyalty' && <Placeholder title="Loyalty" />}
        {page === 'myClub' && <Placeholder title="My Club" />}
        {page === 'settings' && <Placeholder title="Settings" />}
      </main>
      <TimeSettings />
      <OrderModal />
      <RefundDialog />
      <TourOverlay />
      <TargetDebug />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
