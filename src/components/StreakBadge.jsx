import { getStreakHealth } from '../utils/streakEngine'

const HEALTH_STYLES = {
  none:    { icon: '',   color: '#404040', glow: false },
  warm:    { icon: '🌱', color: '#facc15', glow: false },
  hot:     { icon: '🔥', color: '#f97316', glow: false },
  fire:    { icon: '🔥', color: '#f97316', glow: true },
  blaze:   { icon: '🔥', color: '#ef4444', glow: true },
  inferno: { icon: '💥', color: '#ef4444', glow: true },
}

export default function StreakBadge({ streak, size = 'md' }) {
  const health = getStreakHealth(streak)
  const { icon, color, glow } = HEALTH_STYLES[health]

  const numSize = size === 'lg' ? 32 : size === 'sm' ? 18 : 24
  const iconSize = size === 'lg' ? 20 : size === 'sm' ? 12 : 14

  if (streak === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <span style={{ fontSize: numSize, fontWeight: 700, color: '#404040', lineHeight: 1 }}>
          0
        </span>
        <span style={{ fontSize: 11, color: '#404040', alignSelf: 'flex-end', paddingBottom: 2 }}>
          يوم
        </span>
      </div>
    )
  }

  return (
    <div
      className="streak-num"
      style={{ display: 'flex', alignItems: 'center', gap: 3 }}
    >
      <span
        style={{
          fontSize: numSize,
          fontWeight: 800,
          color,
          lineHeight: 1,
          textShadow: glow ? `0 0 12px ${color}99` : 'none',
        }}
      >
        {streak}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'flex-end', paddingBottom: 2, gap: 0 }}>
        <span style={{ fontSize: iconSize, lineHeight: 1.2 }}>{icon}</span>
        <span style={{ fontSize: 10, color: '#737373', lineHeight: 1 }}>يوم</span>
      </div>
    </div>
  )
}
