export type ResourceLocationType = "CONSULTORIO" | "SAUNA" | "CABINA_ESTETICA" | "SALA_REUNIONES" | "ONLINE";

export interface ProfessionalResource {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  specialty: string;
  defaultLocation: ResourceLocationType;
}

export interface PhysicalLocation {
  id: string;
  name: string;
  type: ResourceLocationType;
  address: string;
  capacity: number;
}

export interface AvailableSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  professionalId: string;
  locationId: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  customerPhone: string;
  customerName: string;
  professionalId: string;
  locationId: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceTitle: string;
  status: "CONFIRMED" | "TENTATIVE" | "CANCELLED" | "COMPLETED";
  meetLink?: string;
  calendarEventUrl?: string;
}
