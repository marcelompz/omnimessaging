/**
 * Cross-Browser Extension Core Polyfill & Diagnostics Module
 * Compliant with WXT / W3C WebExtensions standard & Chromium Manifest V3.
 * Provides unified API for Chrome, Firefox (Gecko), Edge, Safari (WebKit), and Brave.
 */

export type BrowserEngine = "chrome" | "firefox" | "edge" | "safari" | "brave";

export interface BrowserCapability {
  engine: BrowserEngine;
  name: string;
  namespace: "browser" | "chrome";
  backgroundType: "service_worker" | "scripts_event_page";
  manifestVersion: 3;
  geckoId?: string;
  shadowDomStyling: "adoptedStyleSheets" | "style_tag_fallback";
  inputEventMethod: "execCommand" | "beforeinput" | "hybrid";
  storeName: string;
}

export const BROWSER_PROFILES: Record<BrowserEngine, BrowserCapability> = {
  chrome: {
    engine: "chrome",
    name: "Google Chrome (Blink)",
    namespace: "chrome",
    backgroundType: "service_worker",
    manifestVersion: 3,
    shadowDomStyling: "adoptedStyleSheets",
    inputEventMethod: "hybrid",
    storeName: "Chrome Web Store",
  },
  firefox: {
    engine: "firefox",
    name: "Mozilla Firefox (Gecko)",
    namespace: "browser",
    backgroundType: "scripts_event_page",
    manifestVersion: 3,
    geckoId: "omnibot-extension@omniflow.app",
    shadowDomStyling: "adoptedStyleSheets",
    inputEventMethod: "beforeinput",
    storeName: "Mozilla Add-ons (AMO)",
  },
  edge: {
    engine: "edge",
    name: "Microsoft Edge (Chromium)",
    namespace: "chrome",
    backgroundType: "service_worker",
    manifestVersion: 3,
    shadowDomStyling: "adoptedStyleSheets",
    inputEventMethod: "hybrid",
    storeName: "Microsoft Edge Add-ons",
  },
  safari: {
    engine: "safari",
    name: "Apple Safari (WebKit)",
    namespace: "browser",
    backgroundType: "service_worker",
    manifestVersion: 3,
    shadowDomStyling: "style_tag_fallback",
    inputEventMethod: "hybrid",
    storeName: "Mac App Store (Xcode Web Extension)",
  },
  brave: {
    engine: "brave",
    name: "Brave Browser (Shields Enabled)",
    namespace: "chrome",
    backgroundType: "service_worker",
    manifestVersion: 3,
    shadowDomStyling: "adoptedStyleSheets",
    inputEventMethod: "hybrid",
    storeName: "Chrome Web Store / Direct Load",
  },
};

/**
 * Detect runtime browser engine from userAgent or navigator
 */
export function detectBrowserEngine(): BrowserEngine {
  if (typeof navigator === "undefined") return "chrome";
  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes("firefox") || ua.includes("fxios")) return "firefox";
  if (ua.includes("edg/")) return "edge";
  if ((navigator as any).brave && typeof (navigator as any).brave.isBrave === "function") return "brave";
  if (ua.includes("safari") && !ua.includes("chrome") && !ua.includes("android")) return "safari";
  return "chrome";
}

/**
 * Unified cross-browser storage wrapper (browser.storage.local / chrome.storage.local)
 */
export class CrossBrowserStorage {
  private engine: BrowserEngine;

  constructor(engine: BrowserEngine = detectBrowserEngine()) {
    this.engine = engine;
  }

  setEngine(engine: BrowserEngine) {
    this.engine = engine;
  }

  getEngine(): BrowserEngine {
    return this.engine;
  }

