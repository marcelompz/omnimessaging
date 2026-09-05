import React from "react";
import { ProfessionalResource, PhysicalLocation } from "../../types/appointment";
import { UserCheck, MapPin } from "lucide-react";

interface ResourceSelectorProps {
  professionals: ProfessionalResource[];
  locations: PhysicalLocation[];
  selectedProfessionalId: string;
  selectedLocationId: string;
  onSelectProfessional: (id: string) => void;
  onSelectLocation: (id: string) => void;
}

export const ResourceSelector: React.FC<ResourceSelectorProps> = ({
  professionals,
  locations,
  selectedProfessionalId,
  selectedLocationId,
  onSelectProfessional,
  onSelectLocation,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
      <div>
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
          <UserCheck className="w-3 h-3 text-slate-400" />
          Profesional
        </label>
        <select
          value={selectedProfessionalId}
          onChange={(e) => onSelectProfessional(e.target.value)}
          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
        >
          <option value="ALL">Todos los profesionales</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.role.slice(0, 18)}...)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-400" />
          Locación Física
        </label>
        <select
          value={selectedLocationId}
          onChange={(e) => onSelectLocation(e.target.value)}
          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
        >
          <option value="ALL">Todas las locaciones</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
