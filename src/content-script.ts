import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import indexCss from "./index.css?inline";

console.log("[OrderFlow Extension] Content script loaded on web.whatsapp.com");

function mountSidePanel() {
  if (document.getElementById("orderflow-wa-root")) return;

  const root = document.createElement("div");
  root.id = "orderflow-wa-root";
  root.style.position = "fixed";
  root.style.right = "0";
  root.style.top = "0";
  root.style.height = "100vh";
  root.style.zIndex = "999999";
  root.style.display = "flex";

  const shadow = root.attachShadow({ mode: "open" });

  // Inject styles into Shadow DOM
  if (indexCss) {
    const styleEl = document.createElement("style");
    styleEl.textContent = indexCss;
    shadow.appendChild(styleEl);
  }

  const container = document.createElement("div");
  container.id = "orderflow-container";
  container.style.height = "100%";
  shadow.appendChild(container);

  document.body.appendChild(root);

  try {
    const reactRoot = createRoot(container);
    reactRoot.render(React.createElement(App, { isEmbedded: true }));
    console.log("[OrderFlow Extension] Embedded side panel mounted into Shadow DOM successfully");
  } catch (err) {
    console.error("[OrderFlow Extension] Error mounting React root into Shadow DOM:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountSidePanel);
} else {
  mountSidePanel();
}

