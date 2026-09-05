import React from "react";
import { OmniBotMode } from "../../types/omnibot";
import { Bot, UserCheck, PauseCircle, ShieldAlert } from "lucide-react";

interface OmniBotStatusBadgeProps {
  mode: OmniBotMode;
  onChangeMode: (newMode: OmniBotMode) => void;
  isAiThinking?: boolean;
}

export const OmniBotStatusBadge: React.FC<OmniBotStatusBadgeProps> = ({
  mode,
  onChangeMode,
  isAiThinking,
}) => {
  const getBadgeStyle = () => {
    switch (mode) {
      case "ACTIVE":
        return {
          bg: "bg-emerald-500/10 text-emerald-700 border-emerald-300",
          dot: "bg-emerald-500 animate-pulse",
          icon: <Bot className="w-3.5 h-3.5" />,
          label: "OmniBot Activo",
          sub: "Respondiendo automáticamente",
        };
      case "HUMAN_TAKEOVER":
        return {
          bg: "bg-amber-500/10 text-amber-800 border-amber-300",
          dot: "bg-amber-500",
          icon: <UserCheck className="w-3.5 h-3.5" />,
          label: "HUMAN_TAKEOVER",
          sub: "Operador en control del chat",
        };
      case "BOT_PAUSED":
        return {
          bg: "bg-slate-500/10 text-slate-700 border-slate-300",
          dot: "bg-slate-400",
          icon: <PauseCircle className="w-3.5 h-3.5" />,
          label: "OmniBot Pausado",
          sub: "Sin intervención del bot",
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <div className="flex flex-col gap-1.5 p-2.5 rounded-xl border bg-white shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg}`}>
            <span className={`w-2 h-2 rounded-full ${style.dot}`} />
            {style.icon}
            {style.label}
          </span>
          {isAiThinking && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md animate-pulse">
              Analizando...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => onChangeMode("ACTIVE")}
            className={`px-2 py-1 rounded-md transition-all font-medium ${
              mode === "ACTIVE"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Activar respuesta automática de OmniBot"
          >
            Activo
          </button>
          <button
            type="button"
            onClick={() => onChangeMode("BOT_PAUSED")}
            className={`px-2 py-1 rounded-md transition-all font-medium ${
              mode === "BOT_PAUSED"
                ? "bg-white text-slate-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Pausar todas las respuestas del bot"
          >
            Pausado
          </button>
          <button
            type="button"
            onClick={() => onChangeMode("HUMAN_TAKEOVER")}
            className={`px-2 py-1 rounded-md transition-all font-medium ${
              mode === "HUMAN_TAKEOVER"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Asumir control como operador humano"
          >
            Takeover
          </button>
        </div>
      </div>
      <div className="text-[11px] text-slate-500 flex items-center justify-between px-0.5">
        <span>{style.sub}</span>
        <span className="text-[10px] text-slate-400">Protocolo Anti-Colisión v3</span>
      </div>
    </div>
  );
};
