import { useState, useMemo } from 'react';
import {
  ShoppingCart, TrendingUp, Calendar, Plus, Minus, Check,
  X, Download, ChevronDown, BarChart2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { fmtEur, fmtPct, calcMarginPercent } from '../utils/calculations';
import { exportSales } from '../utils/exports';

const CAT_EMOJIS = { cocktail: '🍸', plat: '🍽️', dessert: '🍮', soft: '🥤', autre: '⭐' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-[11px] text-neutral-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-emerald-400">{fmtEur(payload[0]?.value)}</p>
    </div>
  );
};

export default function Sales() {
  const { recipes, sales, addSale } = useApp();
  const { user } = useAuth();

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [success, setSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  const today = new Date().toISOString().slice(0, 10);

  const todaySales = useMemo(
    () => sales.filter(s => s.date.startsWith(today)),
    [sales, today]
  );

  const todayRevenue = useMemo(
    () => todaySales.reduce((sum, s) => sum + s.totalRevenue, 0),
    [todaySales]
  );

  const todayQty = useMemo(
    () => todaySales.reduce((sum, s) => sum + s.quantity, 0),
    [todaySales]
  );

  const weekChart = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().slice(0, 10);
      const daySales = sales.filter(s => s.date.startsWith(dateStr));
      const revenue = daySales.reduce((sum, s) => sum + s.totalRevenue, 0);
      const isToday = dateStr === today;
      return {
        day: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
        revenue: Math.round(revenue * 100) / 100,
        isToday,
      };
    });
  }, [sales, today]);

  const weekTotal = weekChart.reduce((s, d) => s + d.revenue, 0);

  const selectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setUnitPrice(String(recipe.sellingPrice));
    setQuantity(1);
  };

  const handleSale = () => {
    if (!selectedRecipe || quantity < 1) return;
    const price = Number(unitPrice) || selectedRecipe.sellingPrice;
    addSale({
      recipeId: selectedRecipe.id,
      recipeName: selectedRecipe.name,
      quantity,
      unitPrice: price,
      totalRevenue: quantity * price,
      date: new Date(saleDate).toISOString(),
      userId: user?.id || 'user',
    });
    setSuccess(true);
    setSelectedRecipe(null);
    setQuantity(1);
    setTimeout(() => setSuccess(false), 2500);
  };

  const recentSales = useMemo(() => sales.slice(0, 30), [sales]);

  const catOptions = [
    { value: 'all', label: 'Toutes' },
    ...Object.entries(CAT_EMOJIS).map(([k, v]) => ({ value: k, label: v + ' ' + k })),
  ];

  const filteredRecipes = useMemo(() => {
    if (filterCat === 'all') return recipes;
    return recipes.filter(r => r.category === filterCat);
  }, [recipes, filterCat]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 pt-4 space-y-4 pb-6">
        {/* Today summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-emerald-400" />
              <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wide">CA Aujourd'hui</p>
            </div>
            <p className="text-2xl font-black text-white">{fmtEur(todayRevenue)}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{todaySales.length} transaction{todaySales.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 flex flex-col items-center justify-center">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">Articles</p>
            <p className="text-2xl font-black text-white">{todayQty}</p>
            <p className="text-[10px] text-neutral-500">vendus</p>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/25 rounded-2xl px-4 py-3 animate-slide-up">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check size={14} className="text-black" />
            </div>
            <p className="text-sm font-semibold text-emerald-400">Vente enregistrée ! Stock mis à jour.</p>
          </div>
        )}

        {/* Sale form */}
        <div className="card p-4 space-y-4">
          <p className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingCart size={16} className="text-emerald-400" />
            Enregistrer une vente
          </p>

          {/* Date */}
          <div>
            <label className="label flex items-center gap-1.5"><Calendar size={11} /> Date</label>
            <input
              className="input-dark"
              type="date"
              value={saleDate}
              onChange={e => setSaleDate(e.target.value)}
              max={today}
            />
          </div>

          {/* Category filter */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {catOptions.map(c => (
              <button
                key={c.value}
                onClick={() => setFilterCat(c.value)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filterCat === c.value ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Recipe selection */}
          <div>
            <label className="label">Sélectionner une recette</label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {filteredRecipes.map(recipe => (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => selectRecipe(recipe)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                    selectedRecipe?.id === recipe.id
                      ? 'bg-emerald-500/15 border-emerald-500/40'
                      : 'bg-neutral-800/50 border-neutral-700 hover:bg-neutral-800'
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{CAT_EMOJIS[recipe.category] || '⭐'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{recipe.name}</p>
                    <p className="text-[10px] text-neutral-400">
                      Marge: {fmtPct(calcMarginPercent(recipe.costPrice, recipe.sellingPrice))}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-emerald-400 flex-shrink-0">{fmtEur(recipe.sellingPrice)}</p>
                  {selectedRecipe?.id === recipe.id && (
                    <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {selectedRecipe && (
            <>
              {/* Quantity */}
              <div>
                <label className="label">Quantité</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-11 h-11 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white active:bg-neutral-700"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    className="input-dark text-center text-xl font-bold flex-1"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 active:bg-emerald-500/30"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 5, 10].map(n => (
                    <button key={n} type="button" onClick={() => setQuantity(n)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${quantity === n ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}>
                      ×{n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="label">Prix de vente unitaire (€)</label>
                <input
                  className="input-dark"
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={e => setUnitPrice(e.target.value)}
                />
              </div>

              {/* Summary */}
              <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-400">{quantity} × {selectedRecipe.name}</p>
                    <p className="text-[11px] text-neutral-500">Prix unitaire: {fmtEur(Number(unitPrice))}</p>
                  </div>
                  <p className="text-xl font-black text-emerald-400">
                    {fmtEur(quantity * (Number(unitPrice) || 0))}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSale}
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Valider la vente
              </button>
            </>
          )}
        </div>

        {/* Week chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title flex items-center gap-2"><BarChart2 size={11} /> CA 7 jours</p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-400">{fmtEur(weekTotal)}</span>
              <button onClick={() => exportSales(sales)} className="text-neutral-500 hover:text-neutral-300 transition-colors">
                <Download size={14} />
              </button>
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={weekChart} barSize={26} margin={{ top: 5, right: 5, left: -22, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 9, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar
                  dataKey="revenue"
                  radius={[5, 5, 0, 0]}
                  fill="#10b981"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales history */}
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between section-title mb-0 pb-3"
          >
            <span className="flex items-center gap-2">Historique des ventes ({sales.length})</span>
            <ChevronDown size={14} className={`text-neutral-500 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
          </button>

          {showHistory && (
            <div className="space-y-2 mt-3">
              {recentSales.length === 0 ? (
                <p className="text-center text-xs text-neutral-500 py-4">Aucune vente enregistrée</p>
              ) : (
                recentSales.map(s => (
                  <div key={s.id} className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5">
                    <span className="text-base">{CAT_EMOJIS['autre']}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{s.recipeName}</p>
                      <p className="text-[10px] text-neutral-500">
                        {s.quantity} × {fmtEur(s.unitPrice)} • {new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-emerald-400 flex-shrink-0">{fmtEur(s.totalRevenue)}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
