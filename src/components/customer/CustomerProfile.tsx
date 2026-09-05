import React, { useState } from "react";
import { CustomerProfile as ICustomerProfile } from "../../types/customer";
import { User, Building2, CreditCard, Tag, FileText, Plus, AlertCircle, CheckCircle, ExternalLink, ShieldCheck } from "lucide-react";

interface CustomerProfileProps {
  customer: ICustomerProfile | null;
  phone: string;
  onOpenQuickRegister: () => void;
  onAddNote: (note: string) => void;
  onPasteDebtToChat?: (text: string) => void;
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({
  customer,
  phone,
  onOpenQuickRegister,
  onAddNote,
  onPasteDebtToChat,
}) => {
  const [newNote, setNewNote] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);

  if (!customer || !customer.isRegistered) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800">Contacto No Registrado en OmniFlow</h4>
          <p className="text-[11px] text-slate-500 mt-1 max-w-[240px]">
            El número {phone || "desconocido"} no está vinculado a una ficha de cliente o empresa.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenQuickRegister}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Alta Rápida de Cliente
        </button>
      </div>
    );
  }

  const formatGs = (val: number) => {
    return new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(val);
  };

  const handleCreateNote = () => {
    if (!newNote.trim()) return;
    onAddNote(newNote.trim());
    setNewNote("");
    setShowAddNote(false);
  };

  const handleShareDebtNotice = () => {
    if (!onPasteDebtToChat) return;
    const debtText = `Estimado/a ${customer.name}, le recordamos que registra un saldo pendiente de ${formatGs(customer.financial.debtBalance)} con fecha de vencimiento reciente. Agradecemos su gentil regularización para mantener su línea de crédito habilitada.`;
    onPasteDebtToChat(debtText);
  };

  return (
    <div className="flex flex-col gap-3 text-xs">
      {/* Basic header & tags */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {customer.avatarUrl ? (
              <img src={customer.avatarUrl} alt={customer.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                {customer.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                {customer.name}
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 inline" title="Cliente Verificado" />
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{customer.phone}</p>
            </div>
          </div>

          <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-200">
            {customer.priceList.replace(/_/g, " ")}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {customer.tags.map((t, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded-md font-medium">
              <Tag className="w-2.5 h-2.5 text-slate-400" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Financial Status Banner */}
      <div className={`p-3 rounded-xl border flex flex-col gap-2 ${
        customer.financial.debtBalance > 0
          ? "bg-rose-50/80 border-rose-200"
          : "bg-emerald-50/80 border-emerald-200"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CreditCard className={`w-4 h-4 ${customer.financial.debtBalance > 0 ? "text-rose-600" : "text-emerald-600"}`} />
            <span className="font-bold text-slate-900">Estado de Cuenta & Crédito</span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            customer.financial.debtBalance > 0 ? "bg-rose-200 text-rose-800" : "bg-emerald-200 text-emerald-800"
          }`}>
            {customer.financial.paymentStatus.replace(/_/g, " ")}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
          <div className="bg-white/90 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Saldo Deudor Actual</span>
            <span className={`font-bold text-xs ${customer.financial.debtBalance > 0 ? "text-rose-700" : "text-slate-700"}`}>
              {formatGs(customer.financial.debtBalance)}
            </span>
          </div>

          <div className="bg-white/90 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[10px]">Límite de Crédito</span>
            <span className="font-bold text-xs text-slate-700">
              {formatGs(customer.financial.creditLimit)}
            </span>
          </div>
        </div>

        {customer.financial.debtBalance > 0 && onPasteDebtToChat && (
          <button
            type="button"
            onClick={handleShareDebtNotice}
            className="text-[11px] font-medium text-rose-800 bg-rose-100 hover:bg-rose-200 py-1.5 px-2 rounded-lg transition-colors text-center"
          >
            Pegar recordatorio de pago en chat
          </button>
        )}
      </div>

      {/* Fiscal Data */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span>Datos de Facturación Fiscal</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
          <div>
            <span className="text-slate-400 block text-[10px]">RUC / Documento:</span>
            <span className="font-mono font-semibold">{customer.fiscal.taxId}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Razón Social:</span>
            <span className="font-semibold truncate block">{customer.fiscal.legalName}</span>
          </div>
          {customer.fiscal.electronicBillingEmail && (
            <div className="col-span-2">
              <span className="text-slate-400 block text-[10px]">Email Facturación Electrónica:</span>
              <span className="truncate block font-mono text-[10px] text-slate-600">{customer.fiscal.electronicBillingEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Internal CRM Notes */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Notas Internas del CRM ({customer.notes.length})</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddNote(!showAddNote)}
            className="text-[11px] text-emerald-700 font-semibold hover:underline"
          >
            {showAddNote ? "Cerrar" : "+ Nota"}
          </button>
        </div>

        {showAddNote && (
          <div className="flex flex-col gap-1.5 pt-1">
            <textarea
              rows={2}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Escribe una nota para el equipo u OmniBot..."
              className="text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button
              type="button"
              onClick={handleCreateNote}
              className="self-end px-2.5 py-1 bg-emerald-600 text-white font-semibold rounded-md text-[11px]"
            >
              Guardar Nota
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-1 max-h-40 overflow-y-auto">
          {customer.notes.map((n) => (
            <div key={n.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="font-semibold text-slate-600">{n.author}</span>
                <span>{n.createdAt}</span>
              </div>
              <p className="text-slate-700 leading-snug">{n.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
