import React, { useState, useEffect, useRef } from "react";
import {
  INITIAL_CONVERSATIONS,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_PROFESSIONALS,
  INITIAL_LOCATIONS,
  INITIAL_SLOTS,
  INITIAL_LOYALTY,
  INITIAL_GIVEAWAYS,
  INITIAL_BIOLINKS,
  INITIAL_CANNED_RESPONSES,
  MockChatConversation,
} from "./data/mockData";
import { OmniBotMode, CopilotSuggestion } from "./types/omnibot";
import { CustomerProfile as ICustomerProfile } from "./types/customer";
import { ProductItem as IProductItem, OrderCartItem } from "./types/catalog";
import { AvailableSlot, Appointment } from "./types/appointment";
import { LoyaltyAccount } from "./types/loyalty";
import { storageService, OmniFlowConfig } from "./services/storage";
import { omniBotService } from "./services/omniBotService";
import { whatsappDom } from "./services/whatsappDom";

import { OmniFlowSidePanel } from "./components/panel/OmniFlowSidePanel";
import { ExtensionPopupModal } from "./components/settings/ExtensionPopupModal";
import { QuickCustomerModal } from "./components/customer/QuickCustomerModal";
import { CrossBrowserExportModal } from "./components/crossbrowser/CrossBrowserExportModal";
import { BrowserEngine, detectBrowserEngine, BROWSER_PROFILES } from "./services/crossBrowser";

import {
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  Check,
  CheckCheck,
  Phone,
  Video,
  Settings,
  Bot,
  UserCheck,
  Sparkles,
  Users,
  Shield,
  Layers,
  ArrowRight,
  MessageSquarePlus,
  RefreshCw,
  Globe,
} from "lucide-react";

