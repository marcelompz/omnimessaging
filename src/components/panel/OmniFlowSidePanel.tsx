import React, { useState } from "react";
import { OmniBotMode, CopilotSuggestion } from "../../types/omnibot";
import { CustomerProfile as ICustomerProfile } from "../../types/customer";
import { ProductItem as IProductItem, OrderCartItem } from "../../types/catalog";
import { AvailableSlot, ProfessionalResource, PhysicalLocation, Appointment } from "../../types/appointment";
import { LoyaltyAccount } from "../../types/loyalty";
import { ActiveGiveaway, BioLinkSnippet } from "../../types/marketing";
import { CannedResponse } from "../../types/automation";

import { OmniBotStatusBadge } from "../omnibot/OmniBotStatusBadge";
import { OmniBotCopilotBar } from "../omnibot/OmniBotCopilotBar";
import { HumanTakeoverBanner } from "../omnibot/HumanTakeoverBanner";
import { BotConfigQuickPanel } from "../omnibot/BotConfigQuickPanel";
import { CustomerProfile } from "../customer/CustomerProfile";
import { CatalogPOS } from "../catalog/CatalogPOS";
import { AppointmentScheduler } from "../appointments/AppointmentScheduler";
import { LoyaltyCard } from "../loyalty/LoyaltyCard";
import { GiveawayRegistrar } from "../marketing/GiveawayRegistrar";
import { QuickLinksBio } from "../marketing/QuickLinksBio";
import { CannedResponsesList } from "../automation/CannedResponsesList";
import { OutOfOfficeBanner } from "../automation/OutOfOfficeBanner";

import {
  Bot,
  User,
  ShoppingBag,
  Calendar,
  Award,
  Sparkles,
  Zap,
  ChevronRight,
  ChevronLeft,
  Settings,
  Shield,
  Layers,
  Users,
  Globe,
} from "lucide-react";
import { BrowserEngine } from "../../services/crossBrowser";

export type PanelTab = "copilot" | "customer" | "catalog" | "agenda" | "loyalty" | "marketing" | "shortcuts";

interface OmniFlowSidePanelProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  onOpenSettings: () => void;
  onOpenCrossBrowser?: () => void;
  targetEngine?: BrowserEngine;
  // Chat context
  activeChatTitle: string;
  activeChatPhone: string;
  isGroup: boolean;
  // OmniBot state
  botMode: OmniBotMode;
  onChangeBotMode: (mode: OmniBotMode) => void;
  isAiThinking: boolean;
  copilotSuggestion: CopilotSuggestion | null;
  onPasteToEditor: (text: string) => void;
  onSendDirectly: (text: string) => void;
  onDiscardSuggestion: () => void;
  onRefreshCopilot: () => void;
  autoTakeover: boolean;
  onToggleAutoTakeover: (enabled: boolean) => void;
  systemPrompt: string;
  onUpdateSystemPrompt: (prompt: string) => void;
  // Customer
  customer: ICustomerProfile | null;
  onOpenQuickRegister: () => void;
  onAddNote: (note: string) => void;
  // Catalog & POS
  products: IProductItem[];
  cart: OrderCartItem[];
  onAddToCart: (p: IProductItem) => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onPasteQuoteToChat: (text: string) => void;
  onEmitPosOrder: (total: number) => void;
  pointsDiscount: number;
  // Agenda
  slots: AvailableSlot[];
  professionals: ProfessionalResource[];
  locations: PhysicalLocation[];
  activeAppointments: Appointment[];
  onBookAppointment: (slot: AvailableSlot, serviceName: string) => void;
  onCancelAppointment: (appId: string) => void;
  onPasteSlotsToChat: (text: string) => void;
  // Loyalty
  loyalty: LoyaltyAccount | null;
  onApplyRewardDiscount: (discountAmount: number, pointsCost: number) => void;
  onCreditCourtesyPoints: (points: number, reason: string) => void;
  // Marketing & Bio
  giveaways: ActiveGiveaway[];
  biolinks: BioLinkSnippet[];
  onPasteCouponToChat: (text: string) => void;
  onPasteLinkToChat: (text: string) => void;
  // Shortcuts
  cannedResponses: CannedResponse[];
  onPasteResponse: (text: string) => void;
}

