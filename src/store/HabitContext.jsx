import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import { Preferences } from '@capacitor/preferences'

const KEY = 'habitflow_v1'

const DEFAULT_SETTINGS = {
  notificationsEnabled: false,
  quietHoursEnabled: false,
  quietStart: '22:00',
  quietEnd: '08:00',
}

const INIT_STATE = {
  habits: [],
  settings: DEFAULT_SETTINGS,
  loaded: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...INIT_STATE, ...action.data, loaded: true }

    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.habit] }

    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h => h.id === action.habit.id ? { ...h, ...action.habit } : h),
      }

    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter(h => h.id !== action.id) }

    case 'TOGGLE': {
      const today = (() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      })()
      const hour = new Date().getHours()

      return {
        ...state,
        habits: state.habits.map(h => {
          if (h.id !== action.id) return h
          const comps = { ...h.completions }
          const wasDone = !!comps[today]
          if (wasDone) {
            delete comps[today]
          } else {
            comps[today] = true
          }
          const prevTimes = h.smartReminderData?.completionTimes || []
          const newTimes = wasDone ? prevTimes : [...prevTimes, hour].slice(-14)
          return {
            ...h,
            completions: comps,
            smartReminderData: { completionTimes: newTimes },
          }
        }),
      }
    }

    case 'REORDER': {
      const { from, to } = action
      const habits = [...state.habits]
      const [moved] = habits.splice(from, 1)
      habits.splice(to, 0, moved)
      return { ...state, habits }
    }

    case 'SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } }

    default:
      return state
  }
}

const Ctx = createContext(null)

export function HabitProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INIT_STATE)
  const saveTimer = useRef(null)

  useEffect(() => {
    Preferences.get({ key: KEY })
      .then(({ value }) => {
        const data = value ? JSON.parse(value) : {}
        dispatch({ type: 'LOAD', data })
      })
      .catch(() => dispatch({ type: 'LOAD', data: {} }))
  }, [])

  useEffect(() => {
    if (!state.loaded) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const payload = { habits: state.habits, settings: state.settings }
      Preferences.set({ key: KEY, value: JSON.stringify(payload) }).catch(() => {
        try { localStorage.setItem(KEY, JSON.stringify(payload)) } catch {}
      })
    }, 300)
  }, [state.habits, state.settings, state.loaded])

  const addHabit = useCallback((data) => {
    dispatch({
      type: 'ADD_HABIT',
      habit: {
        id: `h_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: data.name.trim(),
        emoji: data.emoji || '✨',
        category: data.category || 'productivity',
        frequency: data.frequency || 'daily',
        customDays: data.customDays || [],
        reminderEnabled: data.reminderEnabled || false,
        reminderTime: data.reminderTime || '09:00',
        stackedWith: data.stackedWith || null,
        completions: {},
        smartReminderData: { completionTimes: [] },
        createdAt: new Date().toISOString(),
      },
    })
  }, [])

  const updateHabit    = useCallback((habit)    => dispatch({ type: 'UPDATE_HABIT', habit }), [])
  const deleteHabit    = useCallback((id)        => dispatch({ type: 'DELETE_HABIT', id }), [])
  const toggleHabit    = useCallback((id)        => dispatch({ type: 'TOGGLE', id }), [])
  const reorderHabits  = useCallback((from, to)  => dispatch({ type: 'REORDER', from, to }), [])
  const updateSettings = useCallback((settings)  => dispatch({ type: 'SETTINGS', settings }), [])

  return (
    <Ctx.Provider value={{
      habits: state.habits,
      settings: state.settings,
      loaded: state.loaded,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleHabit,
      reorderHabits,
      updateSettings,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useHabits() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useHabits outside HabitProvider')
  return ctx
}
