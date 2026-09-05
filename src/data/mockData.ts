import { CustomerProfile } from "../types/customer";
import { ProductItem } from "../types/catalog";
import { ProfessionalResource, PhysicalLocation, AvailableSlot, Appointment } from "../types/appointment";
import { LoyaltyAccount } from "../types/loyalty";
import { ActiveGiveaway, BioLinkSnippet } from "../types/marketing";
import { CannedResponse } from "../types/automation";

export interface MockChatConversation {
  id: string;
  jid: string;
  phone: string;
  name: string;
  avatar: string;
  isGroup: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  messages: Array<{
    id: string;
    sender: "client" | "operator" | "bot";
    text: string;
    time: string;
    status?: "sent" | "delivered" | "read";
  }>;
}

export const INITIAL_CONVERSATIONS: MockChatConversation[] = [
  {
    id: "chat_1",
    jid: "595981442211@c.us",
    phone: "+595981442211",
    name: "Lic. Andrea González",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    isGroup: false,
    unreadCount: 2,
    lastMessage: "¿Tienen disponible el combo de dermoestética y me podrían enviar el presupuesto?",
    lastMessageTime: "10:42",
    messages: [
      { id: "m1", sender: "client", text: "Buenos días, tengo una consulta sobre sus servicios y productos de cabina.", time: "10:30" },
      { id: "m2", sender: "bot", text: "¡Hola Andrea! Un gusto saludarte. Con gusto te asisto. ¿Qué tratamiento o producto estás buscando hoy?", time: "10:31" },
      { id: "m3", sender: "client", text: "Quisiera consultar si tienen stock del Sérum Ácido Hialurónico Pro y si me pueden armar un presupuesto para 3 unidades.", time: "10:41" },
      { id: "m4", sender: "client", text: "¿Tienen disponible el combo de dermoestética y me podrían enviar el presupuesto?", time: "10:42" },
    ],
  },
  {
    id: "chat_2",
    jid: "595971998822@c.us",
    phone: "+595971998822",
    name: "Dr. Rodrigo Alarcón",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isGroup: false,
    unreadCount: 1,
    lastMessage: "Hola, necesito agendar una sesión en el consultorio 3 para este jueves por la tarde.",
    lastMessageTime: "09:15",
    messages: [
      { id: "m20", sender: "client", text: "Hola, necesito agendar una sesión en el consultorio 3 para este jueves por la tarde.", time: "09:15" },
    ],
  },
  {
    id: "chat_3",
    jid: "595983556677@c.us",
    phone: "+595983556677",
    name: "Mariana Torres (Prospecto Web)",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    isGroup: false,
    unreadCount: 0,
    lastMessage: "¿Cuál es el precio del tratamiento corporal completo?",
    lastMessageTime: "Ayer",
    messages: [
      { id: "m30", sender: "client", text: "Hola, vi su publicidad en Instagram. ¿Cuál es el precio del tratamiento corporal completo?", time: "Ayer 18:20" },
      { id: "m31", sender: "bot", text: "¡Hola Mariana! Gracias por contactar a OmniFlow Esthetic. Nuestro tratamiento corporal completo incluye 4 sesiones y drenaje.", time: "Ayer 18:21" },
    ],
  },
  {
    id: "chat_4",
    jid: "120363198821034@g.us",
    phone: "",
    name: "Comité Clínico & Compras (Grupo)",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80",
    isGroup: true,
    unreadCount: 0,
    lastMessage: "Recordatorio: reunión de reposición de insumos a las 16hs.",
    lastMessageTime: "08:00",
    messages: [
      { id: "m40", sender: "client", text: "Recordatorio: reunión de reposición de insumos a las 16hs.", time: "08:00" },
    ],
  },
];

