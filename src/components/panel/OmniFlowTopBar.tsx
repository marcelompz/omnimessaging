import React, { useState, useEffect, useCallback } from "react";
import { OmniFlowConfig, storageService } from "../../services/storage";
import { BrowserEngine, BROWSER_PROFILES } from "../../services/crossBrowser";
import { MessageSquarePlus, Layers, Settings, Globe, Wifi, WifiOff } from "lucide-react";
import { ConfigModal } from "../settings/config-modal";

interface OmniFlowTopBarProps {
  config: OmniFlowConfig;
  targetEngine: BrowserEngine;
  sidePanelOpen: boolean;
  onToggleSidePanel: () => void;
  onOpenSettings?: () => void;
  onOpenCrossBrowser?: () => void;
  onSimulateIncomingMessage?: () => void;
}

export const OmniFlowTopBar: React.FC<OmniFlowTopBarProps> = ({
  config: initialConfig,
  targetEngine,
  sidePanelOpen,
  onToggleSidePanel,
  onOpenSettings,
  onOpenCrossBrowser,
  onSimulateIncomingMessage,
}) => {
  const [config, setConfig] = useState<OmniFlowConfig>(() => {
    return storageService.getConfig();
  });
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleConfigSaved = useCallback((newConfig: OmniFlowConfig) => {
    setConfig(newConfig);
  }, []);

  useEffect(() => {
    const unsubscribe = storageService.subscribe((updated) => {
      setConfig(updated);
    });
    return unsubscribe;
  }, []);

  const isConfigured = Boolean(config.tenantId && config.operatorToken);

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    }
    setIsConfigOpen(true);
  };

  return (
    <>
      <header
        style={{
          height: "48px",
          backgroundColor: "#2D1441",
          color: "#ffffff",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(147, 51, 234, 0.4)",
          width: "100vw",
          boxSizing: "border-box",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: "13px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src="/assets/orderflow-icon.svg"
              alt="OmniFlow"
              style={{ width: "26px", height: "26px", objectFit: "contain" }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", fontWeight: 900, fontStyle: "italic" }}>
                <span style={{ color: "#ffffff", fontSize: "15px", fontWeight: 800 }}>Omni</span>
                <span style={{ color: "#00D2D3", fontSize: "15px", fontWeight: 800 }}>Flow</span>
                <span style={{ marginLeft: "4px", fontSize: "9px", fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#e9d5ff", fontStyle: "normal" }}>
                  SISTEMA OMNICANAL
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "16px", fontSize: "12px", color: "#e9d5ff" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: config.tenantId ? "#2dd4bf" : "#f59e0b" }} />
            <span>Tenant: <strong style={{ color: config.tenantId ? "#ffffff" : "#fcd34d", fontFamily: "monospace" }}>{config.tenantId || "Sin tenant"}</strong></span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {config.operatorToken ? <Wifi style={{ width: "10px", height: "10px", color: "#2dd4bf" }} /> : <WifiOff style={{ width: "10px", height: "10px", color: "#f59e0b" }} />}
              Operador: <strong style={{ color: config.operatorToken ? "#ffffff" : "#fcd34d" }}>{config.operatorName}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Target Browser Selector */}
          <button
            type="button"
            onClick={onOpenCrossBrowser}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: "#3B1C54",
              color: "#5eead4",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              border: "1px solid rgba(147, 51, 234, 0.6)",
              cursor: "pointer",
            }}
            title="Abrir Centro Cross-Browser: Chrome, Firefox, Edge, Safari, Brave"
          >
            <Globe style={{ width: "14px", height: "14px", color: "#2dd4bf" }} />
            <span>Objetivo: <strong>{BROWSER_PROFILES[targetEngine]?.name.split(" ")[0] || "Chrome"}</strong></span>
            <span style={{ fontSize: "9px", backgroundColor: "rgba(45, 212, 191, 0.2)", color: "#5eead4", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace" }}>
              MV3
            </span>
          </button>

          {/* Incoming message simulation button */}
          {onSimulateIncomingMessage && (
            <button
              type="button"
              onClick={onSimulateIncomingMessage}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                backgroundColor: "rgba(58, 12, 94, 0.8)",
                color: "#f3e8ff",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                border: "1px solid rgba(147, 51, 234, 0.5)",
                cursor: "pointer",
              }}
              title="Simula que el cliente actual envía un nuevo mensaje en WhatsApp"
            >
              <MessageSquarePlus style={{ width: "14px", height: "14px", color: "#2dd4bf" }} />
              <span>Simular mensaje</span>
            </button>
          )}

          {/* Toggle side panel */}
          <button
            type="button"
            onClick={onToggleSidePanel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: sidePanelOpen ? "#009DA0" : "#3B1C54",
              color: "#ffffff",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              border: "1px solid rgba(147, 51, 234, 0.6)",
              cursor: "pointer",
            }}
          >
            <Layers style={{ width: "14px", height: "14px" }} />
            <span>{sidePanelOpen ? "Panel activo" : "Abrir panel"}</span>
          </button>

          {/* Extension settings */}
          <button
            type="button"
            onClick={handleOpenSettings}
            style={{
              padding: "6px",
              color: isConfigured ? "#ffffff" : "#fbbf24",
              borderRadius: "8px",
              border: "1px solid rgba(147, 51, 234, 0.5)",
              backgroundColor: isConfigured ? "transparent" : "rgba(251, 191, 36, 0.15)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            title="Configurar conexión OmniFlow (API URL, Tenant, Token)"
          >
            <Settings style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      </header>

      {/* Self-contained Config Modal rendered within same shadow DOM */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaved={handleConfigSaved}
      />
    </>
  );
};
