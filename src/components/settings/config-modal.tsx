import React, { useState, useEffect } from "react";
import { storageService, OmniFlowConfig } from "../../services/storage";
import { Settings, X, Check, Server, Key, Globe, User, Shield, TestTube } from "lucide-react";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (config: OmniFlowConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [apiUrl, setApiUrl] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [operatorToken, setOperatorToken] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [autoTakeoverOnType, setAutoTakeoverOnType] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    const cfg = storageService.getConfig();
    setApiUrl(cfg.baseUrl);
    setTenantId(cfg.tenantId);
    setOperatorToken(cfg.operatorToken);
    setOperatorName(cfg.operatorName);
    setAutoTakeoverOnType(cfg.autoTakeoverOnType);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await storageService.saveConfig({
      baseUrl: apiUrl.trim(),
      tenantId: tenantId.trim(),
      operatorToken: operatorToken.trim(),
      operatorName: operatorName.trim(),
      autoTakeoverOnType,
    });
    onSaved?.(updated);
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const cfg = storageService.getConfig();
    try {
      const url = cfg.baseUrl.endsWith("/api") ? cfg.baseUrl : `${cfg.baseUrl}/api/health`;
      const res = await fetch(url, {
        headers: {
          "X-OmniFlow-Tenant": cfg.tenantId,
          Authorization: `Bearer ${cfg.operatorToken}`,
        },
      });
      if (res.ok) {
        setTestResult("Conexión exitosa: OmniFlow backend en línea (200 OK)");
      } else {
        setTestResult(`Respuesta del servidor: HTTP ${res.status}`);
      }
    } catch (err: any) {
      setTestResult(`Error al conectar: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        zIndex: 100000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#1e293b",
          color: "#f1f5f9",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "440px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(147, 51, 234, 0.5)",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 20px",
            backgroundColor: "#3B1C54",
            borderBottom: "1px solid rgba(232, 225, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Settings style={{ width: "18px", height: "18px", color: "#2dd4bf" }} />
            <div>
              <h2 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>Configuración de Acceso OmniFlow</h2>
              <p style={{ fontSize: "11px", color: "#c4b5ff", marginTop: "2px" }}>
                Conecta la terminal con tu instancia SaaS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px",
              borderRadius: "6px",
              backgroundColor: "transparent",
              border: "none",
              color: "#c4b5ff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X style={{ width: "16px", height: "16px" }} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#94a397", marginBottom: "4px", fontWeight: 600 }}>
              <Globe style={{ width: "12px", height: "12px", display: "inline", marginRight: "4px" }} />
              URL Base de la API OmniFlow
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.omniflow.cloud"
              style={{
                width: "100%",
                padding: "8px 12px",
                backgroundColor: "#0f172a",
                border: "1px solid #334158",
                borderRadius: "8px",
                color: "#f1f5f9",
                fontSize: "13px",
                fontFamily: "monospace",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2dd4bf")}
              onBlur={(e) => (e.target.style.borderColor = "#334158")}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "#94a397", marginBottom: "4px", fontWeight: 600 }}>
                <Key style={{ width: "12px", height: "12px", display: "inline", marginRight: "4px" }} />
                Tenant ID
              </label>
              <input
                type="text"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="tenant_produccion_01"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334158",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                  fontSize: "13px",
                  fontFamily: "monospace",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", color: "#94a397", marginBottom: "4px", fontWeight: 600 }}>
                <User style={{ width: "12px", height: "12px", display: "inline", marginRight: "4px" }} />
                Nombre de Operador
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Ej: María González"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: "#0f172a",
                  border: "1px solid #334158",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", color: "#94a397", marginBottom: "4px", fontWeight: 600 }}>
              <Shield style={{ width: "12px", height: "12px", display: "inline", marginRight: "4px" }} />
              Token JWT de Operador (Bearer Auth)
            </label>
            <input
              type="password"
              value={operatorToken}
              onChange={(e) => setOperatorToken(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              style={{
                width: "100%",
                padding: "8px 12px",
                backgroundColor: "#0f172a",
                border: "1px solid #334158",
                borderRadius: "8px",
                color: "#f1f5f9",
                fontSize: "12px",
                fontFamily: "monospace",
                outline: "none",
              }}
            />
            <p style={{ fontSize: "10px", color: "#64748b", marginTop: "4px", lineHeight: 1.4 }}>
              Obtén tu JWT desde OmniFlow → Perfil de Usuario → Token de Acceso API.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px",
              backgroundColor: "#0f172a",
              borderRadius: "8px",
              border: "1px solid #334158",
            }}
          >
            <label style={{ fontSize: "12px", color: "#cbd5e1", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <input
                type="checkbox"
                checked={autoTakeoverOnType}
                onChange={(e) => setAutoTakeoverOnType(e.target.checked)}
                style={{ width: "14px", height: "14px", cursor: "pointer" }}
              />
              Detección automática de HUMAN_TAKEOVER al escribir
            </label>
          </div>

          {testResult && (
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: testResult.includes("exitosa") ? "#064e35" : "#7f1d1d",
                color: testResult.includes("exitosa") ? "#d1fae5" : "#fee2e2",
                borderRadius: "8px",
                fontSize: "11px",
                fontFamily: "monospace",
                border: `1px solid ${testResult.includes("exitosa") ? "#10b981" : "#ef4444"}`,
              }}
            >
              {testResult}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !apiUrl || !tenantId}
              style={{
                padding: "8px 14px",
                backgroundColor: "#0f172a",
                color: "#94a397",
                border: "1px solid #334158",
                borderRadius: "8px",
                fontSize: "12px",
                cursor: isTesting || !apiUrl || !tenantId ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <TestTube style={{ width: "13px", height: "13px" }} />
              {isTesting ? "Verificando..." : "Test de Conexión"}
            </button>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "transparent",
                  color: "#94a397",
                  border: "1px solid #334158",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#2dd4bf",
                  color: "#0f172a",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Check style={{ width: "14px", height: "14px" }} />
                Guardar y Conectar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
