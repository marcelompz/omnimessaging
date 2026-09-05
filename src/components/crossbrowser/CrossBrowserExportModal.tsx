import React, { useState } from "react";
import {
  BrowserEngine,
  BROWSER_PROFILES,
  getManifestForTarget,
  detectBrowserEngine,
} from "../../services/crossBrowser";
import {
  Globe,
  CheckCircle2,
  Copy,
  Download,
  Terminal,
  Shield,
  Layers,
  FileCode,
  X,
  ExternalLink,
  Cpu,
  Sparkles,
} from "lucide-react";

interface CrossBrowserExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEngine: BrowserEngine;
  onSelectEngine: (engine: BrowserEngine) => void;
}

export const CrossBrowserExportModal: React.FC<CrossBrowserExportModalProps> = ({
  isOpen,
  onClose,
  activeEngine,
  onSelectEngine,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<BrowserEngine>(activeEngine || detectBrowserEngine());
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"manifest" | "diagnostics" | "deploy">("diagnostics");

  if (!isOpen) return null;

  const profile = BROWSER_PROFILES[selectedTarget];
  const manifestObj = getManifestForTarget(selectedTarget);
  const manifestString = JSON.stringify(manifestObj, null, 2);

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(manifestString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([manifestString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manifest-${selectedTarget}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with OrderFlow High-Speed Omni-System Identity */}
        <div className="px-5 py-3.5 bg-[#3B1C54] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/orderflow-icon.svg"
              alt="OrderFlow"
              className="w-7 h-7 object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">OrderFlow • Centro de Exportación Cross-Browser</h3>
                <span className="text-[10px] bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                  Multi-Target MV3
                </span>
              </div>
              <p className="text-[11px] text-purple-200">
                Portabilidad unificada a Chrome, Firefox, Edge, Safari y Brave
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-purple-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Engine Selection Pills */}
        <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          {(Object.keys(BROWSER_PROFILES) as BrowserEngine[]).map((engineKey) => {
            const prof = BROWSER_PROFILES[engineKey];
            const isSelected = selectedTarget === engineKey;
            const isCurrentlyRunning = activeEngine === engineKey;

            return (
              <button
                key={engineKey}
                type="button"
                onClick={() => {
                  setSelectedTarget(engineKey);
                  onSelectEngine(engineKey);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#3B1C54] text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                }`}
              >
                <Globe className={`w-3.5 h-3.5 ${isSelected ? "text-teal-400" : "text-slate-400"}`} />
                <span>{prof.name.split(" ")[0]}</span>
                {isCurrentlyRunning && (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-teal-400" : "bg-emerald-500"}`} title="Motor activo" />
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("diagnostics")}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "diagnostics"
                ? "border-[#009DA0] text-[#009DA0]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Diagnóstico del Motor ({profile.name.split(" ")[0]})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("manifest")}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "manifest"
                ? "border-[#009DA0] text-[#009DA0]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Manifest V3 Target
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("deploy")}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "deploy"
                ? "border-[#009DA0] text-[#009DA0]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Publicación en Tiendas
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 text-xs flex flex-col gap-4">
          {activeTab === "diagnostics" && (
            <div className="flex flex-col gap-3">
              {/* Profile summary card */}
              <div className="p-3.5 bg-gradient-to-r from-purple-50 to-teal-50 border border-purple-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#009DA0]" />
                    {profile.name}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Canal oficial: <strong>{profile.storeName}</strong>
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-white text-emerald-700 font-mono font-bold text-[11px] rounded-lg border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  100% Compatible
                </span>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    API Namespace
                  </span>
                  <span className="font-mono font-bold text-xs text-purple-900">
                    window.{profile.namespace}.*
                  </span>
                  <p className="text-[10px] text-slate-500">
                    {profile.namespace === "browser"
                      ? "Estándar W3C con soporte nativo de Promises (async/await)"
                      : "Namespace estándar de Chromium con callbacks y promesas híbridas"}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Ciclo de Vida Background
                  </span>
                  <span className="font-mono font-bold text-xs text-purple-900">
                    {profile.backgroundType}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    {profile.backgroundType === "service_worker"
                      ? "Worker efímero sin estado persistente en RAM"
                      : "Event Page reactivo para compatibilidad estricta con Gecko"}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Shadow DOM & Tailwind CSS
                  </span>
                  <span className="font-mono font-bold text-xs text-teal-800">
                    {profile.shadowDomStyling}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Aislamiento total frente al DOM de WhatsApp Web sin colisiones CSS.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Estrategia Input ContentEditable
                  </span>
                  <span className="font-mono font-bold text-xs text-teal-800">
                    {profile.inputEventMethod}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Activa el botón nativo de envío en Draft.js / Lexical al insertar texto.
                  </p>
                </div>
              </div>

              {/* Special browser specific settings */}
              {profile.geckoId && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>
                      Identificador Gecko AMO: <strong>{profile.geckoId}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-amber-300">
                    Firefox &gt;= 109.0
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === "manifest" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  manifest.json generado para .output/{selectedTarget}-mv3
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopyManifest}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-semibold text-[11px] transition-colors"
                  >
                    <Copy className="w-3 h-3 text-slate-600" />
                    {copied ? "¡Copiado!" : "Copiar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#3B1C54] hover:bg-[#4E246F] text-white rounded-md font-semibold text-[11px] transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Descargar
                  </button>
                </div>
              </div>

              <pre className="p-3 bg-slate-900 text-teal-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-80 border border-slate-800 leading-relaxed">
                {manifestString}
              </pre>
            </div>
          )}

          {activeTab === "deploy" && (
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h5 className="font-bold text-slate-900 text-xs mb-1">
                  Comandos de Compilación Automatizada (WXT / TypeScript):
                </h5>
                <div className="flex flex-col gap-1 text-[11px] font-mono text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                  <p>
                    <strong className="text-purple-900">npm run build:chrome</strong> → Empaqueta en <code>.output/chrome-mv3/</code>
                  </p>
                  <p>
                    <strong className="text-purple-900">npm run build:firefox</strong> → Empaqueta en <code>.output/firefox-mv3/</code>
                  </p>
                  <p>
                    <strong className="text-purple-900">npm run build:edge</strong> → Empaqueta en <code>.output/edge-mv3/</code>
                  </p>
                  <p>
                    <strong className="text-purple-900">npm run build:safari</strong> → Empaqueta en <code>.output/safari-mv3/</code>
                  </p>
                  <p>
                    <strong className="text-teal-700">npm run build:all</strong> → Compila todos los targets simultáneamente
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
                <h5 className="font-bold text-slate-900 text-xs">Instrucciones de Despliegue según Tienda:</h5>
                <ul className="list-disc pl-4 text-[11px] text-slate-600 flex flex-col gap-1 leading-relaxed">
                  <li>
                    <strong>Chrome Web Store & Brave:</strong> Sube el archivo ZIP de <code>.output/chrome-mv3</code> directamente al Chrome Developer Dashboard.
                  </li>
                  <li>
                    <strong>Mozilla Add-ons (AMO):</strong> Sube el ZIP de <code>.output/firefox-mv3</code>. El manifest incluye automáticamente el <code>gecko.id</code> requerido para firma digital o distribución self-hosted (.xpi).
                  </li>
                  <li>
                    <strong>Microsoft Edge Add-ons:</strong> Sube el ZIP de <code>.output/edge-mv3</code> en el portal Microsoft Partner Center.
                  </li>
                  <li>
                    <strong>Safari (Mac App Store):</strong> Ejecuta <code>xcrun safari-web-extension-converter .output/safari-mv3 --project-location ./safari-app --app-name "OrderFlow"</code> para compilar con Xcode.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-[#009DA0]" />
            <span>Target activo: <strong>{profile.name}</strong></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#3B1C54] hover:bg-[#4E246F] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