export const INITIAL_CUSTOMERS: Record<string, CustomerProfile> = {
  "+595981442211": {
    id: "cust_001",
    phone: "+595981442211",
    name: "Lic. Andrea González",
    email: "andrea.gonzalez@estetica-avanzada.py",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    tags: ["Cliente Frecuente", "Lista VIP", "Crédito Habilitado"],
    fiscal: {
      taxId: "4829103-5",
      legalName: "Andrea González Sanabria",
      fiscalAddress: "Avda. Santa Teresa 2450, Asunción",
      electronicBillingEmail: "facturacion@andrea-gonzalez.com",
    },
    financial: {
      debtBalance: 1450000,
      creditLimit: 5000000,
      unpaidInvoicesCount: 1,
      lastPaymentDate: "2026-08-20",
      paymentStatus: "MORA_LEVE",
    },
    priceList: "LISTA_VIP",
    totalOrdersCount: 14,
    createdAt: "2025-03-12",
    isRegistered: true,
    notes: [
      {
        id: "note_1",
        author: "Carlos B. (Operador)",
        content: "Prefiere entregas los días martes por la mañana. Siempre pide comprobante con RUC.",
        createdAt: "2026-07-15",
        isPinned: true,
      },
      {
        id: "note_2",
        author: "OmniBot AutoCRM",
        content: "El cliente completó encuesta de satisfacción con puntaje 5/5.",
        createdAt: "2026-08-01",
      },
    ],
  },
  "+595971998822": {
    id: "cust_002",
    phone: "+595971998822",
    name: "Dr. Rodrigo Alarcón",
    email: "dr.alarcon@medicinaintegral.py",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    tags: ["Médico Cirujano", "Convenio Corporativo"],
    fiscal: {
      taxId: "3319082-1",
      legalName: "Rodrigo Alarcón y Asociados S.A.",
      fiscalAddress: "Avda. Mariscal López 1200, Asunción",
      electronicBillingEmail: "admon@alarcon-med.py",
    },
    financial: {
      debtBalance: 0,
      creditLimit: 12000000,
      unpaidInvoicesCount: 0,
      lastPaymentDate: "2026-09-01",
      paymentStatus: "AL_DIA",
    },
    priceList: "DISTRIBUIDOR",
    totalOrdersCount: 28,
    createdAt: "2024-11-05",
    isRegistered: true,
    notes: [
      {
        id: "n20",
        author: "Marta R.",
        content: "Cliente clave. Dar prioridad siempre en reservas de Consultorio 3 y Quirófano Ambulatorio.",
        createdAt: "2026-06-10",
        isPinned: true,
      },
    ],
  },
};

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "prod_01",
    title: "Sérum Ácido Hialurónico Pro 50ml",
    sku: "COS-HYAL-50",
    category: "Cosmecéutica",
    description: "Concentrado de ácido hialurónico reticulado de triple peso molecular para hidratación profunda.",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&auto=format&fit=crop&q=80",
    stockTotal: 42,
    unit: "Unidad",
    priceRetail: 280000,
    priceWholesale: 220000,
    priceVip: 195000,
  },
  {
    id: "prod_02",
    title: "Kit Dermoestética Facial Intensiva",
    sku: "KIT-DERMO-01",
    category: "Equipamiento & Kits",
    description: "Combo completo: Limpiador enzimático, peeling ultrasónico, máscara LED y sellador colágeno.",
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&auto=format&fit=crop&q=80",
    stockTotal: 18,
    unit: "Kit",
    priceRetail: 850000,
    priceWholesale: 710000,
    priceVip: 650000,
  },
  {
    id: "prod_03",
    title: "Crema Reparadora Ceramidas & Cica 100g",
    sku: "COS-CICA-100",
    category: "Cosmecéutica",
    description: "Tratamiento post-peeling regenerativo con centella asiática purificada y ceramidas tipo III.",
    imageUrl: "https://images.unsplash.com/photo-1608248597359-598687a4128f?w=200&auto=format&fit=crop&q=80",
    stockTotal: 65,
    unit: "Frasco",
    priceRetail: 190000,
    priceWholesale: 150000,
    priceVip: 135000,
  },
  {
    id: "prod_04",
    title: "Puntas de Diamante Microdermoabrasión (Set x 9)",
    sku: "INS-PUNTAS-09",
    category: "Insumos Médicos",
    description: "Juego de puntas estériles en acero quirúrgico con granulometría graduada D75 a D200.",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80",
    stockTotal: 25,
    unit: "Set",
    priceRetail: 340000,
    priceWholesale: 275000,
    priceVip: 245000,
  },
];

