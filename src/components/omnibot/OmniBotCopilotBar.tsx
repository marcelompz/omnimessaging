import React, { useState } from "react";
import { CopilotSuggestion } from "../../types/omnibot";
import { Sparkles, Copy, Send, Trash2, Wrench, RefreshCw, CheckCircle2 } from "lucide-react";

interface OmniBotCopilotBarProps {
  suggestion: CopilotSuggestion | null;
  isLoading: boolean;
  onPasteToEditor: (text: string) => void;
  onSendDirectly: (text: string) => void;
  onDiscard: () => void;
  onRefresh: () => void;
}

export const OmniBotCopilotBar: React.FC<OmniBotCopilotBarProps> = ({
  suggestion,
  isLoading,
  onPasteToEditor,
  onSendDirectly,
  onDiscard,
  onRefresh,
}) => {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl flex items-center justify-center gap-2 text-xs text-purple-700">
        <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
        <span>OmniBot Copilot analizando contexto y herramientas...</span>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Sin sugerencias pendientes para este chat.</span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="px-2.5 py-1 text-xs font-medium text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
        >
          Analizar con IA
        </button>
      </div>
    );
  }

  const handleCopy = () => {
    onPasteToEditor(suggestion.suggestedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3.5 bg-gradient-to-b from-purple-50/90 to-white border border-purple-200/90 rounded-xl flex flex-col gap-2.5 shadow-xs">
      {/* Header with intent and confidence */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="p-1 bg-purple-600 text-white rounded-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-bold text-purple-950">Copiloto OmniBot</span>
          <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
            {suggestion.intent.replace(/_/g, " ")}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500">
            Confianza: {Math.round(suggestion.confidence * 100)}%
          </span>
          <button
            type="button"
            onClick={onRefresh}
            title="Re-analizar mensaje del cliente"
            className="text-slate-400 hover:text-purple-700 transition-colors p-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tool reasoning badges */}
      {suggestion.invokedTools && suggestion.invokedTools.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {suggestion.invokedTools.map((t, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[10px] text-slate-700"
              title={t.result || "Ejecutado por OmniFlow"}
            >
              <Wrench className="w-2.5 h-2.5 text-slate-500" />
              <span className="font-mono">{t.tool}</span>
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 ml-0.5" />
            </div>
          ))}
        </div>
      )}

      {/* AI Reasoning note */}
      {suggestion.reasoning && (
        <p className="text-[11px] text-slate-600 italic bg-white/70 p-2 rounded-lg border border-purple-100">
          💡 {suggestion.reasoning}
        </p>
      )}

      {/* Suggested draft box */}
      <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 relative group font-sans leading-relaxed">
        {suggestion.suggestedDraft}
      </div>

      {/* Action buttons: [Pegar en editor], [Enviar directo], [Descartar] */}
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          title="Inserta el borrador en el cuadro de texto de WhatsApp para revisarlo o editarlo"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
          {copied ? "¡Pegado!" : "Pegar en editor"}
        </button>

        <button
          type="button"
          onClick={() => onSendDirectly(suggestion.suggestedDraft)}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          title="Despacha el mensaje inmediatamente en el chat"
        >
          <Send className="w-3.5 h-3.5" />
          Enviar directo
        </button>

        <button
          type="button"
          onClick={onDiscard}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-colors"
          title="Descartar esta sugerencia"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Descartar
        </button>
      </div>
    </div>
  );
};
