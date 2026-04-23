import { useState, useMemo } from 'react';
import {
  Plus, Search, Package, Pencil, Trash2, ArrowUpCircle,
  ArrowDownCircle, History, X, Download, ChevronDown
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Modal, { ConfirmModal } from '../components/Modal';
import { calcStockValue, fmtEur } from '../utils/calculations';
import { exportStock } from '../utils/exports';

const CATEGORIES = [
  { id: 'all', label: 'Tous' },
  { id: 'ingredient', label: 'Ingrédients' },
  { id: 'boisson', label: 'Boissons' },
  { id: 'consommable', label: 'Consommables' },
];
const UNITS = ['kg', 'g', 'L', 'mL', 'pièce', 'boîte', 'litre', 'bouteille'];
const REASONS = [
  { value: 'achat', label: 'Achat fournisseur' },
  { value: 'inventaire', label: 'Inventaire / Ajustement' },
  { value: 'retour', label: 'Retour fournisseur' },
  { value: 'perte', label: 'Perte / Casse' },
  { value: 'usage', label: 'Usage cuisine' },
  { value: 'autre', label: 'Autre' },
];

const CAT_COLORS = {
  ingredient: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  boisson: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  consommable: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
};

function StockBar({ current, minimum }) {
  const ratio = minimum > 0 ? current / (minimum * 2) : current > 0 ? 1 : 0;
  const pct = Math.min(100, ratio * 100);
  const color = current === 0 ? 'bg-red-500' : current <= minimum ? 'bg-orange-400' : 'bg-emerald-400';
  return (
    <div className="h-1 bg-neutral-800 rounded-full overflow-hidden mt-2">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function ProductCard({ product, onEdit, onMovement, onDelete, onHistory }) {
  const [open, setOpen] = useState(false);
  const isLow = product.currentStock <= product.minimumStock;
  const isEmpty = product.currentStock === 0;

  return (
    <div className={`card p-4 ${isLow ? 'border-orange-500/25' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-white">{product.name}</p>
            {isEmpty && (
              <span className="badge bg-red-500/15 text-red-400 border border-red-500/25">RUPTURE</span>
            )}
            {isLow && !isEmpty && (
              <span className="badge bg-orange-500/15 text-orange-400 border border-orange-500/25">FAIBLE</span>
            )}
          </div>
          <span className={`badge border mt-1 ${CAT_COLORS[product.category] || 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>
            {product.category}
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="w-8 h-8 flex items-center justify-center text-neutral-500 flex-shrink-0"
        >
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-3">
        <div>
          <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Stock</p>
          <p className={`text-sm font-bold ${isEmpty ? 'text-red-400' : isLow ? 'text-orange-400' : 'text-white'}`}>
            {product.currentStock} <span className="text-[10px] text-neutral-500">{product.unit}</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Minimum</p>
          <p className="text-sm font-semibold text-neutral-300">{product.minimumStock} <span className="text-[10px] text-neutral-500">{product.unit}</span></p>
        </div>
        <div>
          <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Valeur</p>
          <p className="text-sm font-bold text-emerald-400">{fmtEur(product.currentStock * product.purchasePrice)}</p>
        </div>
      </div>

      <StockBar current={product.currentStock} minimum={product.minimumStock} />

      {open && (
        <div className="mt-3 pt-3 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-neutral-500">Prix achat: <span className="text-white font-semibold">{fmtEur(product.purchasePrice)}/{product.unit}</span></p>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => onMovement(product, 'in')}
              className="flex flex-col items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl py-2.5 transition-colors"
            >
              <ArrowUpCircle size={16} className="text-emerald-400" />
              <span className="text-[9px] text-emerald-400 font-semibold">Entrée</span>
            </button>
            <button
              onClick={() => onMovement(product, 'out')}
              className="flex flex-col items-center gap-1 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-xl py-2.5 transition-colors"
            >
              <ArrowDownCircle size={16} className="text-orange-400" />
              <span className="text-[9px] text-orange-400 font-semibold">Sortie</span>
            </button>
            <button
              onClick={() => onEdit(product)}
              className="flex flex-col items-center gap-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl py-2.5 transition-colors"
            >
              <Pencil size={16} className="text-neutral-400" />
              <span className="text-[9px] text-neutral-400 font-semibold">Modifier</span>
            </button>
            <button
              onClick={() => onDelete(product)}
              className="flex flex-col items-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl py-2.5 transition-colors"
            >
              <Trash2 size={16} className="text-red-400" />
              <span className="text-[9px] text-red-400 font-semibold">Suppr.</span>
            </button>
          </div>
          <button
            onClick={() => onHistory(product)}
            className="w-full mt-2 flex items-center justify-center gap-2 text-[11px] text-neutral-400 bg-neutral-800/50 hover:bg-neutral-800 py-2 rounded-lg transition-colors border border-neutral-700/50"
          >
            <History size={12} />
            Voir l'historique des mouvements
          </button>
        </div>
      )}
    </div>
  );
}

const EMPTY_PRODUCT = { name: '', category: 'ingredient', unit: 'kg', purchasePrice: '', currentStock: '', minimumStock: '' };

function ProductForm({ initial = EMPTY_PRODUCT, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    if (!form.purchasePrice || Number(form.purchasePrice) < 0) e.purchasePrice = 'Prix invalide';
    if (form.currentStock === '' || Number(form.currentStock) < 0) e.currentStock = 'Stock invalide';
    if (form.minimumStock === '' || Number(form.minimumStock) < 0) e.minimumStock = 'Minimum invalide';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onSave({
      ...form,
      purchasePrice: Number(form.purchasePrice),
      currentStock: Number(form.currentStock),
      minimumStock: Number(form.minimumStock),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      <div>
        <label className="label">Nom du produit *</label>
        <input className="input-dark" placeholder="ex: Tomates cerises" value={form.name} onChange={e => set('name', e.target.value)} />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Catégorie</label>
          <select className="input-dark" value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="ingredient">Ingrédient</option>
            <option value="boisson">Boisson</option>
            <option value="consommable">Consommable</option>
          </select>
        </div>
        <div>
          <label className="label">Unité</label>
          <select className="input-dark" value={form.unit} onChange={e => set('unit', e.target.value)}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Prix d'achat (€ / unité) *</label>
        <input className="input-dark" type="number" step="0.01" min="0" placeholder="0.00" value={form.purchasePrice} onChange={e => set('purchasePrice', e.target.value)} />
        {errors.purchasePrice && <p className="text-red-400 text-xs mt-1">{errors.purchasePrice}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Stock actuel *</label>
          <input className="input-dark" type="number" step="0.01" min="0" placeholder="0" value={form.currentStock} onChange={e => set('currentStock', e.target.value)} />
          {errors.currentStock && <p className="text-red-400 text-xs mt-1">{errors.currentStock}</p>}
        </div>
        <div>
          <label className="label">Stock minimum *</label>
          <input className="input-dark" type="number" step="0.01" min="0" placeholder="0" value={form.minimumStock} onChange={e => set('minimumStock', e.target.value)} />
          {errors.minimumStock && <p className="text-red-400 text-xs mt-1">{errors.minimumStock}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary py-3">Annuler</button>
        <button type="submit" className="btn-primary py-3">Enregistrer</button>
      </div>
    </form>
  );
}

function MovementForm({ product, defaultType = 'in', onSave, onCancel }) {
  const [type, setType] = useState(defaultType);
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('achat');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!qty || Number(qty) <= 0) { setError('Quantité invalide'); return; }
    onSave({ productId: product.id, productName: product.name, type, quantity: Number(qty), reason, note });
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl px-4 py-3">
        <p className="text-xs text-neutral-500">Produit</p>
        <p className="text-sm font-bold text-white">{product.name}</p>
        <p className="text-xs text-neutral-400 mt-0.5">
          Stock actuel: <span className="font-semibold">{product.currentStock} {product.unit}</span>
        </p>
      </div>

      <div>
        <label className="label">Type de mouvement</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setType('in'); setReason('achat'); }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${
              type === 'in'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400'
            }`}
          >
            <ArrowUpCircle size={16} /> Entrée
          </button>
          <button
            type="button"
            onClick={() => { setType('out'); setReason('perte'); }}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${
              type === 'out'
                ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400'
            }`}
          >
            <ArrowDownCircle size={16} /> Sortie
          </button>
        </div>
      </div>

      <div>
        <label className="label">Quantité ({product.unit}) *</label>
        <input className="input-dark" type="number" step="0.01" min="0.01" placeholder="0" value={qty} onChange={e => setQty(e.target.value)} />
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        {qty && (
          <p className="text-xs text-neutral-500 mt-1">
            Nouveau stock: <span className={`font-bold ${type === 'in' ? 'text-emerald-400' : 'text-orange-400'}`}>
              {type === 'in' ? '+' : '-'}{qty} → {Math.max(0, product.currentStock + (type === 'in' ? Number(qty) : -Number(qty)))} {product.unit}
            </span>
          </p>
        )}
      </div>

      <div>
        <label className="label">Motif</label>
        <select className="input-dark" value={reason} onChange={e => setReason(e.target.value)}>
          {REASONS.filter(r => type === 'in' ? ['achat', 'inventaire', 'retour', 'autre'].includes(r.value) : ['perte', 'usage', 'inventaire', 'autre'].includes(r.value)).map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Note (optionnel)</label>
        <input className="input-dark" placeholder="Précisions..." value={note} onChange={e => setNote(e.target.value)} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary py-3">Annuler</button>
        <button type="submit" className="btn-primary py-3">Enregistrer</button>
      </div>
    </form>
  );
}

function HistoryModal({ product, movements, onClose }) {
  const productMovements = movements.filter(m => m.productId === product.id).slice(0, 30);
  const reasonLabels = { achat: 'Achat', inventaire: 'Inventaire', retour: 'Retour', perte: 'Perte', usage: 'Usage', vente: 'Vente', autre: 'Autre' };

  return (
    <div className="p-5">
      <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl px-4 py-3 mb-4">
        <p className="text-sm font-bold text-white">{product.name}</p>
        <p className="text-xs text-neutral-400">Stock: {product.currentStock} {product.unit}</p>
      </div>
      {productMovements.length === 0 ? (
        <div className="text-center py-10">
          <History size={32} className="text-neutral-700 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">Aucun mouvement enregistré</p>
        </div>
      ) : (
        <div className="space-y-2">
          {productMovements.map(m => (
            <div key={m.id} className="flex items-center gap-3 bg-neutral-800/40 rounded-xl px-4 py-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                m.type === 'in' ? 'bg-emerald-500/15' : 'bg-orange-500/15'
              }`}>
                {m.type === 'in'
                  ? <ArrowUpCircle size={16} className="text-emerald-400" />
                  : <ArrowDownCircle size={16} className="text-orange-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">{reasonLabels[m.reason] || m.reason}</p>
                {m.note && <p className="text-[10px] text-neutral-500 truncate">{m.note}</p>}
                <p className="text-[10px] text-neutral-600">{new Date(m.date).toLocaleString('fr-FR')}</p>
              </div>
              <p className={`text-sm font-bold flex-shrink-0 ${m.type === 'in' ? 'text-emerald-400' : 'text-orange-400'}`}>
                {m.type === 'in' ? '+' : '-'}{m.quantity} {product.unit}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Stock() {
  const { products, movements, saveProduct, deleteProduct, addMovement } = useApp();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [moveType, setMoveType] = useState('in');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => {
    let list = products;
    if (cat !== 'all') list = list.filter(p => p.category === cat);
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    return list.sort((a, b) => {
      if (a.currentStock <= a.minimumStock && b.currentStock > b.minimumStock) return -1;
      if (b.currentStock <= b.minimumStock && a.currentStock > a.minimumStock) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [products, cat, search]);

  const totalValue = useMemo(() => calcStockValue(filtered), [filtered]);
  const lowCount = filtered.filter(p => p.currentStock <= p.minimumStock).length;

  const handleSaveProduct = (data) => {
    saveProduct({ ...selected, ...data });
    setModal(null);
    setSelected(null);
  };

  const handleMovement = (product, type) => {
    setSelected(product);
    setMoveType(type);
    setModal('movement');
  };

  const handleSaveMovement = (data) => {
    addMovement(data);
    setModal(null);
    setSelected(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header controls */}
      <div className="px-4 pt-4 pb-3 space-y-3 bg-neutral-950 sticky top-0 z-10">
        {/* Summary bar */}
        <div className="flex gap-3">
          <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Valeur totale</p>
            <p className="text-sm font-black text-emerald-400">{fmtEur(totalValue)}</p>
          </div>
          <div className={`flex-1 bg-neutral-900 border rounded-xl px-3 py-2 ${lowCount > 0 ? 'border-orange-500/30' : 'border-neutral-800'}`}>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Alertes</p>
            <p className={`text-sm font-black ${lowCount > 0 ? 'text-orange-400' : 'text-neutral-400'}`}>{lowCount} produit{lowCount !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => exportStock(products)}
            className="w-10 h-full bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 active:bg-neutral-800"
          >
            <Download size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            className="input-dark pl-10 pr-10"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                cat === c.id ? 'bg-emerald-500 text-black' : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package size={40} className="text-neutral-700 mb-3" />
            <p className="text-sm font-semibold text-neutral-400">Aucun produit trouvé</p>
            <p className="text-xs text-neutral-600 mt-1">Ajoutez votre premier produit</p>
          </div>
        ) : (
          filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onEdit={(p) => { setSelected(p); setModal('edit'); }}
              onMovement={handleMovement}
              onDelete={setConfirmDelete}
              onHistory={(p) => { setSelected(p); setModal('history'); }}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setSelected(null); setModal('add'); }}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 shadow-2xl shadow-emerald-500/40 flex items-center justify-center transition-all active:scale-95 z-30"
      >
        <Plus size={24} className="text-black" strokeWidth={2.5} />
      </button>

      {/* Modals */}
      <Modal isOpen={modal === 'add'} onClose={() => setModal(null)} title="Nouveau produit" size="lg">
        <ProductForm onSave={handleSaveProduct} onCancel={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal === 'edit'} onClose={() => { setModal(null); setSelected(null); }} title="Modifier le produit" size="lg">
        {selected && (
          <ProductForm initial={selected} onSave={handleSaveProduct} onCancel={() => { setModal(null); setSelected(null); }} />
        )}
      </Modal>

      <Modal isOpen={modal === 'movement'} onClose={() => { setModal(null); setSelected(null); }} title={moveType === 'in' ? '📥 Entrée de stock' : '📤 Sortie de stock'} size="lg">
        {selected && (
          <MovementForm product={selected} defaultType={moveType} onSave={handleSaveMovement} onCancel={() => { setModal(null); setSelected(null); }} />
        )}
      </Modal>

      <Modal isOpen={modal === 'history'} onClose={() => { setModal(null); setSelected(null); }} title="Historique des mouvements" size="lg">
        {selected && <HistoryModal product={selected} movements={movements} onClose={() => setModal(null)} />}
      </Modal>

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { deleteProduct(confirmDelete.id); setConfirmDelete(null); }}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${confirmDelete?.name}" ? Cette action est irréversible.`}
      />
    </div>
  );
}
