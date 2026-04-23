import { useState } from 'react'
import { useHabits } from '../store/HabitContext'
import { getGreeting, formatDateArabic } from '../utils/dateUtils'
import { todayStr } from '../utils/dateUtils'
import { wasScheduledOn } from '../utils/streakEngine'
import HabitCard from '../components/HabitCard'
import TodayRing from '../components/TodayRing'
import EmptyState from '../components/EmptyState'

const CAT_META = {
  productivity: { label: 'الإنتاجية', color: '#22d3ee', dot: '●' },
  finance:      { label: 'المالية',   color: '#a78bfa', dot: '●' },
}

export default function HomeScreen({ onAdd, onEdit }) {
  const { habits, loaded } = useHabits()
  const today = todayStr()

  if (!loaded) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: '#404040', fontSize: 14 }}>جاري التحميل…</div>
      </div>
    )
  }

  const productivity = habits.filter(h => h.category === 'productivity')
  const finance      = habits.filter(h => h.category === 'finance')
  const hasAny       = habits.length > 0

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        className="pt-safe"
        style={{
          padding: '12px 20px 0',
          background: '#0a0a0a',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: '#525252', marginBottom: 2 }}>
              {formatDateArabic()}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f5' }}>
              {getGreeting()} 👋
            </div>
          </div>
          {hasAny && <TodayRing habits={habits} />}
        </div>
      </div>

      {/* Content */}
      <div
        className="scroll-area"
        style={{ flex: 1, padding: '0 16px 16px' }}
      >
        {!hasAny ? (
          <EmptyState onAdd={onAdd} />
        ) : (
          <>
            {[
              { key: 'productivity', list: productivity },
              { key: 'finance',      list: finance },
            ].map(({ key, list }) => {
              if (list.length === 0) return null
              const meta = CAT_META[key]
              return (
                <section key={key} style={{ marginBottom: 24 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    marginBottom: 12,
                    paddingTop: 4,
                  }}>
                    <span style={{ color: meta.color, fontSize: 8 }}>{meta.dot}</span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#737373',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      {meta.label}
                    </span>
                    <span style={{
                      fontSize: 11,
                      color: '#404040',
                      background: '#181818',
                      borderRadius: 6,
                      padding: '1px 6px',
                      marginRight: 'auto',
                    }}>
                      {list.filter(h => h.completions?.[today]).length}/{list.filter(h => wasScheduledOn(today, h.frequency, h.customDays)).length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {list.map((habit, i) => (
                      <div
                        key={habit.id}
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <HabitCard habit={habit} onEdit={onEdit} />
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
