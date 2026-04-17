import { LayoutDashboard, UtensilsCrossed, BookOpen, ClipboardList } from 'lucide-react'

const tabs = [
  { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
  { id: 'tables', label: 'Tables', icon: UtensilsCrossed },
  { id: 'commandes', label: 'Commandes', icon: ClipboardList },
  { id: 'menu', label: 'Menu', icon: BookOpen },
]

export default function BottomNav({ current, onChange }) {
  return (
    <nav className="flex border-t border-[#2a2a2a] bg-[#111] pb-safe">
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = current === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
              active ? 'text-[#d4a574]' : 'text-[#666]'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
