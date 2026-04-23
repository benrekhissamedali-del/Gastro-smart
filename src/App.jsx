import { useState, useEffect } from 'react'
import { App as CapApp } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { HabitProvider } from './store/HabitContext'
import HomeScreen        from './screens/HomeScreen'
import AnalyticsScreen   from './screens/AnalyticsScreen'
import SettingsScreen    from './screens/SettingsScreen'
import CreateHabitScreen from './screens/CreateHabitScreen'
import BottomNav         from './components/BottomNav'
import { setupNotificationChannel } from './utils/notifications'

async function initCapacitor() {
  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#0a0a0a' })
  } catch {}
  try {
    await setupNotificationChannel()
  } catch {}
}

export default function App() {
  const [screen, setScreen]       = useState('home')
  const [showCreate, setShowCreate] = useState(false)
  const [editHabit, setEditHabit]   = useState(null)

  useEffect(() => {
    initCapacitor()

    let listener
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (showCreate || editHabit) {
        setShowCreate(false)
        setEditHabit(null)
      } else if (screen !== 'home') {
        setScreen('home')
      } else {
        CapApp.exitApp()
      }
    }).then(l => { listener = l })

    return () => { listener?.remove() }
  }, [screen, showCreate, editHabit])

  function openCreate() {
    setEditHabit(null)
    setShowCreate(true)
  }

  function openEdit(habit) {
    setEditHabit(habit)
    setShowCreate(true)
  }

  function closeCreate() {
    setShowCreate(false)
    setEditHabit(null)
  }

  return (
    <HabitProvider>
      <div style={{
        height: '100dvh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* Main content */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {screen === 'home' && (
            <HomeScreen onAdd={openCreate} onEdit={openEdit} />
          )}
          {screen === 'analytics' && (
            <AnalyticsScreen />
          )}
          {screen === 'settings' && (
            <SettingsScreen onEditHabit={openEdit} />
          )}
        </div>

        {/* Bottom navigation */}
        <BottomNav
          active={screen}
          onNavigate={setScreen}
          onAdd={openCreate}
        />

        {/* Create / Edit sheet */}
        {showCreate && (
          <CreateHabitScreen
            habit={editHabit}
            onClose={closeCreate}
          />
        )}
      </div>
    </HabitProvider>
  )
}
