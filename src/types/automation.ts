export interface CannedResponse {
  id: string;
  shortcut: string; // e.g. /precios, /horarios, /banco, /saludo
  title: string;
  category: "VENTAS" | "SOPORTE" | "LOGISTICA" | "COBRANZAS" | "GENERAL";
  contentTemplate: string; // Supports variables like {cliente.nombre}, {saldo_pendiente}, etc.
  variables: string[];
}

export interface AutoResponseSettings {
  welcomeMessageEnabled: boolean;
  welcomeTemplate: string;
  outOfOfficeEnabled: boolean;
  outOfOfficeTemplate: string;
  schedule: {
    startHour: number; // e.g. 8
    endHour: number; // e.g. 18
    workDays: number[]; // 1-5 (Mon-Fri)
  };
}
