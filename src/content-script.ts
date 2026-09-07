import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { OmniFlowTopBar } from "./components/panel/OmniFlowTopBar";
import { storageService } from "./services/storage";
import { detectBrowserEngine } from "./services/crossBrowser";
import indexCss from "./index.css?inline";

console.log("[OrderFlow Extension] Content script FEAT-072 dual-host loaded on web.whatsapp.com");

const TOPBAR_HEIGHT = 48;
const SIDEBAR_WIDTH = 380;

function adjustWhatsAppLayout() {
  let styleEl = document.getElementById("omniflow-layout-override");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "omniflow-layout-override";
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = `
    html, body {
      width: 100vw !important;
      height: 100vh !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #app {
      position: fixed !important;
      top: ${TOPBAR_HEIGHT}px !important;
      left: 0 !important;
      width: calc(100vw - ${SIDEBAR_WIDTH}px) !important;
      height: calc(100vh - ${TOPBAR_HEIGHT}px) !important;
      min-width: 0 !important;
      margin: 0 !important;
      transition: width 0.2s ease, top 0.2s ease !important;
    }
  `;
}

function setupOmniFlowContainers() {
  adjustWhatsAppLayout();

  // TopBar Host
  let topbarHost = document.getElementById("omniflow-topbar-host");
  if (!topbarHost) {
    topbarHost = document.createElement("div");
    topbarHost.id = "omniflow-topbar-host";
    topbarHost.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: ${TOPBAR_HEIGHT}px !important;
      z-index: 99999 !important;
      background: #2D1441;
      pointer-events: auto !important;
    `;

    const shadowTop = topbarHost.attachShadow({ mode: "open" });
    if (indexCss) {
      const styleEl = document.createElement("style");
      styleEl.textContent = indexCss;
      shadowTop.appendChild(styleEl);
    }

    const containerTop = document.createElement("div");
    containerTop.id = "omniflow-topbar-container";
    containerTop.style.cssText = "width: 100%; height: 100%;";
    shadowTop.appendChild(containerTop);

    document.body.appendChild(topbarHost);

    try {
      const reactRootTop = createRoot(containerTop);
      const config = storageService.getConfig();
      const targetEngine = detectBrowserEngine();

      const toggleSidePanel = () => {
        const sidebar = document.getElementById("omniflow-sidebar-host");
        const appEl = document.getElementById("app");
        if (sidebar) {
          const isHidden = sidebar.style.display === "none";
          sidebar.style.display = isHidden ? "block" : "none";
          if (appEl) {
            appEl.style.width = isHidden ? `calc(100vw - ${SIDEBAR_WIDTH}px)` : "100vw";
          }
        }
      };

      reactRootTop.render(
        React.createElement(OmniFlowTopBar, {
          config,
          targetEngine,
          sidePanelOpen: true,
          onToggleSidePanel: toggleSidePanel,
          onOpenSettings: () => {
            window.postMessage({ type: "ORDERFLOW_OPEN_SETTINGS" }, "*");
            window.dispatchEvent(new CustomEvent("omniflow:open_settings"));
          },
          onOpenCrossBrowser: () => {
            window.postMessage({ type: "ORDERFLOW_OPEN_CROSSBROWSER" }, "*");
            window.dispatchEvent(new CustomEvent("omniflow:open_crossbrowser"));
          },
        })
      );
    } catch (err) {
      console.error("[OrderFlow Extension] Error rendering TopBar:", err);
    }
  }

  // Sidebar Host
  let sidebarHost = document.getElementById("omniflow-sidebar-host");
  if (!sidebarHost) {
    sidebarHost = document.createElement("div");
    sidebarHost.id = "omniflow-sidebar-host";
    sidebarHost.style.cssText = `
      position: fixed !important;
      top: ${TOPBAR_HEIGHT}px !important;
      right: 0 !important;
      width: ${SIDEBAR_WIDTH}px !important;
      height: calc(100vh - ${TOPBAR_HEIGHT}px) !important;
      z-index: 99998 !important;
      background: #0b141a;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      overflow-y: auto !important;
      overflow-x: hidden !important;
      pointer-events: auto !important;
    `;

    const shadowSide = sidebarHost.attachShadow({ mode: "open" });
    if (indexCss) {
      const styleEl = document.createElement("style");
      styleEl.textContent = indexCss;
      shadowSide.appendChild(styleEl);
    }

    const containerSide = document.createElement("div");
    containerSide.id = "omniflow-sidebar-container";
    containerSide.style.cssText = "width: 100%; height: 100%;";
    shadowSide.appendChild(containerSide);

    document.body.appendChild(sidebarHost);

    try {
      const reactRootSide = createRoot(containerSide);
      reactRootSide.render(React.createElement(App, { isEmbedded: true }));
    } catch (err) {
      console.error("[OrderFlow Extension] Error rendering Sidebar:", err);
    }
  }

  return { topbarHost, sidebarHost };
}

const observer = new MutationObserver(() => {
  setupOmniFlowContainers();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setupOmniFlowContainers();
    if (document.body) observer.observe(document.body, { childList: true });
  });
} else {
  setupOmniFlowContainers();
  if (document.body) observer.observe(document.body, { childList: true });
}

if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "TOGGLE_SIDE_PANEL") {
      const sidebarHost = document.getElementById("omniflow-sidebar-host");
      const appEl = document.getElementById("app");
      if (sidebarHost) {
        const isHidden = sidebarHost.style.display === "none";
        sidebarHost.style.display = isHidden ? "block" : "none";
        if (appEl) {
          appEl.style.width = isHidden ? `calc(100vw - ${SIDEBAR_WIDTH}px)` : "100vw";
        }
      } else {
        setupOmniFlowContainers();
      }
    }
  });
}
