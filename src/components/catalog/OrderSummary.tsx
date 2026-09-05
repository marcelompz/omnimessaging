import React from "react";
import { OrderCartItem } from "../../types/catalog";
import { ShoppingBag, Copy, CheckCircle2, Trash2, Send, Receipt } from "lucide-react";

interface OrderSummaryProps {
  cart: OrderCartItem[];
  customerName: string;
  customerPhone: string;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onPasteQuoteToChat: (formattedQuoteText: string) => void;
  onEmitPosOrder: (total: number) => void;
  pointsDiscount?: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  cart,
  customerName,
  customerPhone,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onPasteQuoteToChat,
  onEmitPosOrder,
  pointsDiscount = 0,
}) => {
  const formatGs = (val: number) =>
    new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(val);

  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const total = Math.max(0, subtotal - pointsDiscount);

  if (cart.length === 0) {
    return (
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-xs">
        <ShoppingBag className="w-5 h-5 mx-auto mb-1 text-slate-400" />
        No hay productos en el carrito de cotización.
      </div>
    );
  }

  const handleGenerateQuoteText = () => {
    const quoteId = `COT-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentLink = `https://pay.omniflow.cloud/q/${quoteId}`;
    
    let text = `📄 *PRESUPUESTO OMNIFLOW #${quoteId}*\n`;
    text += `👤 *Cliente:* ${customerName || "Cliente"}\n`;
    text += `📅 *Fecha:* ${new Date().toLocaleDateString("es-PY")}\n`;
    text += `--------------------------------\n`;
    cart.forEach((i) => {
      text += `• ${i.quantity}x ${i.product.title} - ${formatGs(i.unitPrice * i.quantity)}\n`;
    });
    text += `--------------------------------\n`;
    text += `*Subtotal:* ${formatGs(subtotal)}\n`;
    if (pointsDiscount > 0) {
      text += `🎁 *Descuento Puntos Loyalty:* -${formatGs(pointsDiscount)}\n`;
    }
    text += `*TOTAL FINAL:* ${formatGs(total)}\n\n`;
    text += `💳 *Pagar o confirmar en línea:* ${paymentLink}\n`;
    text += `_Válido por 48 horas. Stock reservado._`;

    onPasteQuoteToChat(text);
  };

  return (
    <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-2.5 text-xs shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          <span>Borrador de Cotización / POS ({cart.length})</span>
        </div>
        <button
          type="button"
          onClick={onClearCart}
          className="text-slate-400 hover:text-red-600 p-1 transition-colors"
          title="Vaciar carrito"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cart items list */}
      <div className="flex flex-col gap-2 max-h-44 overflow-y-auto">
        {cart.map((item) => (
          <div key={item.product.id} className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800 truncate text-[11px]">{item.product.title}</p>
              <p className="text-[10px] text-slate-500">{formatGs(item.unitPrice)} c/u</p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdateQty(item.product.id, -1)}
                className="w-5 h-5 flex items-center justify-center bg-white border border-slate-300 rounded font-bold text-slate-700 hover:bg-slate-100"
              >
                -
              </button>
              <span className="font-mono font-bold text-xs w-4 text-center">{item.quantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQty(item.product.id, 1)}
                className="w-5 h-5 flex items-center justify-center bg-white border border-slate-300 rounded font-bold text-slate-700 hover:bg-slate-100"
              >
                +
              </button>
              <span className="font-semibold text-[11px] text-slate-800 ml-1 w-16 text-right">
                {formatGs(item.unitPrice * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
        <div className="flex justify-between text-slate-500 text-[11px]">
          <span>Subtotal:</span>
          <span>{formatGs(subtotal)}</span>
        </div>
        {pointsDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 text-[11px] font-medium">
            <span>Descuento Loyalty Hub:</span>
            <span>-{formatGs(pointsDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-100">
          <span>Total:</span>
          <span>{formatGs(total)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={handleGenerateQuoteText}
          className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          title="Pega la cotización estructurada con enlace de pago en el chat"
        >
          <Copy className="w-3.5 h-3.5" />
          Pegar en chat
        </button>

        <button
          type="button"
          onClick={() => onEmitPosOrder(total)}
          className="flex items-center justify-center gap-1.5 py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          title="Emite orden de venta directa en el POS"
        >
          <Receipt className="w-3.5 h-3.5" />
          Emitir POS
        </button>
      </div>
    </div>
  );
};