export const INITIAL_PROFESSIONALS: ProfessionalResource[] = [
  {
    id: "prof_1",
    name: "Dra. Sofía Mendoza",
    role: "Especialista en Dermatología",
    specialty: "Dermoestética & Láser",
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    defaultLocation: "CONSULTORIO",
  },
  {
    id: "prof_2",
    name: "Lic. Javier Coronel",
    role: "Fisioterapeuta & Cosmiatra",
    specialty: "Masoterapia & Sauna Terapéutico",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    defaultLocation: "SAUNA",
  },
  {
    id: "prof_3",
    name: "Tec. Valeria Ramos",
    role: "Técnica Esteticista Senior",
    specialty: "Aparatología & Cabinas",
    avatarUrl: "https://images.unsplash.com/photo-1594824813576-a4ffbb13396c?w=150&auto=format&fit=crop&q=80",
    defaultLocation: "CABINA_ESTETICA",
  },
];

export const INITIAL_LOCATIONS: PhysicalLocation[] = [
  { id: "loc_1", name: "Consultorio Médico 3", type: "CONSULTORIO", address: "Planta Alta - Suite Médica", capacity: 1 },
  { id: "loc_2", name: "Cabina Estética Deluxe", type: "CABINA_ESTETICA", address: "Planta Baja - Módulo B", capacity: 1 },
  { id: "loc_3", name: "Sauna & Circuito Húmedo", type: "SAUNA", address: "Área Spa & Recuperación", capacity: 4 },
];

export const INITIAL_SLOTS: AvailableSlot[] = [
  { id: "sl_1", date: "2026-09-10", startTime: "14:00", endTime: "15:00", professionalId: "prof_1", locationId: "loc_1", isAvailable: true },
  { id: "sl_2", date: "2026-09-10", startTime: "15:30", endTime: "16:30", professionalId: "prof_1", locationId: "loc_1", isAvailable: true },
  { id: "sl_3", date: "2026-09-10", startTime: "17:00", endTime: "18:00", professionalId: "prof_1", locationId: "loc_1", isAvailable: false },
  { id: "sl_4", date: "2026-09-11", startTime: "10:00", endTime: "11:00", professionalId: "prof_2", locationId: "loc_3", isAvailable: true },
  { id: "sl_5", date: "2026-09-11", startTime: "11:30", endTime: "12:30", professionalId: "prof_2", locationId: "loc_3", isAvailable: true },
  { id: "sl_6", date: "2026-09-12", startTime: "09:00", endTime: "10:00", professionalId: "prof_3", locationId: "loc_2", isAvailable: true },
  { id: "sl_7", date: "2026-09-12", startTime: "11:00", endTime: "12:00", professionalId: "prof_3", locationId: "loc_2", isAvailable: true },
];

export const INITIAL_LOYALTY: Record<string, LoyaltyAccount> = {
  "+595981442211": {
    customerPhone: "+595981442211",
    currentPoints: 2450,
    lifetimePoints: 8900,
    tier: "GOLD",
    expiringPoints: 350,
    expirationDate: "2026-10-31",
    history: [
      { id: "lh1", type: "EARNED", points: 450, description: "Compra #OF-8921", date: "2026-08-20" },
      { id: "lh2", type: "REDEEMED", points: -500, description: "Cupón Descuento 50.000 Gs", date: "2026-07-10" },
      { id: "lh3", type: "MANUAL_ADJUSTMENT", points: 200, description: "Cortesía Aniversario Cliente", date: "2026-06-01" },
    ],
  },
};

