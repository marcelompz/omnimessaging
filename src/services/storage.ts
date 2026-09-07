import { BrowserEngine, detectBrowserEngine } from "./crossBrowser";

export interface OmniFlowConfig {
  baseUrl: string;
  tenantId: string;
  operatorToken: string;
  operatorName: string;
  operatorEmail: string;
  autoTakeoverOnType: boolean;
  autoAnalyzeCopilot: boolean;
  theme: "light" | "dark";
  systemPromptBase: string;
  targetBrowser: BrowserEngine;
}

const DEFAULT_CONFIG: OmniFlowConfig = {
  baseUrl: "https://api.omniflow.cloud",
  tenantId: "",
  operatorToken: "",
  operatorName: "Sin sesión / Configurar en extensión",
  operatorEmail: "",
  autoTakeoverOnType: true,
  autoAnalyzeCopilot: true,
  theme: "light",
  systemPromptBase: "Atender con amabilidad, precisión y tono profesional. Priorizar combos de cabina estética y recordar la regularización de cuenta corriente.",
  targetBrowser: detectBrowserEngine(),
};

const STORAGE_KEY = "omniflow_extension_storage_v1";

type ConfigSubscriber = (config: OmniFlowConfig) => void;
const subscribers: Set<ConfigSubscriber> = new Set();

let _cache: OmniFlowConfig = { ...DEFAULT_CONFIG };

function getExtStorage(): any | null {
  if (typeof window !== "undefined") {
    const extApi = (window as any).browser || (window as any).chrome;
    if (extApi?.storage?.local) {
      return extApi;
    }
  }
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    return chrome;
  }
  return null;
}

function isExtensionContext(): boolean {
  return getExtStorage() !== null;
}

export const storageService = {
  getConfig(): OmniFlowConfig {
    return { ..._cache };
  },

  isConfigured(): boolean {
    return Boolean(_cache.tenantId) && Boolean(_cache.operatorToken);
  },

  async initAsync(): Promise<OmniFlowConfig> {
    const extApi = getExtStorage();
    if (extApi) {
      try {
        const result = await new Promise<any>((resolve) => {
          extApi.storage.local.get([STORAGE_KEY], (res: any) => resolve(res));
        });
        if (result[STORAGE_KEY]) {
          _cache = { ...DEFAULT_CONFIG, ...result[STORAGE_KEY] };
        }
      } catch (e) {
        console.warn("[storageService] chrome.storage.local get failed:", e);
      }
    } else {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          _cache = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
        }
      } catch {
        // keep defaults
      }
    }
    subscribers.forEach((s) => s({ ..._cache }));
    return { ..._cache };
  },

  async saveConfig(newConfig: Partial<OmniFlowConfig>): Promise<OmniFlowConfig> {
    const updated = { ..._cache, ...newConfig };
    _cache = updated;
    const extApi = getExtStorage();
    if (extApi) {
      try {
        await new Promise<void>((resolve) => {
          extApi.storage.local.set({ [STORAGE_KEY]: updated }, () => resolve());
        });
      } catch (e) {
        console.warn("[storageService] chrome.storage.local set failed:", e);
      }
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save config:", e);
      }
    }
    subscribers.forEach((s) => s({ ...updated }));
    return { ...updated };
  },

  async resetDefaults(): Promise<OmniFlowConfig> {
    _cache = { ...DEFAULT_CONFIG };
    const extApi = getExtStorage();
    if (extApi) {
      try {
        await new Promise<void>((resolve) => {
          extApi.storage.local.remove([STORAGE_KEY], () => resolve());
        });
      } catch {}
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    subscribers.forEach((s) => s({ ..._cache }));
    return { ..._cache };
  },

  subscribe(fn: ConfigSubscriber): () => void {
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  },

  isExtensionContext,
};

if (typeof window !== "undefined") {
  if (typeof (window as any).chrome !== "undefined" && (window as any).chrome.storage?.onChanged) {
    (window as any).chrome.storage.onChanged.addListener((changes: any, area: string) => {
      if (area === "local" && changes[STORAGE_KEY]) {
        const newValue = changes[STORAGE_KEY].newValue;
        if (newValue) {
          _cache = { ...DEFAULT_CONFIG, ...newValue };
          subscribers.forEach((s) => s({ ..._cache }));
        }
      }
    });
  }
  if (typeof (window as any).browser !== "undefined" && (window as any).browser.storage?.onChanged) {
    (window as any).browser.storage.onChanged.addListener((changes: any, area: string) => {
      if (area === "local" && changes[STORAGE_KEY]) {
        const newValue = changes[STORAGE_KEY].newValue;
        if (newValue) {
          _cache = { ...DEFAULT_CONFIG, ...newValue };
          subscribers.forEach((s) => s({ ..._cache }));
        }
      }
    });
  }
}

storageService.initAsync();
