import { useState } from 'react'
import Dashboard from './pages/Dashboard.jsx'
import Tables from './pages/Tables.jsx'
import Menu from './pages/Menu.jsx'
import Commandes from './pages/Commandes.jsx'
import BottomNav from './components/BottomNav.jsx'

export default function App() {
  const [page, setPage] = useState('dashboard')

  const pages = {
    dashboard: <Dashboard />,
    tables: <Tables />,
    menu: <Menu />,
    commandes: <Commandes />,
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {pages[page]}
      </div>
      <BottomNav current={page} onChange={setPage} />
    </div>
  )
}
