import { createContext, useContext, useState, useCallback } from 'react';
import { db } from '../services/storage';
import { calcRecipeCost, calcFoodCost, calcMargin } from '../utils/calculations';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [products, setProducts] = useState(() => db.products.getAll());
  const [movements, setMovements] = useState(() => db.movements.getAll());
  const [suppliers, setSuppliers] = useState(() => db.suppliers.getAll());
  const [recipes, setRecipes] = useState(() => db.recipes.getAll());
  const [sales, setSales] = useState(() => db.sales.getAll());

  const reload = {
    products: useCallback(() => setProducts(db.products.getAll()), []),
    movements: useCallback(() => setMovements(db.movements.getAll()), []),
    suppliers: useCallback(() => setSuppliers(db.suppliers.getAll()), []),
    recipes: useCallback(() => setRecipes(db.recipes.getAll()), []),
    sales: useCallback(() => setSales(db.sales.getAll()), []),
  };

  const saveProduct = useCallback((product) => {
    db.products.save(product);
    reload.products();
  }, [reload.products]);

  const deleteProduct = useCallback((id) => {
    db.products.delete(id);
    reload.products();
  }, [reload.products]);

  const addMovement = useCallback((movement) => {
    const product = db.products.getById(movement.productId);
    if (!product) return;
    db.movements.add(movement);
    const delta = movement.type === 'in' ? movement.quantity : -movement.quantity;
    db.products.save({ ...product, currentStock: Math.max(0, product.currentStock + delta) });
    reload.products();
    reload.movements();
  }, [reload.products, reload.movements]);

  const saveSupplier = useCallback((supplier) => {
    db.suppliers.save(supplier);
    reload.suppliers();
  }, [reload.suppliers]);

  const deleteSupplier = useCallback((id) => {
    db.suppliers.delete(id);
    reload.suppliers();
  }, [reload.suppliers]);

  const saveRecipe = useCallback((recipe) => {
    const costPrice = calcRecipeCost(recipe.ingredients || []);
    const margin = calcMargin(costPrice, recipe.sellingPrice);
    const foodCostPercent = calcFoodCost(costPrice, recipe.sellingPrice);
    db.recipes.save({ ...recipe, costPrice, margin, foodCostPercent });
    reload.recipes();
  }, [reload.recipes]);

  const deleteRecipe = useCallback((id) => {
    db.recipes.delete(id);
    reload.recipes();
  }, [reload.recipes]);

  const addSale = useCallback((sale) => {
    db.sales.add(sale);
    const recipe = recipes.find(r => r.id === sale.recipeId);
    if (recipe?.ingredients) {
      recipe.ingredients.forEach(ing => {
        addMovement({
          productId: ing.productId,
          productName: ing.productName,
          type: 'out',
          quantity: ing.quantity * sale.quantity,
          reason: 'vente',
          note: `Vente: ${recipe.name} ×${sale.quantity}`,
          userId: sale.userId,
        });
      });
    }
    reload.sales();
  }, [recipes, addMovement, reload.sales]);

  const lowStock = products.filter(p => p.currentStock <= p.minimumStock);

  return (
    <AppContext.Provider value={{
      products, movements, suppliers, recipes, sales,
      lowStock,
      saveProduct, deleteProduct,
      addMovement,
      saveSupplier, deleteSupplier,
      saveRecipe, deleteRecipe,
      addSale,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
