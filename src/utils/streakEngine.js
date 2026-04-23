import { toDateStr, todayStr } from './dateUtils'

export function wasScheduledOn(dateStr, frequency, customDays = []) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const day = date.getDay()
  if (frequency === 'daily')    return true
  if (frequency === 'weekdays') return day >= 1 && day <= 5
  if (frequency === 'weekends') return day === 0 || day === 6
  if (frequency === 'custom')   return customDays.includes(day)
  return true
}

export function computeCurrentStreak(habit) {
  const { completions = {}, frequency, customDays = [], createdAt } = habit
  const today = todayStr()
  const createdDate = createdAt.split('T')[0]

  const cur = new Date()

  const todayScheduled = wasScheduledOn(today, frequency, customDays)
  if (todayScheduled && !completions[today]) {
    cur.setDate(cur.getDate() - 1)
  }

  let streak = 0
  for (let i = 0; i < 3650; i++) {
    const ds = toDateStr(cur)
    if (ds < createdDate) break

    if (!wasScheduledOn(ds, frequency, customDays)) {
      cur.setDate(cur.getDate() - 1)
      continue
    }

    if (completions[ds]) {
      streak++
      cur.setDate(cur.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

export function computeLongestStreak(habit) {
  const { completions = {}, frequency, customDays = [], createdAt } = habit
  const today = todayStr()
  const createdDate = createdAt.split('T')[0]

  let longest = 0
  let current = 0

  const start = new Date(createdDate)
  const end = new Date(today)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const ds = toDateStr(d)
    if (!wasScheduledOn(ds, frequency, customDays)) continue

    if (completions[ds]) {
      current++
      if (current > longest) longest = current
    } else if (ds < today) {
      current = 0
    }
  }

  return longest
}

export function computeCompletionRate(habit, period = 'all') {
  const { completions = {}, frequency, customDays = [], createdAt } = habit
  const today = todayStr()

  let startDate
  if (period === '7d') {
    startDate = new Date()
    startDate.setDate(startDate.getDate() - 6)
  } else if (period === '30d') {
    startDate = new Date()
    startDate.setDate(startDate.getDate() - 29)
  } else {
    startDate = new Date(createdAt.split('T')[0])
  }

  let scheduled = 0
  let completed = 0

  const end = new Date(today)
  end.setDate(end.getDate() - 1)

  for (let d = new Date(startDate); d <= end; d.setDate(d.getDate() + 1)) {
    const ds = toDateStr(d)
    if (!wasScheduledOn(ds, frequency, customDays)) continue
    scheduled++
    if (completions[ds]) completed++
  }

  if (scheduled === 0) return 0
  return Math.round((completed / scheduled) * 100)
}

export function getLast7DaysStatus(habit) {
  const result = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = toDateStr(d)
    result.push({
      date: ds,
      dayIndex: d.getDay(),
      completed: !!habit.completions?.[ds],
      scheduled: wasScheduledOn(ds, habit.frequency, habit.customDays),
      isToday: i === 0,
    })
  }
  return result
}

export function getStreakHealth(streak) {
  if (streak === 0) return 'none'
  if (streak < 3)  return 'warm'
  if (streak < 7)  return 'hot'
  if (streak < 14) return 'fire'
  if (streak < 30) return 'blaze'
  return 'inferno'
}

export function getWeeklyChartData(habits) {
  const labels = ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب']
  const data = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const ds = toDateStr(d)
    const dayName = labels[d.getDay()]

    let scheduled = 0
    let completed = 0
    habits.forEach(h => {
      if (wasScheduledOn(ds, h.frequency, h.customDays)) {
        scheduled++
        if (h.completions?.[ds]) completed++
      }
    })

    data.push({
      day: dayName,
      rate: scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0,
      completed,
      scheduled,
      isToday: i === 0,
    })
  }

  return data
}

export function getMonthlyChartData(habits) {
  const data = []

  for (let i = 3; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * 7 - 6)
    const weekStart = toDateStr(d)
    const weekEnd = new Date(d)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const label = `${d.getDate()}/${d.getMonth() + 1}`

    let scheduled = 0
    let completed = 0

    for (let j = 0; j < 7; j++) {
      const wd = new Date(d)
      wd.setDate(wd.getDate() + j)
      const ds = toDateStr(wd)
      habits.forEach(h => {
        if (wasScheduledOn(ds, h.frequency, h.customDays)) {
          scheduled++
          if (h.completions?.[ds]) completed++
        }
      })
    }

    data.push({
      label,
      rate: scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0,
    })
  }

  return data
}
