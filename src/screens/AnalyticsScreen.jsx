import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { useHabits } from '../store/HabitContext'
import {
  computeCurrentStreak, computeLongestStreak,
  computeCompletionRate, getWeeklyChartData, getMonthlyChartData
} from '../utils/streakEngine'

const PERIODS = [
  { key: '7d',   label: 'أسبوع' },
  { key: '30d',  label: 'شهر' },
  { key: 'all',  label: 'كل الوقت' },
]

const CAT_COLOR = {
  productivity: '#22d3ee',
  finance:      '#a78bfa',
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      flex: 1,
      background: '#111111',
      border: '1px solid #1e1e1e',
      borderRadius: 14,
      padding: '14px 12px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || '#f5f5f5', lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: '#404040', marginTop: 2 }}>{sub}</div>}
      <div style={{ fontSize: 11, color: '#525252', marginTop: 6 }}>{label}</div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#181818',
      border: '1px solid #2e2e2e',
      borderRadius: 8,
      padding: '6px 10px',
    }}>
      <div style={{ fontSize: 13, color: '#f5f5f5', fontWeight: 600 }}>{payload[0]?.value}%</div>
      <div style={{ fontSize: 11, color: '#525252' }}>{label}</div>
    </div>
  )
}

export default function AnalyticsScreen() {
  const { habits } = useHabits()
  const [period, setPeriod] = useState('7d')

  const weekData  = getWeeklyChartData(habits)
  const monthData = getMonthlyChartData(habits)
  const chartData = period === '7d' ? weekData : period === '30d' ? monthData : weekData

  const totalCompletions = habits.reduce((acc, h) => {
    return acc + Object.keys(h.completions || {}).length
  }, 0)

  const bestStreak = habits.reduce((max, h) => {
    return Math.max(max, computeLongestStreak(h))
  }, 0)

  const avgRate = habits.length > 0
    ? Math.round(
        habits.reduce((acc, h) => acc + computeCompletionRate(h, period), 0) / habits.length
      )
    : 0

  if (habits.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 48 }}>📊</div>
          <div style={{ fontSize: 15, color: '#525252', textAlign: 'center', padding: '0 40px' }}>
            أضف عادات لتبدأ برؤية تحليلاتك
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div className="scroll-area" style={{ flex: 1, padding: '0 16px 24px' }}>

        {/* Period selector */}
        <div style={{
          display: 'flex',
          background: '#111111',
          borderRadius: 10,
          padding: 3,
          marginBottom: 20,
          border: '1px solid #1e1e1e',
        }}>
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 8,
                border: 'none',
                background: period === p.key ? '#1e1e1e' : 'transparent',
                color: period === p.key ? '#f5f5f5' : '#525252',
                fontSize: 13,
                fontWeight: period === p.key ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <StatCard label="معدل الإنجاز"    value={`${avgRate}%`}           color="#22d3ee" />
          <StatCard label="أطول ستريك"       value={bestStreak}   sub="يوم"  color="#f97316" />
          <StatCard label="إجمالي الإنجازات" value={totalCompletions}       color="#4ade80" />
        </div>

        {/* Bar Chart */}
        <div style={{
          background: '#111111',
          border: '1px solid #1e1e1e',
          borderRadius: 16,
          padding: '16px 8px 8px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#737373', marginBottom: 16, paddingRight: 10 }}>
            معدل الإنجاز اليومي
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={period === '7d' ? 28 : 18}>
              <XAxis
                dataKey="day"
                tick={{ fill: '#525252', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.isToday ? '#22d3ee' : '#1e1e1e'}
                    style={{ transition: 'fill 0.3s' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Per-habit breakdown */}
        <div style={{
          background: '#111111',
          border: '1px solid #1e1e1e',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #1a1a1a' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#737373' }}>تفاصيل كل عادة</span>
          </div>
          {habits.map((habit, i) => {
            const rate    = computeCompletionRate(habit, period)
            const streak  = computeCurrentStreak(habit)
            const color   = CAT_COLOR[habit.category] || '#22d3ee'
            return (
              <div
                key={habit.id}
                className="anim-fade-up"
                style={{
                  padding: '12px 16px',
                  borderBottom: i < habits.length - 1 ? '1px solid #141414' : 'none',
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{habit.emoji}</span>
                  <span style={{ flex: 1, fontSize: 14, color: '#f5f5f5', fontWeight: 500 }}>
                    {habit.name}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>
                    {rate}%
                  </span>
                  <span style={{ fontSize: 12, color: '#525252', minWidth: 48, textAlign: 'left' }}>
                    🔥 {streak}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{
                  height: 4, borderRadius: 2,
                  background: '#1e1e1e', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 2,
                    width: `${rate}%`,
                    background: color,
                    transition: 'width 0.7s ease',
                    boxShadow: `0 0 6px ${color}66`,
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="pt-safe" style={{ padding: '16px 20px 16px', background: '#0a0a0a' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f5' }}>التحليلات 📊</div>
    </div>
  )
}
