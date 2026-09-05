import React from "react";
import { AvailableSlot, ProfessionalResource, PhysicalLocation } from "../../types/appointment";
import { Clock, Calendar, Check, X } from "lucide-react";

interface SlotPickerProps {
  slots: AvailableSlot[];
  professionals: ProfessionalResource[];
  locations: PhysicalLocation[];
  onBookSlot: (slot: AvailableSlot) => void;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  slots,
  professionals,
  locations,
  onBookSlot,
}) => {
  // Group slots by date
  const groupedByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, AvailableSlot[]>);

  const getProfName = (id: string) => professionals.find((p) => p.id === id)?.name || "Profesional";
  const getLocName = (id: string) => locations.find((l) => l.id === id)?.name || "Locación";

  const dates = Object.keys(groupedByDate).sort();

  if (dates.length === 0) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-xs">
        No se encontraron franjas horarias con los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {dates.map((date) => {
        const dateObj = new Date(date + "T00:00:00");
        const formattedDate = dateObj.toLocaleDateString("es-PY", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });

        return (
          <div key={date} className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs mb-2 capitalize">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{formattedDate}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {groupedByDate[date].map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  disabled={!slot.isAvailable}
                  onClick={() => onBookSlot(slot)}
                  className={`p-2 rounded-lg text-left border text-xs transition-all flex flex-col justify-between ${
                    slot.isAvailable
                      ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-100/60 text-slate-800 cursor-pointer"
                      : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {slot.startTime} - {slot.endTime}
                    </span>
                    {slot.isAvailable ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    ) : (
                      <span className="text-[9px] text-slate-400">Ocupado</span>
                    )}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500 truncate">
                    {getProfName(slot.professionalId)}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">
                    {getLocName(slot.locationId)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
