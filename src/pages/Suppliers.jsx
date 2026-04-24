import { useState, useMemo } from 'react';
import {
  Plus, Search, Truck, Phone, Mail, MapPin, Package,
  Pencil, Trash2, X, ChevronDown, Printer, FileText
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Modal, { ConfirmModal } from '../components/Modal';
import { fmtEur } from '../utils/calculations';
import { printOrderPDF } from '../utils/exports';

const EMPTY_SUPPLIER = { name: '', phone: '', email: '', address: '', productIds: [], note: '' };

function SupplierCard({ supplier, products, onEdit, onDelete, onOrder }) {
  const [open, setOpen] = useState(false);
  const assocProducts = products.filter(p => supplier.productIds?.includes(p.id));

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Truck size={16} className="text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{supplier.name}</p>
              <span className="badge bg-neutral-800 text-neutral-400 border border-neutral-700">
                {assocProducts.length} produit{assocProducts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <button onClick={() => setOpen(!open)} className="w-8 h-8 flex items-center justify-center text-neutral-500 flex-shrink-0">
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5 mb-3">
        {supplier.phone && (
          <a href={`tel:${supplier.phone}`} className="flex items-center gap-2.5 text-xs text-neutral-400 hover:text-emerald-400 transition-colors">
            <Phone size={12} className="text-neutral-600 flex-shrink-0" />
            <span>{supplier.phone}</span>
          </a>
        )}
        {supplier.email && (
          <a href={`mailto:${supplier.email}`} className="flex items-center gap-2.5 text-xs text-neutral-400 hover:text-emerald-400 transition-colors">
            <Mail size={12} className="text-neutral-600 flex-shrink-0" />
            <span className="truncate">{supplier.email}</span>
          </a>
        )}
        {supplier.address && (
          <div className="flex items-start gap-2.5 text-xs text-neutral-500">
            <MapPin size={12} className="text-neutral-600 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{supplier.address}</span>
          </div>
        )}
      </div>

      {supplier.note && (
        <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-lg px-3 py-2 mb-3">
          <p className="text-[11px] text-yellow-400/80 italic">{supplier.note}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5">
        <button onClick={() => onOrder(supplier)} className="flex flex-col items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl py-2.5 transition-colors">
          <Printer size={14} className="text-emerald-400" />
          <span className="text-[9px] text-emerald-400 font-semibold">Commande</span>
        </button>
        <button onClick={() => onEdit(supplier)} className="flex flex-col items-center gap-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl py-2.5 transition-colors">
          <Pencil size={14} className="text-neutral-400" />
          <span className="text-[9px] text-neutral-400 font-semibold">Modifier</span>
        </button>
        <button onClick={() => onDelete(supplier)} className="flex flex-col items-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl py-2.5 transition-colors">
          <Trash2 size={14} className="text-red-400" />
          <span className="text-[9px] text-red-400 font-semibold">Suppr.</span>
        </button>
      </div>

      {open && assocProducts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-800">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-2">Produits associés</p>
          <div className="space-y-1.5">
            {assocProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-neutral-800/40 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Package size={12} className="text-neutral-500" />
                  <span className="text-xs text-neutral-300">{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${p.currentStock <= p.minimumStock ? 'text-orange-400' : 'text-neutral-400'}`}>
                    {p.currentStock} {p.unit}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">{fmtEur(p.purchasePrice)}/{p.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SupplierForm({ initial = EMPTY_SUPPLIER, products, onSave, onCancel }) {
  const [form, setForm] = useState({ ...initial, productIds: initial.productIds || [] });
  const [prodSearch, setProdSearch] = useState('');
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleProduct = (id) => {
    const ids = form.productIds.includes(id)
      ? form.productIds.filter(i => i !== id)
      : [...form.productIds, id];
    set('productIds', ids);
  };

  const filteredProds = useMemo(() => {
    if (!prodSearch) return products;
    return products.filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase()));
  }, [products, prodSearch]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nom requis';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4">
      <div>
        <label className="label">Nom du fournisseur *</label>
        <input className="input-dark" placeholder="ex: Metro Cash & Carry" value={form.name} onChange={e => set('name', e.target.value)} />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Téléphone</label>
          <input className="input-dark" type="tel" placeholder="+33 1 23 45 67 89" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input-dark" type="email" placeholder="contact@..." value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Adresse</label>
        <input className="input-dark" placeholder="Adresse complète..." value={form.address} onChange={e => set('address', e.target.value)} />
      </div>

      <div>
        <label className="label">Note interne</label>
        <input className="input-dark" placeholder="Conditions, délais, minimum commande..." value={form.note} onChange={e => set('note', e.target.value)} />
      </div>

      <div>
        <label className="label">Produits associés ({form.productIds.length} sélectionnés)</label>
        <div className="relative mb-2">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input className="input-dark pl-9" placeholder="Filtrer les produits..." value={prodSearch} onChange={e => setProdSearch(e.target.value)} />
        </div>
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
          {filteredProds.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => toggleProduct(p.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors border-b border-neutral-700/40 last:border-0 ${
                form.productIds.includes(p.id) ? 'bg-emerald-500/10' : 'hover:bg-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                  form.productIds.includes(p.id)
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-neutral-600'
                }`}>
                  {form.productIds.includes(p.id) && (
                    <svg viewBox="0 0 12 12" className="w-2.5 h-2.5"><path d="M2 6l3 3 5-5" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </div>
                <span className="text-xs text-white">{p.name}</span>
              </div>
              <span className="text-[10px] text-neutral-500">{fmtEur(p.purchasePrice)}/{p.unit}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary py-3">Annuler</button>
        <button type="submit" className="btn-primary py-3">Enregistrer</button>
      </div>
    </form>
  );
}

function OrderModal({ supplier, products, onClose }) {
  const assocProducts = products.filter(p => supplier.productIds?.includes(p.id));
  const [items, setItems] = useState(
    assocProducts.map(p => ({ ...p, orderQty: '', unitPrice: p.purchasePrice }))
  );

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const selectedItems = items.filter(i => i.orderQty && Number(i.orderQty) > 0);
  const total = selectedItems.reduce((sum, i) => sum + Number(i.orderQty) * i.unitPrice, 0);

  const handlePrint = () => {
    if (!selectedItems.length) return;
    printOrderPDF(supplier, selectedItems.map(i => ({
      name: i.name, unit: i.unit,
      quantity: Number(i.orderQty), unitPrice: i.unitPrice,
    })));
  };

  return (
    <div className="p-5 space-y-4">
      <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Truck size={18} className="text-blue-400" />
          <div>
            <p className="text-sm font-bold text-white">{supplier.name}</p>
            {supplier.phone && <p className="text-xs text-neutral-400">{supplier.phone}</p>}
          </div>
        </div>
        {supplier.note && <p className="text-xs text-yellow-400/80 mt-2 italic">{supplier.note}</p>}
      </div>

      {assocProducts.length === 0 ? (
        <div className="text-center py-8">
          <Package size={32} className="text-neutral-700 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">Aucun produit associé à ce fournisseur</p>
          <p className="text-xs text-neutral-600 mt-1">Modifiez le fournisseur pour associer des produits</p>
        </div>
      ) : (
        <>
          <div>
            <p className="section-title">Produits à commander</p>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className={`border rounded-xl px-4 py-3 transition-colors ${
                  item.orderQty && Number(item.orderQty) > 0
                    ? 'bg-emerald-500/8 border-emerald-500/20'
                    : 'bg-neutral-800/40 border-neutral-700'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-white">{item.name}</p>
                    <span className={`text-[10px] font-semibold ${item.currentStock <= item.minimumStock ? 'text-orange-400' : 'text-neutral-500'}`}>
                      Stock: {item.currentStock} {item.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      className="input-dark py-1.5 flex-1 text-sm"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Quantité"
                      value={item.orderQty}
                      onChange={e => updateItem(item.id, 'orderQty', e.target.value)}
                    />
                    <span className="text-xs text-neutral-500 w-8 text-center">{item.unit}</span>
                    <input
                      className="input-dark py-1.5 w-20 text-sm"
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                    />
                    <span className="text-xs text-neutral-500">€</span>
                  </div>
                  {item.orderQty && Number(item.orderQty) > 0 && (
                    <p className="text-[10px] text-emerald-400 mt-1">
                      Sous-total: {fmtEur(Number(item.orderQty) * item.unitPrice)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-400">Total commande ({selectedItems.length} articles)</span>
              <span className="text-lg font-black text-emerald-400">{fmtEur(total)}</span>
            </div>
          </div>

          <button
            onClick={handlePrint}
            disabled={selectedItems.length === 0}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-colors ${
              selectedItems.length > 0
                ? 'bg-emerald-500 text-black active:bg-emerald-400'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <Printer size={16} />
            Imprimer le bon de commande
          </button>
        </>
      )}
    </div>
  );
}

export default function Suppliers() {
  const { products, suppliers, saveSupplier, deleteSupplier } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => {
    if (!search) return suppliers;
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [suppliers, search]);

  const handleSave = (data) => {
    saveSupplier({ ...(selected || {}), ...data });
    setModal(null);
    setSelected(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-3 bg-neutral-950 sticky top-0 z-10 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input className="input-dark pl-10 pr-10" placeholder="Rechercher un fournisseur..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500"><X size={14} /></button>}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Fournisseurs</p>
            <p className="text-sm font-black text-white">{suppliers.length}</p>
          </div>
          <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wide">Produits référencés</p>
            <p className="text-sm font-black text-white">
              {new Set(suppliers.flatMap(s => s.productIds || [])).size}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Truck size={40} className="text-neutral-700 mb-3" />
            <p className="text-sm font-semibold text-neutral-400">Aucun fournisseur</p>
            <p className="text-xs text-neutral-600 mt-1">Ajoutez vos premiers fournisseurs</p>
          </div>
        ) : (
          filtered.map(s => (
            <SupplierCard
              key={s.id}
              supplier={s}
              products={products}
              onEdit={s => { setSelected(s); setModal('edit'); }}
              onDelete={setConfirmDelete}
              onOrder={s => { setSelected(s); setModal('order'); }}
            />
          ))
        )}
      </div>

      <button
        onClick={() => { setSelected(null); setModal('add'); }}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-2xl bg-emerald-500 shadow-2xl shadow-emerald-500/40 flex items-center justify-center active:scale-95 z-30"
      >
        <Plus size={24} className="text-black" strokeWidth={2.5} />
      </button>

      <Modal isOpen={modal === 'add'} onClose={() => { setModal(null); setSelected(null); }} title="Nouveau fournisseur" size="full">
        <SupplierForm products={products} onSave={handleSave} onCancel={() => { setModal(null); setSelected(null); }} />
      </Modal>

      <Modal isOpen={modal === 'edit'} onClose={() => { setModal(null); setSelected(null); }} title="Modifier le fournisseur" size="full">
        {selected && (
          <SupplierForm initial={selected} products={products} onSave={handleSave} onCancel={() => { setModal(null); setSelected(null); }} />
        )}
      </Modal>

      <Modal isOpen={modal === 'order'} onClose={() => { setModal(null); setSelected(null); }} title="Bon de Commande" size="full">
        {selected && <OrderModal supplier={selected} products={products} onClose={() => { setModal(null); setSelected(null); }} />}
      </Modal>

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { deleteSupplier(confirmDelete.id); setConfirmDelete(null); }}
        title="Supprimer le fournisseur"
        message={`Supprimer "${confirmDelete?.name}" ? Les produits associés ne seront pas supprimés.`}
      />
    </div>
  );
}
