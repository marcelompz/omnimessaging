import React, { useState } from "react";
import { ProductItem as IProductItem, OrderCartItem } from "../../types/catalog";
import { CustomerProfile } from "../../types/customer";
import { ProductItem } from "./ProductItem";
import { OrderSummary } from "./OrderSummary";
import { Search, Filter, ShoppingBag } from "lucide-react";

interface CatalogPOSProps {
  products: IProductItem[];
  customer: CustomerProfile | null;
  cart: OrderCartItem[];
  onAddToCart: (product: IProductItem) => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onPasteQuoteToChat: (text: string) => void;
  onEmitPosOrder: (total: number) => void;
  pointsDiscount?: number;
}

export const CatalogPOS: React.FC<CatalogPOSProps> = ({
  products,
  customer,
  cart,
  onAddToCart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onPasteQuoteToChat,
  onEmitPosOrder,
  pointsDiscount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = ["ALL", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "ALL" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex flex-col gap-3 text-xs">
      {/* Order Summary & Cart at top if items present */}
      {cart.length > 0 && (
        <OrderSummary
          cart={cart}
          customerName={customer?.name || "Cliente"}
          customerPhone={customer?.phone || ""}
          onUpdateQty={onUpdateQty}
          onRemoveItem={onRemoveItem}
          onClearCart={onClearCart}
          onPasteQuoteToChat={onPasteQuoteToChat}
          onEmitPosOrder={onEmitPosOrder}
          pointsDiscount={pointsDiscount}
        />
      )}

      {/* Search and filter controls */}
      <div className="flex flex-col gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por producto, insumo o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "ALL" ? "Todos" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products list */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>{filteredProducts.length} productos disponibles</span>
          {customer && (
            <span className="font-semibold text-purple-800">
              Precios: {customer.priceList.replace(/_/g, " ")}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto">
          {filteredProducts.map((prod) => (
            <ProductItem
              key={prod.id}
              product={prod}
              customerPriceList={customer?.priceList}
              onAddToCart={onAddToCart}
              onQuickQuote={(p) => {
                onAddToCart(p);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
