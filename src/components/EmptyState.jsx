export default function EmptyState({ onAdd }) {
  return (
    <div
      className="anim-fade-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        gap: 16,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 56 }}>🌱</div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 600, color: '#f5f5f5', marginBottom: 8 }}>
          لا توجد عادات بعد
        </div>
        <div style={{ fontSize: 14, color: '#525252', lineHeight: 1.6 }}>
          ابدأ بإضافة عادتك الأولى وابنِ روتيناً يومياً قوياً
        </div>
      </div>
      <button
        onClick={onAdd}
        className="toggle-btn"
        style={{
          marginTop: 8,
          padding: '12px 28px',
          borderRadius: 12,
          background: '#22d3ee',
          border: 'none',
          color: '#0a0a0a',
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer',
          boxShadow: '0 0 20px #22d3ee44',
        }}
      >
        + أضف عادة
      </button>
    </div>
  )
}
