import React, { useState } from "react";
import { AvailableSlot, ProfessionalResource, PhysicalLocation, Appointment } from "../../types/appointment";
import { CustomerProfile } from "../../types/customer";
import { ResourceSelector } from "./ResourceSelector";
import { SlotPicker } from "./SlotPicker";
import { Calendar, Share2, Plus, CheckCircle, ExternalLink, Trash2 } from "lucide-react";

interface AppointmentSchedulerProps {
  slots: AvailableSlot[];
  professionals: ProfessionalResource[];
  locations: PhysicalLocation[];
  customer: CustomerProfile | null;
  onBookAppointment: (slot: AvailableSlot, serviceName: string) => void;
  onCancelAppointment: (appId: string) => void;
  onPasteSlotsToChat: (slotsText: string) => void;
  activeAppointments: Appointment[];
}

export const AppointmentScheduler: React.FC<AppointmentSchedulerProps> = ({
  slots,
  professionals,
  locations,
  customer,
  onBookAppointment,
  onCancelAppointment,
  onPasteSlotsToChat,
  activeAppointments,
}) => {
  const [selectedProfId, setSelectedProfId] = useState("ALL");
  const [selectedLocId, setSelectedLocId] = useState("ALL");
  const [bookingSlot, setBookingSlot] = useState<AvailableSlot | null>(null);
  const [serviceName, setServiceName] = useState("Consulta de Valoración Médica");

  const filteredSlots = slots.filter((s) => {
    const matchProf = selectedProfId === "ALL" || s.professionalId === selectedProfId;
    const matchLoc = selectedLocId === "ALL" || s.locationId === selectedLocId;
    return matchProf && matchLoc;
  });

  const handleShareFreeSlots = () => {
    const available = filteredSlots.filter((s) => s.isAvailable);
    if (available.length === 0) return;

    let text = `🗓️ *HORARIOS DISPONIBLES EN OMNIFLOW*\n`;
    text += `Para: ${customer?.name || "Estimado cliente"}\n\n`;

    // Group by date
    const byDate: Record<string, AvailableSlot[]> = {};
    available.forEach((s) => {
      if (!byDate[s.date]) byDate[s.date] = [];
      byDate[s.date].push(s);
    });

    Object.entries(byDate).forEach(([date, slts]) => {
      const dateStr = new Date(date + "T00:00:00").toLocaleDateString("es-PY", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      text += `📅 *${dateStr}*:\n`;
      slts.forEach((s) => {
        const prof = professionals.find((p) => p.id === s.professionalId)?.name || "Especialista";
        text += `  • ${s.startTime} a ${s.endTime} (${prof})\n`;
      });
      text += "\n";
    });

    text += `_¿Cuál de estos horarios te queda mejor para confirmar tu reserva?_`;
    onPasteSlotsToChat(text);
  };

  const handleConfirmBooking = () => {
    if (!bookingSlot) return;
    onBookAppointment(bookingSlot, serviceName);
    setBookingSlot(null);
  };

  return (
    <div className="flex flex-col gap-3 text-xs">
      {/* Top share bar */}
      <div className="p-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl shadow-xs flex items-center justify-between">
        <div>
          <h4 className="font-bold leading-tight">Agenda & Disponibilidad</h4>
          <p className="text-[11px] text-emerald-100 mt-0.5">Sincronización en tiempo real con OmniBookings</p>
        </div>
        <button
          type="button"
          onClick={handleShareFreeSlots}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-800 rounded-lg font-semibold text-xs shadow-xs hover:bg-emerald-50 transition-colors"
          title="Genera y pega en el chat la lista de franjas horarias disponibles"
        >
          <Share2 className="w-3.5 h-3.5" />
          Compartir horarios
        </button>
      </div>

      {/* Resource & Location filters */}
      <ResourceSelector
        professionals={professionals}
        locations={locations}
        selectedProfessionalId={selectedProfId}
        selectedLocationId={selectedLocId}
        onSelectProfessional={setSelectedProfId}
        onSelectLocation={setSelectedLocId}
      />

      {/* Active appointments for this customer if any */}
      {activeAppointments.length > 0 && (
        <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex flex-col gap-2">
          <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Citas Programadas de este Contacto ({activeAppointments.length})
          </h5>
          <div className="flex flex-col gap-1.5">
            {activeAppointments.map((app) => (
              <div key={app.id} className="p-2 bg-emerald-50/50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block text-[11px]">{app.serviceTitle}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {app.date} • {app.startTime} a {app.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(app.serviceTitle)}&dates=${app.date.replace(/-/g, "")}T${app.startTime.replace(/:/g, "")}00Z/${app.date.replace(/-/g, "")}T${app.endTime.replace(/:/g, "")}00Z`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-emerald-700 hover:underline flex items-center gap-0.5"
                    title="Añadir a Google Calendar"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Cal
                  </a>
                  <button
                    type="button"
                    onClick={() => onCancelAppointment(app.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                    title="Cancelar turno"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Slots Grid */}
      <div className="flex flex-col gap-1.5">
        <span className="font-bold text-slate-800 text-xs px-1">Franjas de Disponibilidad</span>
        <SlotPicker
          slots={filteredSlots}
          professionals={professionals}
          locations={locations}
          onBookSlot={(slot) => setBookingSlot(slot)}
        />
      </div>

      {/* Quick Booking Modal */}
      {bookingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-4 border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-2">Confirmar Reserva de Cita</h4>
            <div className="p-2.5 bg-slate-50 rounded-lg text-xs flex flex-col gap-1 mb-3">
              <p><strong>Fecha:</strong> {bookingSlot.date}</p>
              <p><strong>Horario:</strong> {bookingSlot.startTime} - {bookingSlot.endTime} hs</p>
              <p><strong>Cliente:</strong> {customer?.name || "Sin registrar"}</p>
            </div>

            <div className="mb-3">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Servicio / Tratamiento:</label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBookingSlot(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs"
              >
                Reservar y Notificar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
