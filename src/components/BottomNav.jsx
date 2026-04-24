import { LayoutDashboard, Package, BookOpen, Truck, ShoppingCart } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const TABS = [
  { id: 'dashboard', label: 'Accueil', Icon: LayoutDashboard },
  { id: 'stock', label: 'Stock', Icon: Package },
  { id: 'recipes', label: 'Recettes', Icon: BookOpen },
  { id: 'suppliers', label: 'Fournisseurs', Icon: Truck },
  { id: 'sales', label: 'Ventes', Icon: ShoppingCart },
];

export default function BottomNav({ page, setPage }) {
  const { lowStock } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800/80">
      <div className="flex items-center justify-around px-1 py-1 pb-safe">
        {TABS.map(({ id, label, Icon }) => {
          const active = page === id;
          const alert = id === 'stock' && lowStock.length > 0;
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-2xl transition-all flex-1 ${
                active ? 'text-emerald-400' : 'text-neutral-500'
              }`}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.5}
                  className={`transition-all ${active ? 'scale-110' : 'scale-100'}`}
                />
                {alert && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-neutral-950" />
                )}
              </div>
              <span className={`text-[9px] font-semibold transition-all ${active ? 'opacity-100' : 'opacity-60'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
