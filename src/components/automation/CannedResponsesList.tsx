import React, { useState } from "react";
import { CannedResponse } from "../../types/automation";
import { CustomerProfile } from "../../types/customer";
import { Zap, Search, Copy, Check, Terminal } from "lucide-react";

interface CannedResponsesListProps {
  responses: CannedResponse[];
  customer: CustomerProfile | null;
  onPasteResponse: (text: string) => void;
}

export const CannedResponsesList: React.FC<CannedResponsesListProps> = ({
  responses,
  customer,
  onPasteResponse,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatGs = (val: number) =>
    new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(val);

  const replaceVariables = (template: string) => {
    let result = template;
    const clientName = customer?.name || "Estimado cliente";
    const debt = customer?.financial?.debtBalance ? formatGs(customer.financial.debtBalance) : "0 Gs";
    const listPrice = customer?.priceList ? customer.priceList.replace(/_/g, " ") : "Lista Estándar";

    result = result.replace(/\{cliente\.nombre\}/g, clientName);
    result = result.replace(/\{saldo_pendiente\}/g, debt);
    result = result.replace(/\{cliente\.lista_precio\}/g, listPrice);
    result = result.replace(/\{proxima_cita\}/g, "Jueves 15:30 hs con Dra. Mendoza");
    return result;
  };

  const filtered = responses.filter((r) => {
    return (
      r.shortcut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.contentTemplate.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSelect = (r: CannedResponse) => {
    const finalContent = replaceVariables(r.contentTemplate);
    onPasteResponse(finalContent);
    setCopiedId(r.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col gap-3 text-xs">
      <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="font-bold flex items-center gap-1.5 leading-tight">
            <Zap className="w-4 h-4" />
            Respuestas Rápidas Deterministas
          </h4>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
            Sin IA / Instantáneo
          </span>
        </div>
        <p className="text-[11px] text-blue-100 mt-1">
          Escribe el atajo (ej. <code className="bg-blue-800/60 px-1 py-0.5 rounded font-mono">/precios</code>) o pulsa para insertar con variables auto-completadas.
        </p>
      </div>

      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por atajo (/precios, /banco) o título..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
        />
      </div>

      <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto">
        {filtered.map((r) => {
          const previewText = replaceVariables(r.contentTemplate);
          return (
            <div
              key={r.id}
              className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col gap-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono font-bold text-[11px] rounded-md border border-blue-200">
                    {r.shortcut}
                  </span>
                  <span className="font-bold text-slate-800 text-xs">{r.title}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {r.category}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 font-sans leading-relaxed whitespace-pre-line">
                {previewText}
              </p>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Terminal className="w-3 h-3 text-slate-400" />
                  <span>{r.variables.length} variables dinámicas</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="flex items-center gap-1.5 py-1 px-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                >
                  {copiedId === r.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === r.id ? "¡Insertado!" : "Insertar en chat"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
