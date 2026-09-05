export interface CustomerFiscalData {
  taxId: string; // RUC / CI / DNI
  legalName: string; // Razón Social
  fiscalAddress?: string;
  electronicBillingEmail?: string;
}

export interface CustomerFinancialSummary {
  debtBalance: number; // Saldo deudor
  creditLimit: number; // Límite de crédito
  unpaidInvoicesCount: number;
  lastPaymentDate?: string;
  paymentStatus: "AL_DIA" | "MORA_LEVE" | "MORA_CRITICA" | "SIN_CREDITO";
}

export interface CustomerNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface CustomerProfile {
  id: string;
  phone: string; // E.164 (+595981...)
  name: string;
  avatarUrl?: string;
  email?: string;
  tags: string[];
  fiscal: CustomerFiscalData;
  financial: CustomerFinancialSummary;
  priceList: "LISTA_GENERAL" | "LISTA_MAYORISTA" | "LISTA_VIP" | "DISTRIBUIDOR";
  notes: CustomerNote[];
  totalOrdersCount: number;
  createdAt: string;
  isRegistered: boolean;
}