export default function App() {
  // Config & storage
  const [config, setConfig] = useState<OmniFlowConfig>(storageService.getConfig());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showQuickRegisterModal, setShowQuickRegisterModal] = useState(false);
  const [showCrossBrowserModal, setShowCrossBrowserModal] = useState(false);
  const [targetEngine, setTargetEngine] = useState<BrowserEngine>(detectBrowserEngine());
  const [sidePanelOpen, setSidePanelOpen] = useState(true);

  // Conversations & active chat
  const [conversations, setConversations] = useState<MockChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<string>("chat_1");
  const [chatSearch, setChatSearch] = useState("");

  // Customers registry
  const [customers, setCustomers] = useState<Record<string, ICustomerProfile>>(INITIAL_CUSTOMERS);

  // Bot states per chat
  const [botModes, setBotModes] = useState<Record<string, OmniBotMode>>({
    chat_1: "ACTIVE",
    chat_2: "HUMAN_TAKEOVER",
    chat_3: "ACTIVE",
    chat_4: "BOT_PAUSED",
  });
  const [systemPrompts, setSystemPrompts] = useState<Record<string, string>>({
    chat_1: "Priorizar combos de cabina estética y recordar amablemente la regularización de cuenta corriente.",
    chat_2: "Tratamiento VIP médico. Confirmar reserva de quirófano/consultorio de inmediato.",
  });
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [copilotSuggestions, setCopilotSuggestions] = useState<Record<string, CopilotSuggestion | null>>({});

  // Catalog & Cart
  const [products] = useState<IProductItem[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<OrderCartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 3, unitPrice: INITIAL_PRODUCTS[0].priceVip },
  ]);
  const [pointsDiscount, setPointsDiscount] = useState<number>(0);

  // Appointments
  const [slots, setSlots] = useState<AvailableSlot[]>(INITIAL_SLOTS);
  const [activeAppointments, setActiveAppointments] = useState<Appointment[]>([
    {
      id: "app_prev_1",
      customerPhone: "+595981442211",
      customerName: "Lic. Andrea González",
      professionalId: "prof_1",
      locationId: "loc_1",
      date: "2026-09-10",
      startTime: "14:00",
      endTime: "15:00",
      serviceTitle: "Tratamiento Dermoestético Pro",
      status: "CONFIRMED",
    },
  ]);

  // Loyalty
  const [loyaltyAccounts, setLoyaltyAccounts] = useState<Record<string, LoyaltyAccount>>(INITIAL_LOYALTY);

  // Message input state
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeChat = conversations.find((c) => c.id === activeChatId) || conversations[0];
  const activeCustomer = activeChat?.phone ? customers[activeChat.phone] || null : null;
  const currentBotMode = botModes[activeChat.id] || "ACTIVE";
  const currentCopilot = copilotSuggestions[activeChat.id] || null;

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  // Trigger Copilot analysis when active chat changes or receives new message
  useEffect(() => {
    if (!activeChat || activeChat.isGroup) return;

    const analyzeChat = async () => {
      setIsAiThinking(true);
      try {
        const suggestion = await omniBotService.requestCopilotAnalysis({
          contactName: activeChat.name,
          phone: activeChat.phone,
          messageHistory: activeChat.messages,
          customerData: activeCustomer,
          catalogContext: { productsCount: products.length },
          botMode: currentBotMode,
        });

        setCopilotSuggestions((prev) => ({
          ...prev,
          [activeChat.id]: suggestion,
        }));
      } catch (err) {
        console.error("Error analyzing with Copilot:", err);
      } finally {
        setIsAiThinking(false);
      }
    };

    analyzeChat();
  }, [activeChatId]);

  // Human Takeover trigger handler:
  // When operator types in the message editor, if autoTakeoverOnType is enabled,
  // automatically trigger HUMAN_TAKEOVER protocol.
  const handleOperatorTyping = (text: string) => {
    setMessageInput(text);
    if (config.autoTakeoverOnType && currentBotMode === "ACTIVE" && text.trim().length > 0) {
      setBotModes((prev) => ({
        ...prev,
        [activeChat.id]: "HUMAN_TAKEOVER",
      }));
    }
  };

  // Dispatch outgoing message
  const handleSendMessage = (textOverride?: string) => {
    const textToSend = (textOverride !== undefined ? textOverride : messageInput).trim();
    if (!textToSend || !activeChat) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: "operator" as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent" as const,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? {
              ...c,
              lastMessage: textToSend,
              lastMessageTime: newMsg.time,
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    if (textOverride === undefined) {
      setMessageInput("");
    }

    // Ensure HUMAN_TAKEOVER state is marked when operator sends
    if (currentBotMode === "ACTIVE") {
      setBotModes((prev) => ({ ...prev, [activeChat.id]: "HUMAN_TAKEOVER" }));
    }
  };

  // Paste text into message editor
  const handlePasteToEditor = (text: string) => {
    setMessageInput(text);
    if (config.autoTakeoverOnType && currentBotMode === "ACTIVE") {
      setBotModes((prev) => ({
        ...prev,
        [activeChat.id]: "HUMAN_TAKEOVER",
      }));
    }
    // Also dispatch to DOM if present
    whatsappDom.insertTextIntoInput(text);
  };

  // Send directly
  const handleSendDirectly = (text: string) => {
    handleSendMessage(text);
  };

  // Simulate customer sending a message
  const handleSimulateClientIncoming = () => {
    if (!activeChat) return;
    const incomingSamples = [
      "¿Tienen disponible para entrega hoy y cuáles son las formas de pago?",
      "Hola, me gustaría consultar si puedo pagar con transferencia de Banco Continental.",
      "Necesito confirmar si tienen horario disponible para este viernes por la tarde.",
      "Muchas gracias por la atención, quedo a la espera del comprobante.",
    ];
    const randomText = incomingSamples[Math.floor(Math.random() * incomingSamples.length)];
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const incomingMsg = {
      id: `client_msg_${Date.now()}`,
      sender: "client" as const,
      text: randomText,
      time,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? {
              ...c,
              unreadCount: 1,
              lastMessage: randomText,
              lastMessageTime: time,
              messages: [...c.messages, incomingMsg],
            }
          : c
      )
    );

    // If bot is active, simulate autonomous OmniBot reply after 1.8s
    if (currentBotMode === "ACTIVE") {
      setTimeout(() => {
        const botReply = {
          id: `bot_reply_${Date.now()}`,
          sender: "bot" as const,
          text: `¡Hola ${activeChat.name}! Con gusto te ayudamos. He verificado los datos en el sistema OmniFlow y podemos procesar tu solicitud de inmediato. ¿Deseas que coordinemos los detalles?`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "read" as const,
        };
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeChat.id
              ? {
                  ...c,
                  unreadCount: 0,
                  lastMessage: botReply.text,
                  lastMessageTime: botReply.time,
                  messages: [...c.messages, botReply],
                }
              : c
          )
        );
      }, 1800);
    }
  };

  // Cart operations
  const handleAddToCart = (product: IProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const unitPrice =
        activeCustomer?.priceList === "LISTA_VIP"
          ? product.priceVip
          : activeCustomer?.priceList === "LISTA_MAYORISTA" || activeCustomer?.priceList === "DISTRIBUIDOR"
          ? product.priceWholesale
          : product.priceRetail;

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, unitPrice }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderCartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setPointsDiscount(0);
  };

  const handleEmitPosOrder = (total: number) => {
    const orderId = `POS-${Math.floor(10000 + Math.random() * 90000)}`;
    const formatGs = (val: number) =>
      new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", maximumFractionDigits: 0 }).format(val);

    const ticketMsg = `🧾 *TICKET DE VENTA DIRECTA POS OMNIFLOW #${orderId}*\nCliente: ${activeCustomer?.name || activeChat.name}\nTotal Facturado: ${formatGs(total)}\nEstado: Aprobado / Comprobante emitido.\n¡Gracias por su preferencia!`;
    handleSendMessage(ticketMsg);
    handleClearCart();
  };

  // Appointment operations
  const handleBookAppointment = (slot: AvailableSlot, serviceName: string) => {
    const newApp: Appointment = {
      id: `app_${Date.now()}`,
      customerPhone: activeChat.phone,
      customerName: activeCustomer?.name || activeChat.name,
      professionalId: slot.professionalId,
      locationId: slot.locationId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      serviceTitle: serviceName,
      status: "CONFIRMED",
    };

    setActiveAppointments((prev) => [...prev, newApp]);
    setSlots((prev) =>
      prev.map((s) => (s.id === slot.id ? { ...s, isAvailable: false } : s))
    );

    const confirmMsg = `✅ *CITA CONFIRMADA EXITOSAMENTE*\nTratamiento: *${serviceName}*\nFecha: ${slot.date} a las ${slot.startTime} hs.\nTe esperamos en nuestra sede. ¡Muchas gracias!`;
    handleSendMessage(confirmMsg);
  };

  const handleCancelAppointment = (appId: string) => {
    setActiveAppointments((prev) => prev.filter((a) => a.id !== appId));
  };

  // Loyalty operations
  const handleApplyRewardDiscount = (discountAmount: number, pointsCost: number) => {
    if (!activeChat.phone) return;
    setPointsDiscount(discountAmount);
    setLoyaltyAccounts((prev) => {
      const acc = prev[activeChat.phone];
      if (!acc) return prev;
      return {
        ...prev,
        [activeChat.phone]: {
          ...acc,
          currentPoints: Math.max(0, acc.currentPoints - pointsCost),
          history: [
            {
              id: `lh_${Date.now()}`,
              type: "REDEEMED",
              points: -pointsCost,
              description: `Canje aplicado a presupuesto (${discountAmount} Gs)`,
              date: new Date().toISOString().slice(0, 10),
            },
            ...acc.history,
          ],
        },
      };
    });
  };

  const handleCreditCourtesyPoints = (points: number, reason: string) => {
    if (!activeChat.phone) return;
    setLoyaltyAccounts((prev) => {
      const acc = prev[activeChat.phone] || {
        customerPhone: activeChat.phone,
        currentPoints: 0,
        lifetimePoints: 0,
        tier: "BRONZE",
        expiringPoints: 0,
        expirationDate: "2026-12-31",
        history: [],
      };
      return {
        ...prev,
        [activeChat.phone]: {
          ...acc,
          currentPoints: acc.currentPoints + points,
          lifetimePoints: acc.lifetimePoints + points,
          history: [
            {
              id: `lh_${Date.now()}`,
              type: "MANUAL_ADJUSTMENT",
              points,
              description: reason,
              date: new Date().toISOString().slice(0, 10),
            },
            ...acc.history,
          ],
        },
      };
    });

    const msg = `🎁 *PUNTOS DE FIDELIDAD ACREDITADOS*\nEstimado/a ${activeCustomer?.name || activeChat.name}, te hemos acreditado *+${points} puntos* de cortesía en tu cuenta de OmniFlow Loyalty Hub. ¡Gracias por confiar en nosotros!`;
    handleSendMessage(msg);
  };

  // New customer quick save
  const handleSaveQuickCustomer = (newCustomer: ICustomerProfile) => {
    setCustomers((prev) => ({
      ...prev,
      [newCustomer.phone]: newCustomer,
    }));
  };

  // Filtered chats list
  const filteredConversations = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
      c.phone.includes(chatSearch) ||
      c.lastMessage.toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden font-sans select-none">
      {/* OrderFlow Top Global Application Bar */}
      <header className="h-12 bg-[#2D1441] text-white px-4 flex items-center justify-between border-b border-purple-900/60 shrink-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/orderflow-icon.svg"
              alt="OrderFlow"
              className="w-7 h-7 object-contain drop-shadow-xs"
            />
            <div>
              <div className="flex items-baseline gap-1 font-black italic tracking-tighter leading-none">
                <span className="text-white text-base font-extrabold">Order</span>
                <span className="text-[#00D2D3] text-base font-extrabold">Flow</span>
                <span className="ml-1 text-[8px] font-mono font-bold uppercase tracking-[2px] text-purple-200 not-italic hidden sm:inline">
                  HIGH-SPEED OMNI-SYSTEM
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 ml-4 text-xs text-purple-200">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>Tenant: <strong className="text-white font-mono">{config.tenantId}</strong></span>
            <span className="text-purple-300/40">|</span>
            <span>Operador: <strong className="text-white">{config.operatorName}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Target Browser Selector & Exporter Button */}
          <button
            type="button"
            onClick={() => setShowCrossBrowserModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3B1C54] hover:bg-[#4E246F] text-teal-300 rounded-lg text-xs font-semibold border border-purple-800/80 transition-all shadow-xs cursor-pointer"
            title="Abrir Centro Cross-Browser: Chrome, Firefox, Edge, Safari, Brave"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span>Target: <strong>{BROWSER_PROFILES[targetEngine].name.split(" ")[0]}</strong></span>
            <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-mono">
              MV3
            </span>
          </button>

          {/* Incoming message simulation button */}
          <button
            type="button"
            onClick={handleSimulateClientIncoming}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-100 rounded-lg text-xs font-semibold border border-purple-800/60 transition-colors shadow-xs"
            title="Simula que el cliente actual envía un nuevo mensaje en WhatsApp"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Simular Mensaje</span>
          </button>

          {/* Toggle side panel */}
          <button
            type="button"
            onClick={() => setSidePanelOpen(!sidePanelOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sidePanelOpen
                ? "bg-[#009DA0] hover:bg-[#00B4B7] text-white shadow-xs"
                : "bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{sidePanelOpen ? "Panel Activo" : "Abrir Panel"}</span>
          </button>

          {/* Extension settings */}
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 text-purple-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Configuración de la Extensión (Multi-Tenant & JWT)"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace: WhatsApp Web Shell + Injected OmniFlow Side Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Side: WhatsApp Web Chat List */}
        <section
          id="side"
          className="w-80 sm:w-96 bg-white border-r border-slate-300 flex flex-col shrink-0 h-full select-none"
        >
          {/* Header of WhatsApp left panel */}
          <div className="h-14 bg-slate-100 px-3 flex items-center justify-between border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Operador"
                className="w-9 h-9 rounded-full object-cover border border-slate-300"
              />
              <div>
                <span className="font-bold text-xs text-slate-800 block leading-tight">WhatsApp Web</span>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Conectado vía WebSocket
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                title="Ajustes de Extensión"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-2 bg-white border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                placeholder="Buscar o empezar un nuevo chat..."
                className="w-full bg-slate-100 pl-9 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-800"
              />
            </div>
          </div>

          {/* Chats list */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.map((chat) => {
              const isActive = chat.id === activeChat.id;
              const mode = botModes[chat.id] || "ACTIVE";

              return (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveChatId(chat.id);
                    // Clear unread
                    setConversations((prev) =>
                      prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c))
                    );
                  }}
                  className={`p-3 flex items-start gap-3 cursor-pointer transition-colors ${
                    isActive ? "bg-slate-100" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    {/* Bot status dot on avatar */}
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold ${
                        mode === "ACTIVE"
                          ? "bg-emerald-500 text-white"
                          : mode === "HUMAN_TAKEOVER"
                          ? "bg-amber-500 text-white"
                          : "bg-slate-400 text-white"
                      }`}
                      title={`Estado del bot: ${mode}`}
                    >
                      {mode === "ACTIVE" ? "B" : mode === "HUMAN_TAKEOVER" ? "H" : "P"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-semibold text-xs text-slate-900 truncate flex items-center gap-1">
                        {chat.name}
                        {chat.isGroup && <Users className="w-3 h-3 text-slate-400 shrink-0" />}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0">{chat.lastMessageTime}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate leading-tight">{chat.lastMessage}</p>

                    <div className="flex items-center justify-between mt-1">
                      {chat.phone ? (
                        <span className="text-[10px] text-slate-400 font-mono">{chat.phone}</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Grupo de difusión</span>
                      )}

                      {chat.unreadCount > 0 && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Center: Active WhatsApp Web Conversation Screen (#main) */}
        <main id="main" className="flex-1 flex flex-col bg-[#efeae2] h-full relative overflow-hidden">
          {/* WhatsApp Chat Header */}
          <header className="h-14 bg-slate-100 px-4 flex items-center justify-between border-b border-slate-200 shrink-0 shadow-2xs z-10">
            <div className="flex items-center gap-3">
              <img
                src={activeChat.avatar}
                alt={activeChat.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 leading-tight">
                  {activeChat.name}
                  {activeChat.isGroup && (
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded">
                      Grupo @g.us
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {activeChat.phone ? (
                    <span className="font-mono text-slate-600 font-medium">{activeChat.phone} • en línea</span>
                  ) : (
                    "Comité & Compras"
                  )}
                </p>
              </div>
            </div>

            {/* Header action icons + OmniFlow button */}
            <div className="flex items-center gap-2">
              {/* Bot status indicator in header */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 shadow-2xs text-[11px]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentBotMode === "ACTIVE"
                      ? "bg-emerald-500 animate-pulse"
                      : currentBotMode === "HUMAN_TAKEOVER"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                  }`}
                />
                <span className="font-semibold text-slate-700">
                  {currentBotMode === "ACTIVE"
                    ? "OmniBot Activo"
                    : currentBotMode === "HUMAN_TAKEOVER"
                    ? "Human Takeover"
                    : "Bot Pausado"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSidePanelOpen(!sidePanelOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                title="Alternar Consola OmniFlow"
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden md:inline">OmniFlow</span>
              </button>
            </div>
          </header>

          {/* Messages Panel with WhatsApp background pattern */}
          <div
            data-testid="conversation-panel-messages"
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 bg-repeat"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.04) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          >
            {/* Encryption notice */}
            <div className="self-center bg-amber-50/90 text-amber-900 border border-amber-200 text-[10px] px-3 py-1 rounded-lg text-center max-w-md shadow-2xs mb-2">
              🔒 Los mensajes están cifrados de extremo a extremo. Supervisado por OmniFlow SaaS Terminal con protocolo anti-colisión.
            </div>

            {activeChat.messages.map((msg) => {
              const isClient = msg.sender === "client";
              const isBot = msg.sender === "bot";
              const isOperator = msg.sender === "operator";

              return (
                <div
                  key={msg.id}
                  data-testid="msg-container"
                  className={`flex flex-col max-w-[80%] md:max-w-[70%] rounded-xl px-3 py-2 text-xs shadow-2xs relative ${
                    isClient
                      ? "self-start bg-white text-slate-900 rounded-tl-xs"
                      : isBot
                      ? "self-end bg-purple-50 text-purple-950 border border-purple-200 rounded-tr-xs"
                      : "self-end bg-[#d9fdd3] text-slate-900 rounded-tr-xs"
                  }`}
                >
                  {/* Sender badge if bot or operator */}
                  {isBot && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-700 uppercase tracking-wider mb-0.5">
                      <Bot className="w-3 h-3 text-purple-600" />
                      OmniBot AI (Respuesta Autónoma)
                    </span>
                  )}
                  {isOperator && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">
                      <UserCheck className="w-3 h-3 text-emerald-600" />
                      Operador ({config.operatorName.split(" ")[0]})
                    </span>
                  )}

                  <p className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</p>

                  <div className="self-end flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                    <span>{msg.time}</span>
                    {!isClient && (
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500 inline" />
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp Web Message Input Footer */}
          <footer className="bg-slate-100 px-3 py-2 flex items-end gap-2 border-t border-slate-200 shrink-0">
            <div className="flex items-center gap-1 text-slate-500 pb-1">
              <button type="button" className="p-1.5 hover:bg-slate-200 rounded-full transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button type="button" className="p-1.5 hover:bg-slate-200 rounded-full transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
            </div>

            {/* Input area supporting text & beforeinput */}
            <div className="flex-1 bg-white rounded-xl border border-slate-300 focus-within:border-emerald-600 shadow-2xs px-3 py-2 flex items-center min-h-[40px]">
              <textarea
                id="wa-main-editor"
                rows={1}
                value={messageInput}
                onChange={(e) => handleOperatorTyping(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Escribe un mensaje aquí... (al escribir se activa HUMAN_TAKEOVER)"
                className="w-full text-xs text-slate-800 resize-none focus:outline-none max-h-24 font-sans bg-transparent"
              />
            </div>

            {/* Send or Mic button */}
            {messageInput.trim().length > 0 ? (
              <button
                id="wa-send-btn"
                type="button"
                data-testid="send"
                onClick={() => handleSendMessage()}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors shadow-xs shrink-0 cursor-pointer"
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                className="p-2.5 text-slate-500 hover:bg-slate-200 rounded-full transition-colors shrink-0"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </footer>
        </main>

        {/* Right Side: The Injected OmniFlow Side Panel */}
        <OmniFlowSidePanel
          isOpen={sidePanelOpen}
          onToggleOpen={() => setSidePanelOpen(!sidePanelOpen)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenCrossBrowser={() => setShowCrossBrowserModal(true)}
          targetEngine={targetEngine}
          activeChatTitle={activeChat.name}
          activeChatPhone={activeChat.phone}
          isGroup={activeChat.isGroup}
          botMode={currentBotMode}
          onChangeBotMode={(mode) => {
            setBotModes((prev) => ({ ...prev, [activeChat.id]: mode }));
            omniBotService.updateBotState(activeChat.phone, mode, "Cambio manual desde consola de operador");
          }}
          isAiThinking={isAiThinking}
          copilotSuggestion={currentCopilot}
          onPasteToEditor={handlePasteToEditor}
          onSendDirectly={handleSendDirectly}
          onDiscardSuggestion={() => {
            setCopilotSuggestions((prev) => ({ ...prev, [activeChat.id]: null }));
          }}
          onRefreshCopilot={async () => {
            setIsAiThinking(true);
            try {
              const suggestion = await omniBotService.requestCopilotAnalysis({
                contactName: activeChat.name,
                phone: activeChat.phone,
                messageHistory: activeChat.messages,
                customerData: activeCustomer,
                catalogContext: { productsCount: products.length },
                botMode: currentBotMode,
              });
              setCopilotSuggestions((prev) => ({ ...prev, [activeChat.id]: suggestion }));
            } finally {
              setIsAiThinking(false);
            }
          }}
          autoTakeover={config.autoTakeoverOnType}
          onToggleAutoTakeover={(val) => {
            const updated = storageService.saveConfig({ autoTakeoverOnType: val });
            setConfig(updated);
          }}
          systemPrompt={systemPrompts[activeChat.id] || "Atender con amabilidad y precisión."}
          onUpdateSystemPrompt={(p) => {
            setSystemPrompts((prev) => ({ ...prev, [activeChat.id]: p }));
          }}
          customer={activeCustomer}
          onOpenQuickRegister={() => setShowQuickRegisterModal(true)}
          onAddNote={(noteContent) => {
            if (!activeChat.phone || !activeCustomer) return;
            setCustomers((prev) => ({
              ...prev,
              [activeChat.phone]: {
                ...activeCustomer,
                notes: [
                  {
                    id: `n_${Date.now()}`,
                    author: config.operatorName,
                    content: noteContent,
                    createdAt: new Date().toISOString().slice(0, 10),
                  },
                  ...activeCustomer.notes,
                ],
              },
            }));
          }}
          products={products}
          cart={cart}
          onAddToCart={handleAddToCart}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onPasteQuoteToChat={handlePasteToEditor}
          onEmitPosOrder={handleEmitPosOrder}
          pointsDiscount={pointsDiscount}
          slots={slots}
          professionals={INITIAL_PROFESSIONALS}
          locations={INITIAL_LOCATIONS}
          activeAppointments={activeAppointments.filter((a) => a.customerPhone === activeChat.phone)}
          onBookAppointment={handleBookAppointment}
          onCancelAppointment={handleCancelAppointment}
          onPasteSlotsToChat={handlePasteToEditor}
          loyalty={activeChat.phone ? loyaltyAccounts[activeChat.phone] || null : null}
          onApplyRewardDiscount={handleApplyRewardDiscount}
          onCreditCourtesyPoints={handleCreditCourtesyPoints}
          giveaways={INITIAL_GIVEAWAYS}
          biolinks={INITIAL_BIOLINKS}
          onPasteCouponToChat={handlePasteToEditor}
          onPasteLinkToChat={handlePasteToEditor}
          cannedResponses={INITIAL_CANNED_RESPONSES}
          onPasteResponse={handlePasteToEditor}
        />
      </div>

      {/* Settings Modal (Extension Popup View) */}
      <ExtensionPopupModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSaved={(newCfg) => setConfig(newCfg)}
      />

      {/* Quick Customer Registration Modal */}
      <QuickCustomerModal
        isOpen={showQuickRegisterModal}
        phone={activeChat.phone}
        defaultName={activeChat.name}
        onClose={() => setShowQuickRegisterModal(false)}
        onSaveCustomer={handleSaveQuickCustomer}
      />

      {/* Cross-Browser Multi-Target Export & Diagnostics Modal */}
      <CrossBrowserExportModal
        isOpen={showCrossBrowserModal}
        onClose={() => setShowCrossBrowserModal(false)}
        activeEngine={targetEngine}
        onSelectEngine={(engine) => setTargetEngine(engine)}
      />
    </div>
  );
}
