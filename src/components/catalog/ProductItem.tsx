import React from "react";
import { ProductItem as IProductItem } from "../../types/catalog";
import { CustomerProfile } from "../../types/customer";
import { Plus, PackageCheck, AlertTriangle } from "lucide-react";

interface ProductItemProps {
  product: IProductItem;
  customerPriceList?: CustomerProfile["priceList"];
  onAddToCart: (product: IProductItem) => void;
  onQuickQuote: (product: IProductItem) => void;
}

export const ProductItem: React.FC<ProductItemProps> = ({
  product,
  customerPriceList = "LISTA_GENERAL",
  onAddToCart,
  onQuickQuote,
}) => {
  const getActivePrice = () => {
    switch (customerPriceList) {
      case "LISTA_VIP":
        return product.priceVip;
      case "LISTA_MAYORISTA":
      case "DISTRIBUIDOR":
        return product.priceWholesale;
      default:
        return product.priceRetail;
    }
  };

  const activePrice = getActivePrice();
  const formatGs = (val: number) =>
    new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex gap-2.5 items-start hover:border-slate-300 transition-all shadow-2xs">
      <img
        src={product.imageUrl}
        alt={product.title}
        className="w-14 h-14 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <h4 className="font-semibold text-xs text-slate-900 truncate leading-tight">{product.title}</h4>
        </div>
        <p className="text-[10px] text-slate-500 font-mono mt-0.5">SKU: {product.sku}</p>

        <div className="flex items-center justify-between mt-1.5">
          <div>
            <span className="text-xs font-bold text-slate-900">{formatGs(activePrice)}</span>
            {customerPriceList !== "LISTA_GENERAL" && (
              <span className="text-[10px] text-slate-400 line-through ml-1.5">
                {formatGs(product.priceRetail)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                product.stockTotal > 5
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {product.stockTotal > 5 ? <PackageCheck className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
              {product.stockTotal} {product.unit}s
            </span>

            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
              title="Agregar a la cotización / POS"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
