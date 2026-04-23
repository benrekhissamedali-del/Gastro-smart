import { getLast7DaysStatus } from '../utils/streakEngine'
import { getDayShort } from '../utils/dateUtils'

const CAT_COLOR = {
  productivity: '#22d3ee',
  finance: '#a78bfa',
}

export default function WeekGrid({ habit }) {
  const days = getLast7DaysStatus(habit)
  const color = CAT_COLOR[habit.category] || '#22d3ee'

  return (
    <div className="flex items-end gap-[5px] w-full">
      {days.map((d, i) => {
        let bg = '#1e1e1e'
        let opacity = 1
        let ring = false

        if (!d.scheduled) {
          bg = '#0f0f0f'
          opacity = 0.35
        } else if (d.isToday && !d.completed) {
          ring = true
          bg = 'transparent'
        } else if (d.completed) {
          bg = color
        } else {
          bg = '#1e1e1e'
        }

        return (
          <div key={i} className="flex flex-col items-center gap-[4px] flex-1">
            <div
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 6,
                background: bg,
                opacity,
                border: ring ? `1.5px solid ${color}` : 'none',
                boxShadow: d.completed && !d.isToday ? `0 0 6px ${color}55` : 'none',
                transition: 'background 0.2s ease',
              }}
            />
            <span style={{ fontSize: 10, color: '#525252', lineHeight: 1 }}>
              {getDayShort(d.dayIndex)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
