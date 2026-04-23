import { useEffect, useRef } from 'react'
import { todayStr } from '../utils/dateUtils'
import { wasScheduledOn } from '../utils/streakEngine'

export default function TodayRing({ habits }) {
  const today = todayStr()

  const scheduled = habits.filter(h => wasScheduledOn(today, h.frequency, h.customDays))
  const completed = scheduled.filter(h => h.completions?.[today])
  const total = scheduled.length
  const done = completed.length

  const r = 36
  const circ = 2 * Math.PI * r
  const pct = total > 0 ? done / total : 0
  const offset = circ * (1 - pct)

  const circleRef = useRef(null)

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = offset
    }
  }, [offset])

  const allDone = total > 0 && done === total
  const color = allDone ? '#4ade80' : '#22d3ee'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 88, height: 88 }}>
        <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="44" cy="44" r={r}
            fill="none"
            stroke="#1e1e1e"
            strokeWidth="6"
          />
          <circle
            ref={circleRef}
            cx="44" cy="44" r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ}
            style={{
              transition: 'stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease',
              filter: `drop-shadow(0 0 6px ${color}88)`,
            }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {allDone ? (
            <span style={{ fontSize: 24 }}>✅</span>
          ) : (
            <>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#f5f5f5', lineHeight: 1 }}>
                {done}
              </span>
              <span style={{ fontSize: 11, color: '#525252' }}>/{total}</span>
            </>
          )}
        </div>
      </div>
      <span style={{ fontSize: 12, color: '#737373' }}>
        {allDone ? 'أنجزت اليوم كله! 🎉' : 'عادات اليوم'}
      </span>
    </div>
  )
}
