import { useState, useEffect } from 'react'
import { useHabits } from '../store/HabitContext'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

async function haptic() {
  try { await Haptics.impact({ style: ImpactStyle.Light }) } catch {}
}

const EMOJIS = {
  productivity: ['📋', '🎯', '⏰', '📚', '💡', '🧠', '✅', '📝', '🚀', '💪', '🏃', '🧘', '☕', '🎵', '🖥️', '📊'],
  finance:      ['💰', '💳', '🏦', '📈', '💵', '🪙', '💎', '🏷️', '📉', '🧾', '💸', '🤑', '🎯', '🏧', '📊', '💼'],
}

const FREQ_OPTIONS = [
  { value: 'daily',    label: 'يومي' },
  { value: 'weekdays', label: 'أيام العمل' },
  { value: 'weekends', label: 'عطلة' },
  { value: 'custom',   label: 'مخصص' },
]

const DAYS = ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب']

export default function CreateHabitScreen({ habit: editHabit, onClose }) {
  const { habits, addHabit, updateHabit, deleteHabit } = useHabits()
  const isEdit = !!editHabit

  const [name, setName]                   = useState(editHabit?.name || '')
  const [category, setCategory]           = useState(editHabit?.category || 'productivity')
  const [emoji, setEmoji]                 = useState(editHabit?.emoji || '📋')
  const [frequency, setFrequency]         = useState(editHabit?.frequency || 'daily')
  const [customDays, setCustomDays]       = useState(editHabit?.customDays || [])
  const [reminderOn, setReminderOn]       = useState(editHabit?.reminderEnabled || false)
  const [reminderTime, setReminderTime]   = useState(editHabit?.reminderTime || '09:00')
  const [stackedWith, setStackedWith]     = useState(editHabit?.stackedWith || '')
  const [showDelete, setShowDelete]       = useState(false)

  const stackOptions = habits.filter(h => h.id !== editHabit?.id)

  function toggleCustomDay(idx) {
    setCustomDays(prev =>
      prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]
    )
  }

  async function handleSubmit() {
    if (!name.trim()) return
    await haptic()

    const data = {
      name, category, emoji, frequency,
      customDays: frequency === 'custom' ? customDays : [],
      reminderEnabled: reminderOn, reminderTime,
      stackedWith: stackedWith || null,
    }

    if (isEdit) {
      updateHabit({ ...editHabit, ...data })
    } else {
      addHabit(data)
    }
    onClose()
  }

  async function handleDelete() {
    await haptic()
    deleteHabit(editHabit.id)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="anim-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.72)',
          zIndex: 40,
        }}
      />

      {/* Sheet */}
      <div
        className="anim-sheet-up pb-safe"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#111111',
          borderRadius: '20px 20px 0 0',
          zIndex: 50,
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #1e1e1e',
          borderBottom: 'none',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#2e2e2e' }} />
        </div>

        {/* Title */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 20px 16px',
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#f5f5f5' }}>
            {isEdit ? 'تعديل العادة' : 'عادة جديدة'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#525252', fontSize: 22, cursor: 'pointer', padding: 4 }}>
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="scroll-area" style={{ flex: 1, padding: '0 20px', overflow: 'auto' }}>

          {/* Name */}
          <Field label="اسم العادة">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: قراءة ٣٠ دقيقة…"
              maxLength={40}
              style={{
                width: '100%',
                background: '#161616',
                border: '1px solid #1e1e1e',
                borderRadius: 10,
                padding: '12px 14px',
                color: '#f5f5f5',
                fontSize: 15,
                outline: 'none',
                direction: 'rtl',
              }}
              onFocus={e => { e.target.style.borderColor = '#22d3ee66' }}
              onBlur={e => { e.target.style.borderColor = '#1e1e1e' }}
            />
          </Field>

          {/* Category */}
          <Field label="التصنيف">
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { value: 'productivity', label: '🎯 إنتاجية', color: '#22d3ee' },
                { value: 'finance',      label: '💰 مالية',   color: '#a78bfa' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setCategory(opt.value); setEmoji(EMOJIS[opt.value][0]) }}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: 10,
                    border: `1.5px solid ${category === opt.value ? opt.color : '#1e1e1e'}`,
                    background: category === opt.value ? opt.color + '18' : '#161616',
                    color: category === opt.value ? opt.color : '#737373',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Emoji picker */}
          <Field label="الأيقونة">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: 6,
            }}>
              {EMOJIS[category].map(em => (
                <button
                  key={em}
                  onClick={() => setEmoji(em)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 8,
                    border: `1.5px solid ${emoji === em ? '#22d3ee' : '#1e1e1e'}`,
                    background: emoji === em ? '#22d3ee18' : '#161616',
                    fontSize: 20,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </Field>

          {/* Frequency */}
          <Field label="التكرار">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {FREQ_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFrequency(opt.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: `1.5px solid ${frequency === opt.value ? '#22d3ee' : '#1e1e1e'}`,
                    background: frequency === opt.value ? '#22d3ee18' : '#161616',
                    color: frequency === opt.value ? '#22d3ee' : '#737373',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Custom days */}
          {frequency === 'custom' && (
            <Field label="الأيام">
              <div style={{ display: 'flex', gap: 6 }}>
                {DAYS.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleCustomDay(idx)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 8,
                      border: `1.5px solid ${customDays.includes(idx) ? '#22d3ee' : '#1e1e1e'}`,
                      background: customDays.includes(idx) ? '#22d3ee22' : '#161616',
                      color: customDays.includes(idx) ? '#22d3ee' : '#525252',
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {/* Reminder */}
          <Field label="التذكير">
            <div style={{
              background: '#161616',
              border: '1px solid #1e1e1e',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 14, color: '#a3a3a3' }}>تفعيل التذكير</span>
              <Toggle value={reminderOn} onChange={setReminderOn} />
            </div>
            {reminderOn && (
              <div style={{
                marginTop: 8,
                background: '#161616',
                border: '1px solid #1e1e1e',
                borderRadius: 10,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 14, color: '#a3a3a3' }}>وقت التذكير</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  style={{
                    background: '#111111',
                    border: '1px solid #2e2e2e',
                    borderRadius: 6,
                    color: '#22d3ee',
                    padding: '4px 8px',
                    fontSize: 14,
                    colorScheme: 'dark',
                  }}
                />
              </div>
            )}
          </Field>

          {/* Stack with */}
          {stackOptions.length > 0 && (
            <Field label="تكديس مع عادة">
              <select
                value={stackedWith}
                onChange={e => setStackedWith(e.target.value)}
                style={{
                  width: '100%',
                  background: '#161616',
                  border: '1px solid #1e1e1e',
                  borderRadius: 10,
                  padding: '11px 14px',
                  color: stackedWith ? '#f5f5f5' : '#525252',
                  fontSize: 14,
                  outline: 'none',
                  direction: 'rtl',
                  colorScheme: 'dark',
                }}
              >
                <option value="">— لا يوجد —</option>
                {stackOptions.map(h => (
                  <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>
                ))}
              </select>
            </Field>
          )}

          {/* Delete (edit mode) */}
          {isEdit && (
            <div style={{ marginBottom: 8 }}>
              {!showDelete ? (
                <button
                  onClick={() => setShowDelete(true)}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 10,
                    background: 'transparent', border: '1px solid #2e1e1e',
                    color: '#ef4444', fontSize: 14, cursor: 'pointer',
                  }}
                >
                  حذف العادة
                </button>
              ) : (
                <div style={{
                  background: '#1a0f0f', border: '1px solid #3e1e1e',
                  borderRadius: 10, padding: 14, textAlign: 'center',
                }}>
                  <div style={{ color: '#f5f5f5', marginBottom: 12, fontSize: 14 }}>
                    حذف "{editHabit.name}" نهائياً؟
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setShowDelete(false)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8,
                        background: '#1e1e1e', border: 'none',
                        color: '#a3a3a3', cursor: 'pointer', fontSize: 14,
                      }}
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleDelete}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 8,
                        background: '#ef4444', border: 'none',
                        color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                      }}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ height: 16 }} />
        </div>

        {/* Submit */}
        <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #1a1a1a' }}>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="toggle-btn"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              background: name.trim() ? '#22d3ee' : '#1e1e1e',
              border: 'none',
              color: name.trim() ? '#0a0a0a' : '#404040',
              fontWeight: 700,
              fontSize: 16,
              cursor: name.trim() ? 'pointer' : 'default',
              boxShadow: name.trim() ? '0 0 20px #22d3ee44' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {isEdit ? 'حفظ التغييرات' : 'إضافة العادة'}
          </button>
        </div>
      </div>
    </>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block',
        fontSize: 12,
        fontWeight: 600,
        color: '#525252',
        marginBottom: 8,
        letterSpacing: '0.04em',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 26,
        borderRadius: 13,
        background: value ? '#22d3ee' : '#1e1e1e',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3,
        left: value ? 'calc(100% - 23px)' : 3,
        width: 20, height: 20,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }} />
    </div>
  )
}
