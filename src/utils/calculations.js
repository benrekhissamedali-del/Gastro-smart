export const calcRecipeCost = (ingredients = []) =>
  ingredients.reduce((sum, ing) => sum + ing.quantity * ing.unitCost, 0);

export const calcFoodCost = (costPrice, sellingPrice) =>
  sellingPrice > 0 ? (costPrice / sellingPrice) * 100 : 0;

export const calcMargin = (costPrice, sellingPrice) => sellingPrice - costPrice;

export const calcMarginPercent = (costPrice, sellingPrice) =>
  sellingPrice > 0 ? ((sellingPrice - costPrice) / sellingPrice) * 100 : 0;

export const calcCoefficient = (costPrice, sellingPrice) =>
  costPrice > 0 ? sellingPrice / costPrice : 0;

export const suggestPrice = (costPrice, targetPct = 30) =>
  targetPct > 0 ? costPrice / (targetPct / 100) : 0;

export const calcStockValue = (products) =>
  products.reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0);

export const getLowStock = (products) =>
  products.filter(p => p.currentStock <= p.minimumStock);

export const fmt = (n, decimals = 2) =>
  Number(n || 0).toFixed(decimals);

export const fmtEur = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

export const fmtPct = (n) => `${fmt(n, 1)}%`;