  async get<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
    try {
      // Check for native extension browser/chrome storage
      if (typeof window !== "undefined") {
        const extApi = (window as any).browser || (window as any).chrome;
        if (extApi?.storage?.local) {
          return new Promise((resolve) => {
            extApi.storage.local.get([key], (result: any) => {
              resolve(result?.[key] !== undefined ? result[key] : defaultValue);
            });
          });
        }
      }

      // Fallback to localStorage for preview & dev container
      const item = localStorage.getItem(`omniflow_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  async set<T = any>(key: string, value: T): Promise<void> {
    try {
      if (typeof window !== "undefined") {
        const extApi = (window as any).browser || (window as any).chrome;
        if (extApi?.storage?.local) {
          return new Promise((resolve) => {
            extApi.storage.local.set({ [key]: value }, () => resolve());
          });
        }
      }

      localStorage.setItem(`omniflow_${key}`, JSON.stringify(value));
    } catch (err) {
      console.warn("CrossBrowserStorage set error:", err);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      if (typeof window !== "undefined") {
        const extApi = (window as any).browser || (window as any).chrome;
        if (extApi?.storage?.local) {
          return new Promise((resolve) => {
            extApi.storage.local.remove([key], () => resolve());
          });
        }
      }
      localStorage.removeItem(`omniflow_${key}`);
    } catch (err) {
      console.warn("CrossBrowserStorage remove error:", err);
    }
  }
}

export const crossBrowserStorage = new CrossBrowserStorage();

/**
 * Cross-browser Shadow DOM CSS injection
 * Handles adoptedStyleSheets (Chrome, Firefox, Safari 16.4+) and <style> fallback (older Safari/WebKit).
 */
export function injectShadowStyles(shadowRoot: ShadowRoot, cssContent: string): void {
  try {
    if (typeof CSSStyleSheet !== "undefined" && "adoptedStyleSheets" in shadowRoot) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(cssContent);
      shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, sheet];
      return;
    }
  } catch {
    // Fall back to style tag
  }

  const styleEl = document.createElement("style");
  styleEl.textContent = cssContent;
  shadowRoot.appendChild(styleEl);
}

/**
 * Get the target-specific Manifest V3 definition
 */
export function getManifestForTarget(engine: BrowserEngine): object {
  const baseManifest = {
    manifest_version: 3,
    name: "OrderFlow • WhatsApp Web & OmniBot Copilot",
    version: "2.5.0",
    description: "Terminal operativa omnicanal para WhatsApp Web con consola de operador, copiloto IA OmniBot, protocolo HUMAN_TAKEOVER, ficha 360°, POS y agendamiento.",
    icons: {
      "16": "assets/orderflow-icon.svg",
      "32": "assets/orderflow-icon.svg",
      "48": "assets/orderflow-icon.svg",
      "128": "assets/orderflow-icon.svg"
    },
    action: {
      default_title: "OrderFlow Extension",
      default_popup: "popup.html",
      default_icon: "assets/orderflow-icon.svg"
    },
    permissions: [
      "storage",
      "alarms"
    ],
    host_permissions: [
      "https://web.whatsapp.com/*",
      "*://api.omniflow.cloud/*",
      "*://localhost/*"
    ],
    content_scripts: [
      {
        matches: ["https://web.whatsapp.com/*"],
        js: ["content-script.js"],
        run_at: "document_idle"
      }
    ],
    web_accessible_resources: [
      {
        resources: ["assets/*", "styles/*"],
        matches: ["https://web.whatsapp.com/*"]
      }
    ]
  };

  switch (engine) {
    case "firefox":
      return {
        ...baseManifest,
        background: {
          scripts: ["background.js"]
        },
        browser_specific_settings: {
          gecko: {
            id: "omnibot-extension@omniflow.app",
            strict_min_version: "109.0"
          }
        },
        content_security_policy: {
          extension_pages: "script-src 'self'; object-src 'self'"
        }
      };

    case "safari":
      return {
        ...baseManifest,
        background: {
          service_worker: "background.js"
        },
        browser_specific_settings: {
          safari: {
            strict_min_version: "16.0"
          }
        }
      };

    case "edge":
      return {
        ...baseManifest,
        name: "OrderFlow for Microsoft Edge • WhatsApp Web & Copilot",
        background: {
          service_worker: "background.js",
          type: "module"
        },
        minimum_edge_version: "100"
      };

    case "brave":
    case "chrome":
    default:
      return {
        ...baseManifest,
        background: {
          service_worker: "background.js",
          type: "module"
        }
      };
  }
}
