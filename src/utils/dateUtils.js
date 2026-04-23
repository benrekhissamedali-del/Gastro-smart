export function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayStr() {
  return toDateStr(new Date())
}

export function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toDateStr(d)
}

export function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({ str: toDateStr(d), dayIndex: d.getDay(), isToday: i === 0 })
  }
  return days
}

export function getLast30Days() {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({ str: toDateStr(d), dayIndex: d.getDay() })
  }
  return days
}

export function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'مساء النور'
  return 'مساء الخير'
}

export function formatDateArabic(date = new Date()) {
  return new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

const DAY_SHORTS = ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب']
export function getDayShort(dayIndex) {
  return DAY_SHORTS[dayIndex]
}
