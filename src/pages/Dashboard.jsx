import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  TrendingUp, Package, AlertTriangle, ChefHat,
  Euro, Award, ArrowUp
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { calcStockValue, fmtEur, fmtPct, calcMarginPercent } from '../utils/calculations';

function StatCard({ icon: Icon, label, value, sub, color = 'emerald', trend }) {
  const colors = {
    emerald: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    orange: 'from-orange-500/15 to-orange-500/5 border-orange-500/20 text-orange-400',
    red: 'from-red-500/15 to-red-500/5 border-red-500/20 text-red-400',
    blue: 'from-blue-500/15 to-blue-500/5 border-blue-500/20 text-blue-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
          <Icon size={18} className={`text-${color}-400`} />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-emerald-400">
            <ArrowUp size={12} />
            <span className="text-[10px] font-bold">{trend}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-black text-white leading-none mb-0.5">{value}</p>
      <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-[10px] text-neutral-500 mt-0.5">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[11px] text-neutral-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-emerald-400">{fmtEur(payload[0].value)}</p>
    </div>
  );
};

export default function Dashboard() {
  const { products, recipes, sales, lowStock } = useApp();
  const { user } = useAuth();

  const today = new Date().toISOString().slice(0, 10);

  const todaySales = useMemo(
    () => sales.filter(s => s.date.startsWith(today)),
    [sales, today]
  );

  const todayRevenue = useMemo(
    () => todaySales.reduce((sum, s) => sum + s.totalRevenue, 0),
    [todaySales]
  );

  const stockValue = useMemo(() => calcStockValue(products), [products]);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const daySales = sales.filter(s => s.date.startsWith(dateStr));
      const revenue = daySales.reduce((sum, s) => sum + s.totalRevenue, 0);
      return {
        day: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
        revenue: Math.round(revenue * 100) / 100,
      };
    });
  }, [sales]);

  const topRecipes = useMemo(() => {
    return [...recipes]
      .map(r => ({ ...r, marginPct: calcMarginPercent(r.costPrice, r.sellingPrice) }))
      .sort((a, b) => b.marginPct - a.marginPct)
      .slice(0, 4);
  }, [recipes]);

  const weekRevenue = useMemo(
    () => chartData.reduce((s, d) => s + d.revenue, 0),
    [chartData]
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const catIcons = { cocktail: '🍸', plat: '🍽️', dessert: '🍮', soft: '🥤', autre: '⭐' };

  return (
    <div className="px-4 py-5 space-y-6 pb-6">
      {/* Greeting */}
      <div>
        <p className="text-sm text-neutral-500">{greeting()}, <span className="text-white font-semibold">{user?.name?.split(' ')[0]}</span> 👋</p>
        <p className="text-[11px] text-neutral-600 mt-0.5">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Euro}
          label="Valeur stock"
          value={fmtEur(stockValue)}
          color="emerald"
          sub={`${products.length} produits`}
        />
        <StatCard
          icon={AlertTriangle}
          label="Ruptures"
          value={lowStock.length}
          color={lowStock.length > 0 ? 'red' : 'emerald'}
          sub={lowStock.length > 0 ? 'alertes actives' : 'Stock OK'}
        />
        <StatCard
          icon={TrendingUp}
          label="CA aujourd'hui"
          value={fmtEur(todayRevenue)}
          color="blue"
          sub={`${todaySales.length} ventes`}
        />
        <StatCard
          icon={ChefHat}
          label="Recettes"
          value={recipes.length}
          color="orange"
          sub="fiches techniques"
        />
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div>
          <p className="section-title flex items-center gap-2">
            <AlertTriangle size={11} className="text-orange-400" />
            Alertes stock faible
          </p>
          <div className="space-y-2">
            {lowStock.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center justify-between bg-orange-500/8 border border-orange-500/20 rounded-xl px-4 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-white">{p.name}</p>
                  <p className="text-[11px] text-neutral-500">Min. {p.minimumStock} {p.unit}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${p.currentStock === 0 ? 'text-red-400' : 'text-orange-400'}`}>
                    {p.currentStock} {p.unit}
                  </p>
                  {p.currentStock === 0 && (
                    <span className="text-[10px] text-red-400 font-semibold">RUPTURE</span>
                  )}
                </div>
              </div>
            ))}
            {lowStock.length > 4 && (
              <p className="text-center text-xs text-neutral-500">+{lowStock.length - 4} autres produits en alerte</p>
            )}
          </div>
        </div>
      )}

      {/* Sales chart */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">CA 7 derniers jours</p>
          <span className="text-[11px] font-bold text-emerald-400">{fmtEur(weekRevenue)}</span>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} barSize={28} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#4b5563', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}€`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top recipes */}
      {topRecipes.length > 0 && (
        <div>
          <p className="section-title flex items-center gap-2">
            <Award size={11} className="text-yellow-400" />
            Top recettes (marge)
          </p>
          <div className="space-y-2">
            {topRecipes.map((r, i) => (
              <div key={r.id} className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3">
                <span className="text-base">{['🥇','🥈','🥉','🏅'][i]}</span>
                <span className="text-lg">{catIcons[r.category] || '⭐'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{r.name}</p>
                  <p className="text-[11px] text-neutral-500">Food cost: {fmtPct(r.foodCostPercent)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">{fmtPct(r.marginPct)}</p>
                  <p className="text-[11px] text-neutral-500">marge</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
        <p className="section-title">Répartition stock</p>
        {['ingredient', 'boisson', 'consommable'].map(cat => {
          const catProds = products.filter(p => p.category === cat);
          const catValue = catProds.reduce((s, p) => s + p.currentStock * p.purchasePrice, 0);
          const pct = stockValue > 0 ? (catValue / stockValue) * 100 : 0;
          const labels = { ingredient: 'Ingrédients', boisson: 'Boissons', consommable: 'Consommables' };
          const colors = { ingredient: 'bg-emerald-500', boisson: 'bg-blue-500', consommable: 'bg-purple-500' };
          return (
            <div key={cat} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-neutral-400">{labels[cat]}</span>
                <span className="text-xs font-bold text-white">{fmtEur(catValue)}</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors[cat]} rounded-full transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
