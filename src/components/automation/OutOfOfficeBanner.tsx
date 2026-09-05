import React, { useState } from "react";
import { Clock, Moon, Sun, ToggleLeft, ToggleRight, Check } from "lucide-react";

export const OutOfOfficeBanner: React.FC = () => {
  const [autoWelcome, setAutoWelcome] = useState(true);
  const [outOfOffice, setOutOfOffice] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const toggleOutOfOffice = () => {
    setOutOfOffice(!outOfOffice);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-2.5 text-xs shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Reglas de Horario Comercial & Fuera de Turno</span>
        </div>
        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
          08:00 - 19:00 (En Horario)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="font-semibold text-slate-800 block text-[11px]">Bienvenida Auto</span>
            <span className="text-[10px] text-slate-500">Nuevos contactos</span>
          </div>
          <button
            type="button"
            onClick={() => setAutoWelcome(!autoWelcome)}
            className="text-emerald-600 hover:text-emerald-700"
          >
            {autoWelcome ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-400" />}
          </button>
        </div>

        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="font-semibold text-slate-800 block text-[11px]">Modo Guardia / Noche</span>
            <span className="text-[10px] text-slate-500">Respuesta diferida</span>
          </div>
          <button
            type="button"
            onClick={toggleOutOfOffice}
            className={outOfOffice ? "text-indigo-600" : "text-slate-400"}
          >
            {outOfOffice ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {outOfOffice && (
        <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] leading-relaxed">
          🌙 <strong>Mensaje Fuera de Horario Activo:</strong> <em>"Gracias por escribirnos. Nuestro horario habitual concluyó. Tu mensaje quedó registrado en la cola de OmniFlow y te responderemos a primera hora mañana."</em>
        </div>
      )}
    </div>
  );
};
