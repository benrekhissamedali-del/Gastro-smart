async function getLocalNotifications() {
  try {
    const mod = await import('@capacitor/local-notifications')
    return mod.LocalNotifications
  } catch {
    return null
  }
}

function hashId(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 2147483647
}

export function computeSmartReminderTime(habit) {
  const times = habit.smartReminderData?.completionTimes
  if (!times?.length) return habit.reminderTime
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
  const adjusted = Math.max(6, Math.min(22, avg))
  return `${String(adjusted).padStart(2, '0')}:00`
}

export async function setupNotificationChannel() {
  const LN = await getLocalNotifications()
  if (!LN) return
  try {
    await LN.createChannel({
      id: 'habit-reminders',
      name: 'تذكيرات العادات',
      description: 'تذكيرات يومية للعادات',
      importance: 4,
      vibration: true,
    })
  } catch {}
}

export async function scheduleAllNotifications(habits, settings) {
  if (!settings.notificationsEnabled) return
  const LN = await getLocalNotifications()
  if (!LN) return

  try {
    const { display } = await LN.requestPermissions()
    if (display !== 'granted') return

    const pending = await LN.getPending()
    if (pending.notifications?.length) {
      await LN.cancel({ notifications: pending.notifications })
    }

    const toSchedule = habits
      .filter(h => h.reminderEnabled)
      .map(h => {
        const time = computeSmartReminderTime(h)
        const [hours, minutes] = time.split(':').map(Number)
        return {
          id: hashId(h.id),
          title: 'وقت عادتك! 🔥',
          body: `حافظ على ستريكك — ${h.name}`,
          schedule: {
            on: { hour: hours, minute: minutes },
            repeats: true,
            allowWhileIdle: true,
          },
          sound: null,
          channelId: 'habit-reminders',
        }
      })

    if (toSchedule.length > 0) {
      await LN.schedule({ notifications: toSchedule })
    }
  } catch (e) {
    console.warn('Notifications:', e)
  }
}
