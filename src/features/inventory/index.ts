// Public API of the inventory feature (blood bags and stock). Other features
// reuse the bag label, the stock matrix and the product lookups from here.

export { InventoryView } from "./components/inventory-view";
export { ProductDetailView } from "./components/product-detail";
export { ProductLabel } from "./components/product-label";
export { StockMatrix } from "./components/stock-matrix";
export { useProducts } from "./hooks/use-products";
export { type ProductFilters, productsService } from "./services/products.service";
