import { useHabits } from '../store/HabitContext'
import { scheduleAllNotifications } from '../utils/notifications'

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 26, borderRadius: 13,
        background: value ? '#22d3ee' : '#1e1e1e',
        position: 'relative', cursor: 'pointer',
        transition: 'background 0.2s ease', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3,
        left: value ? 'calc(100% - 23px)' : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }} />
    </div>
  )
}

function Row({ label, sub, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px',
    }}>
      <div>
        <div style={{ fontSize: 14, color: '#f5f5f5' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#525252', marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#525252',
        letterSpacing: '0.06em', padding: '0 4px 8px',
      }}>
        {title}
      </div>
      <div style={{
        background: '#111111',
        border: '1px solid #1e1e1e',
        borderRadius: 14,
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: '#141414', margin: '0 16px' }} />
}

export default function SettingsScreen({ onEditHabit }) {
  const { habits, settings, updateSettings } = useHabits()

  async function toggleNotifications(val) {
    updateSettings({ notificationsEnabled: val })
    if (val) {
      await scheduleAllNotifications(habits, { ...settings, notificationsEnabled: true })
    }
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="pt-safe" style={{ padding: '16px 20px 16px', background: '#0a0a0a' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f5' }}>الإعدادات ⚙️</div>
      </div>

      <div className="scroll-area" style={{ flex: 1, padding: '0 16px 32px' }}>

        {/* Notifications */}
        <Section title="الإشعارات">
          <Row
            label="تفعيل التذكيرات"
            sub="تذكيرات يومية للعادات"
            right={
              <Toggle
                value={settings.notificationsEnabled}
                onChange={toggleNotifications}
              />
            }
          />
        </Section>

        {/* Quiet hours */}
        <Section title="أوقات الهدوء">
          <Row
            label="تفعيل أوقات الهدوء"
            sub="لا تذكيرات في هذا الوقت"
            right={
              <Toggle
                value={settings.quietHoursEnabled}
                onChange={v => updateSettings({ quietHoursEnabled: v })}
              />
            }
          />
          {settings.quietHoursEnabled && (
            <>
              <Divider />
              <div style={{ padding: '10px 16px', display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#525252', marginBottom: 6 }}>من</div>
                  <input
                    type="time"
                    value={settings.quietStart}
                    onChange={e => updateSettings({ quietStart: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#161616', border: '1px solid #1e1e1e',
                      borderRadius: 8, color: '#22d3ee',
                      padding: '8px 10px', fontSize: 14,
                      colorScheme: 'dark', outline: 'none',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#525252', marginBottom: 6 }}>إلى</div>
                  <input
                    type="time"
                    value={settings.quietEnd}
                    onChange={e => updateSettings({ quietEnd: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#161616', border: '1px solid #1e1e1e',
                      borderRadius: 8, color: '#22d3ee',
                      padding: '8px 10px', fontSize: 14,
                      colorScheme: 'dark', outline: 'none',
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </Section>

        {/* Habits management */}
        {habits.length > 0 && (
          <Section title="إدارة العادات">
            {habits.map((habit, i) => (
              <div key={habit.id}>
                <div
                  onClick={() => onEditHabit(habit)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{habit.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: '#f5f5f5' }}>{habit.name}</div>
                    <div style={{ fontSize: 11, color: '#525252', marginTop: 2 }}>
                      {habit.category === 'productivity' ? 'إنتاجية' : 'مالية'} ·{' '}
                      {habit.frequency === 'daily' ? 'يومي' :
                       habit.frequency === 'weekdays' ? 'أيام العمل' :
                       habit.frequency === 'weekends' ? 'عطلة' : 'مخصص'}
                    </div>
                  </div>
                  <span style={{ color: '#2e2e2e', fontSize: 16 }}>›</span>
                </div>
                {i < habits.length - 1 && <Divider />}
              </div>
            ))}
          </Section>
        )}

        {/* About */}
        <Section title="عن التطبيق">
          <Row
            label="HabitFlow"
            sub="الإصدار 1.0.0"
            right={<span style={{ fontSize: 20 }}>🔥</span>}
          />
        </Section>

      </div>
    </div>
  )
}
