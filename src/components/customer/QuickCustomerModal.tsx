import React, { useState } from "react";
import { CustomerProfile } from "../../types/customer";
import { X, UserPlus, ShieldCheck } from "lucide-react";

interface QuickCustomerModalProps {
  isOpen: boolean;
  phone: string;
  defaultName?: string;
  onClose: () => void;
  onSaveCustomer: (customer: CustomerProfile) => void;
}

export const QuickCustomerModal: React.FC<QuickCustomerModalProps> = ({
  isOpen,
  phone,
  defaultName = "",
  onClose,
  onSaveCustomer,
}) => {
  const [name, setName] = useState(defaultName);
  const [taxId, setTaxId] = useState("");
  const [legalName, setLegalName] = useState("");
  const [email, setEmail] = useState("");
  const [priceList, setPriceList] = useState<CustomerProfile["priceList"]>("LISTA_GENERAL");
  const [creditLimit, setCreditLimit] = useState(2000000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCust: CustomerProfile = {
      id: `cust_${Date.now()}`,
      phone: phone || "+595980000000",
      name: name.trim(),
      email: email.trim() || undefined,
      tags: ["Alta Rápida Extensión", "Nuevo"],
      priceList,
      fiscal: {
        taxId: taxId.trim() || "44444401-7",
        legalName: legalName.trim() || name.trim(),
      },
      financial: {
        debtBalance: 0,
        creditLimit,
        unpaidInvoicesCount: 0,
        paymentStatus: "AL_DIA",
      },
      notes: [
        {
          id: `note_${Date.now()}`,
          author: "Extensión WhatsApp Web",
          content: "Cliente dado de alta desde la consola del operador.",
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ],
      totalOrdersCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      isRegistered: true,
    };

    onSaveCustomer(newCust);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Alta Rápida de Cliente en OmniFlow</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3 text-xs">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-800 border border-emerald-200 text-[11px]">
            Registrando teléfono E.164: <strong className="font-mono">{phone}</strong>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nombre Completo o Razón Comercial *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              placeholder="Ej: Lic. Marcelo Pérez"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">RUC / C.I.</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                placeholder="Ej: 3456789-1"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lista de Precio</label>
              <select
                value={priceList}
                onChange={(e) => setPriceList(e.target.value as any)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
              >
                <option value="LISTA_GENERAL">Lista General</option>
                <option value="LISTA_MAYORISTA">Lista Mayorista</option>
                <option value="LISTA_VIP">Lista VIP</option>
                <option value="DISTRIBUIDOR">Distribuidor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                placeholder="cliente@email.com"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Límite de Crédito Inicial (Gs)</label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
            >
              Crear Ficha y Sincronizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