export const OmniFlowSidePanel: React.FC<OmniFlowSidePanelProps> = ({
  isOpen,
  onToggleOpen,
  onOpenSettings,
  onOpenCrossBrowser,
  targetEngine = "chrome",
  activeChatTitle,
  activeChatPhone,
  isGroup,
  botMode,
  onChangeBotMode,
  isAiThinking,
  copilotSuggestion,
  onPasteToEditor,
  onSendDirectly,
  onDiscardSuggestion,
  onRefreshCopilot,
  autoTakeover,
  onToggleAutoTakeover,
  systemPrompt,
  onUpdateSystemPrompt,
  customer,
  onOpenQuickRegister,
  onAddNote,
  products,
  cart,
  onAddToCart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onPasteQuoteToChat,
  onEmitPosOrder,
  pointsDiscount,
  slots,
  professionals,
  locations,
  activeAppointments,
  onBookAppointment,
  onCancelAppointment,
  onPasteSlotsToChat,
  loyalty,
  onApplyRewardDiscount,
  onCreditCourtesyPoints,
  giveaways,
  biolinks,
  onPasteCouponToChat,
  onPasteLinkToChat,
  cannedResponses,
  onPasteResponse,
}) => {
  const [activeTab, setActiveTab] = useState<PanelTab>("copilot");

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggleOpen}
        className="fixed right-0 top-20 z-40 bg-[#3B1C54] text-white p-2.5 rounded-l-2xl shadow-xl flex flex-col items-center gap-1.5 hover:bg-[#4A246B] transition-all cursor-pointer border-l border-y border-teal-500/40"
        title="Abrir Consola OmniFlow"
      >
        <img src="/assets/orderflow-icon.svg" alt="OmniFlow" className="w-4 h-4 object-contain" />
        <span className="text-[10px] font-bold uppercase [writing-mode:vertical-lr] tracking-widest text-teal-300">
          OmniFlow
        </span>
        <ChevronLeft className="w-4 h-4 text-purple-200 mt-1" />
      </button>
    );
  }

  const tabs: Array<{ id: PanelTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: "copilot", label: "OmniBot", icon: <Bot className="w-3.5 h-3.5" /> },
    { id: "customer", label: "Ficha 360°", icon: <User className="w-3.5 h-3.5" /> },
    { id: "catalog", label: "Catálogo y venta", icon: <ShoppingBag className="w-3.5 h-3.5" />, badge: cart.length > 0 ? cart.length : undefined },
    { id: "agenda", label: "Agenda", icon: <Calendar className="w-3.5 h-3.5" />, badge: activeAppointments.length > 0 ? activeAppointments.length : undefined },
    { id: "loyalty", label: "Fidelización", icon: <Award className="w-3.5 h-3.5" /> },
    { id: "marketing", label: "Mercadotecnia", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "shortcuts", label: "Atajos", icon: <Zap className="w-3.5 h-3.5" /> },
  ];

  return (
    <aside
      id="omniflow-sidepanel-root"
      className="w-full shrink-0 bg-slate-100 border-l border-slate-300 h-full flex flex-col shadow-2xl z-30 transition-all duration-200 ease-in-out relative select-none"
    >
      {/* Top extension bar with branding & connection */}
      <div className="p-2.5 bg-[#3B1C54] text-white flex items-center justify-between border-b border-purple-900/60 shadow-xs">
        <div className="flex items-center gap-2">
          <img
            src="/assets/orderflow-icon.svg"
            alt="OmniFlow"
            className="w-7 h-7 object-contain drop-shadow-xs"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs tracking-tight">OmniFlow</span>
              <span className="text-[9px] bg-teal-400/20 text-teal-300 px-1.5 py-0.2 rounded font-mono font-semibold">
                {targetEngine.toUpperCase()} MV3
              </span>
            </div>
            <p className="text-[9.5px] text-purple-200 leading-tight">Omnicanalidad de Alta Velocidad</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenCrossBrowser && (
            <button
              type="button"
              onClick={onOpenCrossBrowser}
              className="p-1.5 text-purple-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Centro Cross-Browser (Chrome, Firefox, Edge, Safari, Brave)"
            >
              <Globe className="w-4 h-4 text-teal-300" />
            </button>
          )}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 text-purple-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Configuración de la Extensión (Multi-Tenant & JWT)"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onToggleOpen}
            className="p-1.5 text-purple-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Minimizar panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Chat Target E.164 Banner */}
      <div className="px-3 py-2 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="min-w-0 pr-2">
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
            {isGroup ? "Chat Grupal Detectado" : "Contacto E.164 Activo"}
          </span>
          <span className="font-bold text-slate-900 truncate block text-[11px]">
            {activeChatTitle || "Sin chat seleccionado"}
          </span>
        </div>
        {activeChatPhone ? (
          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md shrink-0 border border-slate-200 font-semibold">
            {activeChatPhone}
          </span>
        ) : (
          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0 font-medium">
            Grupo @g.us
          </span>
        )}
      </div>

      {/* Group Mode Guard Notice if in group */}
      {isGroup && (
        <div className="p-2.5 bg-amber-50 border-b border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Funciones exclusivas de 1-a-1 pausadas en grupos. Puedes usar respuestas rápidas y catálogos generales.
          </span>
        </div>
      )}

      {/* Tab bar */}
      <div className="bg-white border-b border-slate-200 px-2 py-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all relative ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold font-mono ${
                activeTab === tab.id ? "bg-emerald-500 text-slate-950" : "bg-emerald-600 text-white"
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Panel Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Tab 1: OmniBot Controller & Copilot */}
        {activeTab === "copilot" && (
          <div className="flex flex-col gap-3">
            {/* Tri-State Badge */}
            <OmniBotStatusBadge
              mode={botMode}
              onChangeMode={onChangeBotMode}
              isAiThinking={isAiThinking}
            />

            {/* Human takeover banner if active */}
            {botMode === "HUMAN_TAKEOVER" && (
              <HumanTakeoverBanner
                onReleaseControl={() => onChangeBotMode("ACTIVE")}
              />
            )}

            {/* Ghost Bot Copilot Bar */}
            <OmniBotCopilotBar
              suggestion={copilotSuggestion}
              isLoading={isAiThinking}
              onPasteToEditor={onPasteToEditor}
              onSendDirectly={onSendDirectly}
              onDiscard={onDiscardSuggestion}
              onRefresh={onRefreshCopilot}
            />

            {/* Quick Bot config panel */}
            <BotConfigQuickPanel
              autoTakeover={autoTakeover}
              onToggleAutoTakeover={onToggleAutoTakeover}
              systemPrompt={systemPrompt}
              onUpdateSystemPrompt={onUpdateSystemPrompt}
            />

            {/* Out of office schedule status */}
            <OutOfOfficeBanner />
          </div>
        )}

        {/* Tab 2: Ficha 360° del Cliente */}
        {activeTab === "customer" && (
          <CustomerProfile
            customer={customer}
            phone={activeChatPhone}
            onOpenQuickRegister={onOpenQuickRegister}
            onAddNote={onAddNote}
            onPasteDebtToChat={onPasteToEditor}
          />
        )}

        {/* Tab 3: Catálogo & POS Express */}
        {activeTab === "catalog" && (
          <CatalogPOS
            products={products}
            customer={customer}
            cart={cart}
            onAddToCart={onAddToCart}
            onUpdateQty={onUpdateQty}
            onRemoveItem={onRemoveItem}
            onClearCart={onClearCart}
            onPasteQuoteToChat={onPasteQuoteToChat}
            onEmitPosOrder={onEmitPosOrder}
            pointsDiscount={pointsDiscount}
          />
        )}

        {/* Tab 4: Agenda & Turnos */}
        {activeTab === "agenda" && (
          <AppointmentScheduler
            slots={slots}
            professionals={professionals}
            locations={locations}
            customer={customer}
            onBookAppointment={onBookAppointment}
            onCancelAppointment={onCancelAppointment}
            onPasteSlotsToChat={onPasteSlotsToChat}
            activeAppointments={activeAppointments}
          />
        )}

        {/* Tab 5: Loyalty Hub */}
        {activeTab === "loyalty" && (
          <LoyaltyCard
            loyalty={loyalty}
            customerName={customer?.name || "Cliente"}
            onApplyRewardDiscount={onApplyRewardDiscount}
            onCreditCourtesyPoints={onCreditCourtesyPoints}
          />
        )}

        {/* Tab 6: Marketing & Sorteos */}
        {activeTab === "marketing" && (
          <div className="flex flex-col gap-4">
            <GiveawayRegistrar
              giveaways={giveaways}
              customerPhone={activeChatPhone}
              customerName={customer?.name || "Cliente"}
              onPasteCouponToChat={onPasteCouponToChat}
            />
            <QuickLinksBio
              links={biolinks}
              onPasteLinkToChat={onPasteLinkToChat}
            />
          </div>
        )}

        {/* Tab 7: Respuestas Rápidas / Atajos */}
        {activeTab === "shortcuts" && (
          <CannedResponsesList
            responses={cannedResponses}
            customer={customer}
            onPasteResponse={onPasteResponse}
          />
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="p-2 bg-slate-200/80 border-t border-slate-300 text-[10px] text-slate-500 flex items-center justify-between shrink-0">
        <span className="flex items-center gap-1 font-mono">
          <Shield className="w-3 h-3 text-emerald-600" />
          HUMAN_TAKEOVER Protegido
        </span>
        <span className="font-mono text-slate-400">ShadowDOM Encapsulado</span>
      </div>
    </aside>
  );
};
