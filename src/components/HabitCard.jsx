import { useRef } from 'react'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { computeCurrentStreak, computeLongestStreak, getStreakHealth } from '../utils/streakEngine'
import { todayStr } from '../utils/dateUtils'
import { useHabits } from '../store/HabitContext'
import WeekGrid from './WeekGrid'
import StreakBadge from './StreakBadge'

const CAT_COLOR = {
  productivity: '#22d3ee',
  finance:      '#a78bfa',
}

const CAT_BG = {
  productivity: '#22d3ee14',
  finance:      '#a78bfa14',
}

async function haptic() {
  try { await Haptics.impact({ style: ImpactStyle.Medium }) } catch {}
}

export default function HabitCard({ habit, onEdit }) {
  const { toggleHabit } = useHabits()
  const today = todayStr()
  const isDone = !!habit.completions?.[today]
  const streak = computeCurrentStreak(habit)
  const longest = computeLongestStreak(habit)
  const health = getStreakHealth(streak)
  const color = CAT_COLOR[habit.category] || CAT_COLOR.productivity
  const popRef = useRef(null)

  async function handleToggle() {
    await haptic()
    if (popRef.current) {
      popRef.current.classList.remove('complete-pop')
      void popRef.current.offsetWidth
      popRef.current.classList.add('complete-pop')
    }
    toggleHabit(habit.id)
  }

  return (
    <div
      className="anim-fade-up"
      style={{
        background: '#111111',
        border: `1px solid ${isDone ? color + '33' : '#1e1e1e'}`,
        borderRadius: 18,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'border-color 0.25s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 40, height: 40,
            borderRadius: 12,
            background: isDone ? color + '22' : '#181818',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
            transition: 'background 0.25s ease',
          }}>
            {habit.emoji}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 15,
              fontWeight: 600,
              color: isDone ? color : '#f5f5f5',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              transition: 'color 0.25s ease',
            }}>
              {habit.name}
            </div>
            {longest > 0 && (
              <div style={{ fontSize: 11, color: '#525252', marginTop: 1 }}>
                أطول ستريك: {longest} يوم
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <StreakBadge streak={streak} />
          <button
            onClick={() => onEdit(habit)}
            style={{
              background: 'none', border: 'none',
              color: '#404040', cursor: 'pointer',
              padding: '4px', fontSize: 16,
            }}
          >
            ⋮
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <WeekGrid habit={habit} />

      {/* Completion Toggle */}
      <button
        ref={popRef}
        onClick={handleToggle}
        className="toggle-btn"
        style={{
          width: '100%',
          height: 46,
          borderRadius: 12,
          border: isDone ? 'none' : `1.5px dashed #2e2e2e`,
          background: isDone ? color : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer',
          transition: 'background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease',
          boxShadow: isDone ? `0 0 18px ${color}44` : 'none',
        }}
      >
        <span style={{ fontSize: 16 }}>{isDone ? '✓' : '○'}</span>
        <span style={{
          fontSize: 14,
          fontWeight: 600,
          color: isDone ? '#0a0a0a' : '#404040',
          transition: 'color 0.2s ease',
        }}>
          {isDone ? 'أنجزت اليوم' : 'إنجاز اليوم'}
        </span>
      </button>
    </div>
  )
}
