import React, { useState } from "react";
import { Sliders, Check, Shield } from "lucide-react";

interface BotConfigQuickPanelProps {
  autoTakeover: boolean;
  onToggleAutoTakeover: (enabled: boolean) => void;
  systemPrompt: string;
  onUpdateSystemPrompt: (prompt: string) => void;
}

export const BotConfigQuickPanel: React.FC<BotConfigQuickPanelProps> = ({
  autoTakeover,
  onToggleAutoTakeover,
  systemPrompt,
  onUpdateSystemPrompt,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempPrompt, setTempPrompt] = useState(systemPrompt);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    onUpdateSystemPrompt(tempPrompt);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 transition-colors font-semibold text-slate-700"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span>Configuración Rápida de OmniBot para este Chat</span>
        </div>
        <span className="text-[11px] text-slate-500">{isOpen ? "Ocultar" : "Ajustar"}</span>
      </button>

      {isOpen && (
        <div className="p-3.5 flex flex-col gap-3 border-t border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-800 block">Detección Automática de Intervención</span>
              <span className="text-[11px] text-slate-500 leading-tight">
                Pasa automáticamente a HUMAN_TAKEOVER al escribir en el editor.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoTakeover}
                onChange={(e) => onToggleAutoTakeover(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-800">
              Personalidad / Directiva Contextual del Bot:
            </label>
            <textarea
              rows={2}
              value={tempPrompt}
              onChange={(e) => setTempPrompt(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800"
              placeholder="Ej: Tratar al cliente con formalidad médica y priorizar productos de cabina estéril..."
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Aplicado solo en llamadas OmniBot</span>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-medium transition-colors"
              >
                {savedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                {savedNotice ? "Guardado" : "Guardar Ajustes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
