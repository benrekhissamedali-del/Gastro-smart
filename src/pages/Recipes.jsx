import { useState, useMemo } from 'react';
import {
  Plus, Search, BookOpen, Pencil, Trash2, Copy, X,
  ChefHat, Euro, TrendingUp, Star, Info
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Modal, { ConfirmModal } from '../components/Modal';
import {
  calcRecipeCost, calcFoodCost, calcMarginPercent,
  calcCoefficient, suggestPrice, fmtEur, fmtPct, fmt
} from '../utils/calculations';
import { exportRecipes } from '../utils/exports';

const CAT_OPTIONS = [
  { value: 'cocktail', label: 'Cocktail', emoji: '🍸' },
  { value: 'plat', label: 'Plat', emoji: '🍽️' },
  { value: 'dessert', label: 'Dessert', emoji: '🍮' },
  { value: 'soft', label: 'Soft', emoji: '🥤' },
  { value: 'autre', label: 'Autre', emoji: '⭐' },
];

const CAT_COLORS = {
  cocktail: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  plat: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  dessert: 'bg-pink-500/15 text-pink-400 border-pink-500/25',
  soft: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  autre: 'bg-neutral-500/15 text-neutral-400 border-neutral-500/25',
};

function FoodCostBadge({ pct }) {
  const color = pct <= 25 ? 'text-emerald-400' : pct <= 35 ? 'text-yellow-400' : 'text-red-400';
  return <span className={`font-bold ${color}`}>{fmtPct(pct)}</span>;
}

function RecipeCard({ recipe, onView, onEdit, onDuplicate, onDelete }) {
  const catInfo = CAT_OPTIONS.find(c => c.value === recipe.category) || CAT_OPTIONS[4];
  const coefficient = calcCoefficient(recipe.costPrice, recipe.sellingPrice);

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{catInfo.emoji}</span>
            <p className="text-sm font-bold text-white truncate">{recipe.name}</p>
          </div>
          <span className={`badge border ${CAT_COLORS[recipe.category]}`}>{catInfo.label}</span>
          {recipe.description && (
            <p className="text-xs text-neutral-500 mt-1.5 line-clamp-1">{recipe.description}</p>
          )}
        </div>
      </div>

      {/* Cost metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-neutral-800/50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Coût revient</p>
          <p className="text-sm font-bold text-white">{fmtEur(recipe.costPrice)}</p>
        </div>
        <div className="bg-neutral-800/50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Prix vente</p>
          <p className="text-sm font-bold text-emerald-400">{fmtEur(recipe.sellingPrice)}</p>
        </div>
        <div className="bg-neutral-800/50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Food Cost</p>
          <FoodCostBadge pct={recipe.foodCostPercent || 0} />
        </div>
        <div className="bg-neutral-800/50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Marge</p>
          <p className="text-sm font-bold text-white">{fmtPct(calcMarginPercent(recipe.costPrice, recipe.sellingPrice))}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-neutral-500">
          Coefficient: <span className="text-white font-bold">×{fmt(coefficient, 1)}</span>
        </span>
        <span className="text-[11px] text-neutral-500">
          {recipe.ingredients?.length || 0} ingrédient{recipe.ingredients?.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <button onClick={() => onView(recipe)} className="col-span-4 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-xl py-2.5 text-xs font-semibold text-emerald-400 transition-colors">
          <Info size={13} /> Voir la fiche complète
        </button>
        <button onClick={() => onEdit(recipe)} className="flex flex-col items-center gap-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl py-2 transition-colors">
          <Pencil size={14} className="text-neutral-400" />
          <span className="text-[9px] text-neutral-400 font-semibold">Modifier</span>
        </button>
        <button onClick={() => onDuplicate(recipe)} className="flex flex-col items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl py-2 transition-colors">
          <Copy size={14} className="text-blue-400" />
          <span className="text-[9px] text-blue-400 font-semibold">Dupliquer</span>
        </button>
        <button onClick={() => onDelete(recipe)} className="col-span-2 flex flex-col items-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl py-2 transition-colors">
          <Trash2 size={14} className="text-red-400" />
          <span className="text-[9px] text-red-400 font-semibold">Supprimer</span>
        </button>
      </div>
    </div>
  );
}

function RecipeDetail({ recipe, products }) {
  const catInfo = CAT_OPTIONS.find(c => c.value === recipe.category) || CAT_OPTIONS[4];
  const coefficient = calcCoefficient(recipe.costPrice, recipe.sellingPrice);
  const suggested30 = suggestPrice(recipe.costPrice, 30);
  const suggested35 = suggestPrice(recipe.costPrice, 35);

  return (
    <div className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{catInfo.emoji}</span>
        <div>
          <h3 className="text-lg font-black text-white">{recipe.name}</h3>
          <span className={`badge border ${CAT_COLORS[recipe.category]}`}>{catInfo.label}</span>
        </div>
      </div>

      {recipe.description && (
        <p className="text-sm text-neutral-400 italic">{recipe.description}</p>
      )}

      {/* Financial summary */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: 'Coût revient', value: fmtEur(recipe.costPrice), color: 'text-white' },
          { label: 'Prix de vente', value: fmtEur(recipe.sellingPrice), color: 'text-emerald-400' },
          { label: 'Marge brute', value: fmtEur(recipe.margin), color: 'text-emerald-400' },
          { label: 'Marge %', value: fmtPct(calcMarginPercent(recipe.costPrice, recipe.sellingPrice)), color: 'text-emerald-400' },
          { label: 'Food Cost', value: fmtPct(recipe.foodCostPercent), color: recipe.foodCostPercent <= 30 ? 'text-emerald-400' : recipe.foodCostPercent <= 35 ? 'text-yellow-400' : 'text-red-400' },
          { label: 'Coefficient', value: `×${fmt(coefficient, 2)}`, color: 'text-blue-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-neutral-800/60 border border-neutral-700/50 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-0.5">{label}</p>
            <p className={`text-sm font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Price suggestions */}
      <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-4">
        <p className="text-xs font-bold text-blue-400 mb-2">💡 Prix suggérés</p>
        <div className="flex gap-4">
          <div>
            <p className="text-[10px] text-neutral-500">Food cost 30%</p>
            <p className="text-sm font-bold text-white">{fmtEur(suggested30)}</p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500">Food cost 35%</p>
            <p className="text-sm font-bold text-white">{fmtEur(suggested35)}</p>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <p className="section-title">Ingrédients ({recipe.ingredients?.length})</p>
        <div className="space-y-2">
          {recipe.ingredients?.map((ing, i) => {
            const cost = ing.quantity * ing.unitCost;
            const pct = recipe.costPrice > 0 ? (cost / recipe.costPrice) * 100 : 0;
            return (
              <div key={i} className="flex items-center gap-3 bg-neutral-800/40 rounded-xl px-4 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{ing.productName}</p>
                  <p className="text-[10px] text-neutral-500">{ing.quantity} {ing.unit} × {fmtEur(ing.unitCost)}/{ing.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{fmtEur(cost)}</p>
                  <p className="text-[10px] text-neutral-500">{fmt(pct, 0)}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      {recipe.instructions && (
        <div>
          <p className="section-title">Instructions</p>
          <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-xl p-4">
            <p className="text-sm text-neutral-300 whitespace-pre-line leading-relaxed">{recipe.instructions}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function IngredientPicker({ products, ingredients, onChange }) {
  const [search, setSearch] = useState('');

  const available = useMemo(() => {
    const added = new Set(ingredients.map(i => i.productId));
    let list = products.filter(p => !added.has(p.id));
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [products, ingredients, search]);

  const updateQty = (idx, qty) => {
    const updated = [...ingredients];
    updated[idx] = { ...updated[idx], quantity: qty };
    onChange(updated);
  };

  const remove = (idx) => {
    onChange(ingredients.filter((_, i) => i !== idx));
  };

  const add = (product) => {
    onChange([...ingredients, {
      productId: product.id,
      productName: product.name,
      quantity: '',
      unit: product.unit,
      unitCost: product.purchasePrice,
    }]);
    setSearch('');
  };

  return (
    <div className="space-y-3">
      {/* Added ingredients */}
      {ingredients.length > 0 && (
        <div className="space-y-2">
          {ingredients.map((ing, i) => {
            const cost = (ing.quantity || 0) * ing.unitCost;
            return (
              <div key={i} className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-white truncate flex-1">{ing.productName}</p>
                  <button onClick={() => remove(i)} className="text-red-400 ml-2"><X size={14} /></button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    className="input-dark py-2 text-sm flex-1"
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Quantité"
                    value={ing.quantity}
                    onChange={e => updateQty(i, e.target.value)}
                  />
                  <span className="text-xs text-neutral-500 font-semibold w-8 text-center">{ing.unit}</span>
                  <span className="text-xs text-emerald-400 font-bold w-16 text-right">{fmtEur(cost)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search to add */}
      <div>
        <label className="label">Ajouter un ingrédient</label>
        <div className="relative mb-2">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            className="input-dark pl-9"
            placeholder="Chercher dans le stock..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {(search || !ingredients.length) && available.length > 0 && (
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
            {available.slice(0, 8).map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => add(p)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-700 transition-colors text-left border-b border-neutral-700/50 last:border-0"
              >
                <div>
                  <p className="text-xs font-semibold text-white">{p.name}</p>
                  <p className="text-[10px] text-neutral-500">{fmtEur(p.purchasePrice)}/{p.unit}</p>
                </div>
                <Plus size={14} className="text-emerald-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
        {search && available.length === 0 && (
          <p className="text-xs text-neutral-500 text-center py-3">Aucun produit trouvé</p>
        )}
      </div>
    </div>
  );
}

const EMPTY_RECIPE = {
  name: '', category: 'cocktail', description: '', instructions: '',
  servings: 1, sellingPrice: '', ingredients: [],
};

function RecipeForm({ initial = EMPTY_RECIPE, products, onSave, onCancel }) {
  const [form, setForm] = useState({
    ...initial,
    ingredients: initial.ingredients?.map(i => ({ ...i, quantity: String(i.quantity) })) || [],
  });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const cost = useMemo(() => calcRecipeCost(
    form.ingredients.map(i => ({ ...i, quantity: Number(i.quantity) || 0 }))
  ), [form.ingredients]);

  const foodCost = calcFoodCost(cost, Number(form.sellingPrice));
  const margin = calcMarginPercent(cost, Number(form.sellingPrice));
  const suggested = suggestPrice(cost, 30);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.sellingPrice || Number(form.sellingPrice) <= 0) e.sellingPrice = 'Prix de vente requis';
    if (!form.ingredients.length) e.ingredients = 'Au moins 1 ingrédient requis';
    const badQty = form.ingredients.some(i => !i.quantity || Number(i.quantity) <= 0);
    if (badQty) e.ingredients = 'Vérifiez les quantités';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      ...form,
      sellingPrice: Number(form.sellingPrice),
      servings: Number(form.servings) || 1,
      ingredients: form.ingredients.map(i => ({ ...i, quantity: Number(i.quantity) })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      <div>
        <label className="label">Nom de la recette *</label>
        <input className="input-dark" placeholder="ex: Mojito Classic" value={form.name} onChange={e => set('name', e.target.value)} />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Catégorie</label>
          <select className="input-dark" value={form.category} onChange={e => set('category', e.target.value)}>
            {CAT_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Portions</label>
          <input className="input-dark" type="number" min="1" value={form.servings} onChange={e => set('servings', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Description (optionnel)</label>
        <input className="input-dark" placeholder="Brève description..." value={form.description} onChange={e => set('description', e.target.value)} />
      </div>

      {/* Ingredients */}
      <div>
        <label className="label">Ingrédients *</label>
        <IngredientPicker
          products={products}
          ingredients={form.ingredients}
          onChange={ings => set('ingredients', ings)}
        />
        {errors.ingredients && <p className="text-red-400 text-xs mt-1">{errors.ingredients}</p>}
      </div>

      {/* Pricing */}
      <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">Coût de revient</span>
          <span className="text-sm font-bold text-white">{fmtEur(cost)}</span>
        </div>
        <div>
          <label className="label">Prix de vente (€) *</label>
          <input
            className="input-dark"
            type="number"
            step="0.01"
            min="0"
            placeholder={`Suggéré: ${fmt(suggested, 2)} €`}
            value={form.sellingPrice}
            onChange={e => set('sellingPrice', e.target.value)}
          />
          {errors.sellingPrice && <p className="text-red-400 text-xs mt-1">{errors.sellingPrice}</p>}
          {form.sellingPrice > 0 && (
            <div className="flex gap-4 mt-2">
              <span className="text-[11px] text-neutral-500">
                Food cost: <FoodCostBadge pct={foodCost} />
              </span>
              <span className="text-[11px] text-neutral-500">
                Marge: <span className="text-emerald-400 font-bold">{fmtPct(margin)}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="label">Instructions (optionnel)</label>
        <textarea
          className="input-dark min-h-[100px] resize-none leading-relaxed"
          placeholder="Étapes de préparation..."
          value={form.instructions}
          onChange={e => set('instructions', e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary py-3">Annuler</button>
        <button type="submit" className="btn-primary py-3">Enregistrer</button>
      </div>
    </form>
  );
}

export default function Recipes() {
  const { products, recipes, saveRecipe, deleteRecipe } = useApp();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const FILTER_CATS = [{ value: 'all', label: 'Toutes', emoji: '📋' }, ...CAT_OPTIONS];

  const filtered = useMemo(() => {
    let list = recipes;
    if (cat !== 'all') list = list.filter(r => r.category === cat);
    if (search) list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [recipes, cat, search]);

  const handleSave = (data) => {
    saveRecipe({ ...(selected || {}), ...data });
    setModal(null);
    setSelected(null);
  };

  const handleDuplicate = (recipe) => {
    const { id, createdAt, updatedAt, ...rest } = recipe;
    setSelected({ ...rest, name: `${rest.name} (copie)`, ingredients: [...rest.ingredients] });
    setModal('add');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="px-4 pt-4 pb-3 bg-neutral-950 sticky top-0 z-10 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input className="input-dark pl-10 pr-10" placeholder="Rechercher une recette..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500"><X size={14} /></button>}
          </div>
          <button onClick={() => exportRecipes(recipes)} className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 flex-shrink-0">
            <Star size={16} />
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {FILTER_CATS.map(c => (
            <button
              key={c.value}
              onClick={() => setCat(c.value)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                cat === c.value ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
              }`}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen size={40} className="text-neutral-700 mb-3" />
            <p className="text-sm font-semibold text-neutral-400">Aucune recette</p>
            <p className="text-xs text-neutral-600 mt-1">Créez votre première fiche technique</p>
          </div>
        ) : (
          filtered.map(r => (
            <RecipeCard
              key={r.id}
              recipe={r}
              onView={r => { setSelected(r); setModal('view'); }}
              onEdit={r => { setSelected(r); setModal('edit'); }}
              onDuplicate={handleDuplicate}
              onDelete={setConfirmDelete}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setSelected(null); setModal('add'); }}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-2xl bg-emerald-500 shadow-2xl shadow-emerald-500/40 flex items-center justify-center transition-all active:scale-95 z-30"
      >
        <Plus size={24} className="text-black" strokeWidth={2.5} />
      </button>

      {/* Modals */}
      <Modal isOpen={modal === 'view'} onClose={() => { setModal(null); setSelected(null); }} title="Fiche Technique" size="full">
        {selected && <RecipeDetail recipe={selected} products={products} />}
      </Modal>

      <Modal isOpen={modal === 'add'} onClose={() => { setModal(null); setSelected(null); }} title="Nouvelle recette" size="full">
        <RecipeForm
          initial={selected || EMPTY_RECIPE}
          products={products}
          onSave={handleSave}
          onCancel={() => { setModal(null); setSelected(null); }}
        />
      </Modal>

      <Modal isOpen={modal === 'edit'} onClose={() => { setModal(null); setSelected(null); }} title="Modifier la recette" size="full">
        {selected && (
          <RecipeForm
            initial={selected}
            products={products}
            onSave={handleSave}
            onCancel={() => { setModal(null); setSelected(null); }}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { deleteRecipe(confirmDelete.id); setConfirmDelete(null); }}
        title="Supprimer la recette"
        message={`Supprimer "${confirmDelete?.name}" ? Cette action est irréversible.`}
      />
    </div>
  );
}
