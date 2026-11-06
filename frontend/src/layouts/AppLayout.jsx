import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="min-h-screen bg-page text-ink lg:flex">
      <Sidebar open={menuAbierto} onClose={() => setMenuAbierto(false)} />
      <div className="min-w-0 flex-1">
        <Topbar onMenu={() => setMenuAbierto(true)} />
        <main className="px-4 pb-12 sm:px-6 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
