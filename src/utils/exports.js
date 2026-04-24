function escapeCsv(val) {
  const s = String(val === null || val === undefined ? '' : val);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function downloadCsv(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => escapeCsv(r[h])).join(','))
  ].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportStock(products) {
  const rows = products.map(p => ({
    Nom: p.name,
    Catégorie: p.category,
    Unité: p.unit,
    'Prix achat (€)': p.purchasePrice,
    'Stock actuel': p.currentStock,
    'Stock minimum': p.minimumStock,
    'Valeur stock (€)': (p.currentStock * p.purchasePrice).toFixed(2),
    Alerte: p.currentStock <= p.minimumStock ? 'OUI' : 'NON',
  }));
  downloadCsv(rows, `stock_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportRecipes(recipes) {
  const rows = recipes.map(r => ({
    Nom: r.name,
    Catégorie: r.category,
    'Coût revient (€)': r.costPrice?.toFixed(2),
    'Prix vente (€)': r.sellingPrice,
    'Marge (€)': r.margin?.toFixed(2),
    'Food cost (%)': r.foodCostPercent?.toFixed(1),
    'Nb ingrédients': r.ingredients?.length || 0,
  }));
  downloadCsv(rows, `recettes_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportSales(sales) {
  const rows = sales.map(s => ({
    Date: new Date(s.date).toLocaleString('fr-FR'),
    Recette: s.recipeName,
    Quantité: s.quantity,
    'Prix unitaire (€)': s.unitPrice,
    'CA (€)': s.totalRevenue.toFixed(2),
  }));
  downloadCsv(rows, `ventes_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function printOrderPDF(supplier, items) {
  const date = new Date().toLocaleDateString('fr-FR');
  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const html = `
    <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
    <title>Bon de commande</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
      h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px; }
      .info { display: flex; justify-content: space-between; margin-bottom: 30px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #059669; color: white; padding: 10px; text-align: left; }
      td { padding: 8px 10px; border-bottom: 1px solid #eee; }
      .total { font-weight: bold; font-size: 1.2em; text-align: right; margin-top: 20px; }
      .footer { margin-top: 60px; font-size: 0.8em; color: #666; }
    </style></head><body>
    <h1>Bon de Commande</h1>
    <div class="info">
      <div><strong>Fournisseur:</strong> ${supplier.name}<br/>
      ${supplier.phone}<br/>${supplier.email}</div>
      <div><strong>Date:</strong> ${date}<br/>
      <strong>Référence:</strong> BC-${Date.now().toString(36).toUpperCase()}</div>
    </div>
    <table>
      <thead><tr><th>Produit</th><th>Unité</th><th>Quantité</th><th>Prix unit.</th><th>Total</th></tr></thead>
      <tbody>
        ${items.map(i => `<tr>
          <td>${i.name}</td><td>${i.unit}</td><td>${i.quantity}</td>
          <td>${i.unitPrice?.toFixed(2)} €</td>
          <td>${(i.quantity * i.unitPrice)?.toFixed(2)} €</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="total">Total HT: ${total.toFixed(2)} €</div>
    <div class="footer">GastroSmart — Document généré le ${date}</div>
    </body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.print();
}
