import React from "react";
import { UserCheck, ArrowRight, ShieldCheck } from "lucide-react";

interface HumanTakeoverBannerProps {
  onReleaseControl: () => void;
  takeoverReason?: string;
  lastInterventionTime?: string;
}

export const HumanTakeoverBanner: React.FC<HumanTakeoverBannerProps> = ({
  onReleaseControl,
  takeoverReason = "Intervención manual del operador en el editor de WhatsApp",
  lastInterventionTime,
}) => {
  return (
    <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
          <span className="p-1 bg-amber-100 rounded-md text-amber-700">
            <UserCheck className="w-4 h-4" />
          </span>
          <div>
            <p className="leading-tight">Operador Humano en Control</p>
            <p className="text-[11px] font-normal text-amber-700 leading-tight mt-0.5">
              OmniBot silenciado para prevenir respuestas contradictorias.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 p-2 rounded-lg text-[11px] text-amber-950 border border-amber-100 flex items-center justify-between">
        <span className="truncate pr-2">Motivo: {takeoverReason}</span>
        {lastInterventionTime && (
          <span className="text-[10px] text-amber-600 shrink-0">{lastInterventionTime}</span>
        )}
      </div>

      <button
        type="button"
        onClick={onReleaseControl}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
      >
        <ShieldCheck className="w-4 h-4" />
        Devolver control a OmniBot
        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
      </button>
    </div>
  );
};