export const INITIAL_GIVEAWAYS: ActiveGiveaway[] = [
  {
    id: "gw_01",
    title: "Gran Sorteo Primavera Glow 2026",
    prizeDescription: "1 Sesión de Peeling Diamante + Kit Completo Sérum & Mascarilla",
    endDate: "2026-09-30",
    termsSummary: "Válido para compras superiores a 300.000 Gs. Sorteo vía Instagram Live.",
    couponPrefix: "SPRING26",
    totalParticipants: 412,
  },
  {
    id: "gw_02",
    title: "Pase Spa & Sauna Relax VIP",
    prizeDescription: "2 Horas de circuito húmedo y masaje descontracturante para 2 personas.",
    endDate: "2026-10-15",
    termsSummary: "Exclusivo para clientes registrados en el programa Loyalty Hub.",
    couponPrefix: "SPAVIP",
    totalParticipants: 189,
  },
];

export const INITIAL_BIOLINKS: BioLinkSnippet[] = [
  { id: "b1", title: "Catálogo Digital Interactivo", category: "CATALOGO_WEB", url: "https://catalogo.omniflow.cloud/esthetic", displayText: "Explora nuestro catálogo con stock actualizado y precios mayoristas" },
  { id: "b2", title: "Ubicación GPS Casa Matriz", category: "UBICACION", url: "https://maps.google.com/?q=-25.2965,-57.5684", displayText: "Avda. Santa Teresa c/ Herminio Maldonado, Asunción" },
  { id: "b3", title: "Cuentas Bancarias para Transferencias", category: "DATOS_PAGO", url: "https://omniflow.cloud/pagos", displayText: "Banco Continental | Cta Cte: 01-234567-8 | RUC: 80012345-0" },
  { id: "b4", title: "Instagram Oficial", category: "REDES", url: "https://instagram.com/omniflow_saas", displayText: "@omniflow_saas" },
];

export const INITIAL_CANNED_RESPONSES: CannedResponse[] = [
  {
    id: "cr_1",
    shortcut: "/precios",
    title: "Lista de Precios y Condiciones",
    category: "VENTAS",
    contentTemplate: "Estimado/a {cliente.nombre}, te compartimos nuestras tarifas actuales. Recuerda que para tu nivel ({cliente.lista_precio}) cuentas con un descuento especial sobre el precio de lista. ¿Deseas que te formulemos una cotización detallada?",
    variables: ["{cliente.nombre}", "{cliente.lista_precio}"],
  },
  {
    id: "cr_2",
    shortcut: "/datos-banco",
    title: "Cuentas Bancarias para Pago",
    category: "COBRANZAS",
    contentTemplate: "Hola {cliente.nombre}. Para regularizar tu saldo ({saldo_pendiente}), puedes transferir a:\n• Banco Continental: Cta Cte Gs 01-987654-3\n• Razón Social: OmniFlow Latam S.A.\n• RUC: 80098765-4\nPor favor envíanos el comprobante por este medio. ¡Muchas gracias!",
    variables: ["{cliente.nombre}", "{saldo_pendiente}"],
  },
  {
    id: "cr_3",
    shortcut: "/horarios",
    title: "Horarios de Atención y Guardias",
    category: "GENERAL",
    contentTemplate: "Nuestro horario de atención en sede central es de Lunes a Viernes de 08:00 a 19:00 hs y Sábados de 08:30 a 13:00 hs. Las citas con especialistas requieren reserva previa de 24 hs.",
    variables: [],
  },
  {
    id: "cr_4",
    shortcut: "/cita-confirmada",
    title: "Confirmación de Turno Agendado",
    category: "LOGISTICA",
    contentTemplate: "¡Turno Confirmado! {cliente.nombre}, te esperamos el día {proxima_cita}. Te sugerimos llegar con 10 minutos de antelación. Si necesitas reprogramar, por favor avísanos con al menos 3 horas de anticipación.",
    variables: ["{cliente.nombre}", "{proxima_cita}"],
  },
];
