import { Bell, ChefHat, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

const PAGE_LABELS = {
  dashboard: 'Tableau de bord',
  stock: 'Gestion du Stock',
  recipes: 'Fiches Techniques',
  suppliers: 'Fournisseurs',
  sales: 'Ventes',
};

export default function Header({ page }) {
  const { lowStock } = useApp();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <ChefHat size={17} className="text-black" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[11px] text-emerald-400 font-bold leading-none tracking-wide uppercase">GastroSmart</p>
            <p className="text-[13px] font-bold text-white leading-tight">{PAGE_LABELS[page]}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lowStock.length > 0 && (
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800">
              <Bell size={17} className="text-orange-400" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-red-500 text-[9px] flex items-center justify-center font-bold px-1">
                {lowStock.length}
              </span>
            </div>
          )}

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="relative w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-[13px] font-black text-white"
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </button>
        </div>
      </div>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-3 top-14 z-50 bg-neutral-800 border border-neutral-700 rounded-2xl overflow-hidden shadow-2xl min-w-[200px]">
            <div className="px-4 py-3 border-b border-neutral-700">
              <p className="text-sm font-bold text-white">{user?.name}</p>
              <p className="text-xs text-neutral-400">{user?.email}</p>
              <span className="mt-1 inline-block badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                {user?.role === 'admin' ? 'Administrateur' : 'Employé'}
              </span>
            </div>
            <button
              onClick={() => { logout(); setShowMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-neutral-700 transition-colors"
            >
              <LogOut size={15} />
              <span>Se déconnecter</span>
            </button>
          </div>
        </>
      )}
    </header>
  );
}
