import React, { useState } from "react";
import { storageService, OmniFlowConfig } from "../../services/storage";
import { Settings, X, ShieldCheck, Check, Server, Key, Globe, User, Terminal, Database } from "lucide-react";

interface ExtensionPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (config: OmniFlowConfig) => void;
}

export const ExtensionPopupModal: React.FC<ExtensionPopupModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const currentConfig = storageService.getConfig();
  const [baseUrl, setBaseUrl] = useState(currentConfig.baseUrl);
  const [tenantId, setTenantId] = useState(currentConfig.tenantId);
  const [operatorToken, setOperatorToken] = useState(currentConfig.operatorToken);
  const [operatorName, setOperatorName] = useState(currentConfig.operatorName);
  const [autoTakeoverOnType, setAutoTakeoverOnType] = useState(currentConfig.autoTakeoverOnType);
  const [autoAnalyzeCopilot, setAutoAnalyzeCopilot] = useState(currentConfig.autoAnalyzeCopilot);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = storageService.saveConfig({
      baseUrl,
      tenantId,
      operatorToken,
      operatorName,
      autoTakeoverOnType,
      autoAnalyzeCopilot,
    });
    onSaved(updated);
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        setTestResult("Conexión exitosa: Service Worker y Backend OmniFlow en línea (200 OK)");
      } else {
        setTestResult(`Respuesta del servidor: HTTP ${res.status}`);
      }
    } catch (err: any) {
      setTestResult(`Error al conectar con el backend: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#3B1C54] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/orderflow-icon.svg"
              alt="OrderFlow"
              className="w-7 h-7 object-contain drop-shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">OrderFlow • Configuración MV3 Multi-Target</h3>
                <span className="text-[10px] bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                  Cross-Browser
                </span>
              </div>
              <p className="text-[11px] text-purple-200">Panel de Operador & Vinculación Multi-Tenant</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-purple-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
          {/* Manifest V3 specs badge */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1.5 text-[11px] text-slate-600">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                Arquitectura de la Extensión (WXT Framework)
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                Manifest V3 Activo
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              • <strong>Aislamiento:</strong> Montado vía <code>createShadowRootUi</code> con Tailwind encapsulado.
              <br />• <strong>Proxy:</strong> Llamadas HTTP delegadas a Background Service Worker contra CSP.
              <br />• <strong>Permisos:</strong> <code>web.whatsapp.com/*</code>, <code>api.omniflow.*</code>, <code>storage</code>.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                URL Base de la Instancia OmniFlow SaaS
              </label>
              <input
                type="text"
                required
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                placeholder="https://api.omniflow.cloud"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  Tenant ID (Empresa)
                </label>
                <input
                  type="text"
                  required
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  placeholder="tenant_latam_01"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Nombre de Operador
                </label>
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                Token JWT de Operador (Bearer Auth)
              </label>
              <input
                type="password"
                required
                value={operatorToken}
                onChange={(e) => setOperatorToken(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-slate-700">Detección Automática de HUMAN_TAKEOVER</span>
              <input
                type="checkbox"
                checked={autoTakeoverOnType}
                onChange={(e) => setAutoTakeoverOnType(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-slate-700">Auto-análisis de Copiloto al recibir mensajes</span>
              <input
                type="checkbox"
                checked={autoAnalyzeCopilot}
                onChange={(e) => setAutoAnalyzeCopilot(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </label>
          </div>

          {/* Test connection & result */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Prueba de enlace con Background Worker</span>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-medium text-xs transition-colors"
              >
                {isTesting ? "Verificando..." : "Test de Conexión"}
              </button>
            </div>
            {testResult && (
              <div className="p-2 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-[11px] font-mono leading-tight">
                {testResult}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
