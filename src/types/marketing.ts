export interface ActiveGiveaway {
  id: string;
  title: string;
  prizeDescription: string;
  endDate: string;
  termsSummary: string;
  couponPrefix: string;
  totalParticipants: number;
}

export interface BioLinkSnippet {
  id: string;
  title: string;
  category: "REDES" | "UBICACION" | "CATALOGO_WEB" | "DATOS_PAGO" | "LEGAL";
  url: string;
  displayText: string;
}
