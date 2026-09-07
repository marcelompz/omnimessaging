// Extension Background Script
console.log("[OrderFlow Extension] Background worker initialized");

// Toggle side panel on extension action icon click
if (typeof chrome !== "undefined" && chrome.action && chrome.action.onClicked) {
  chrome.action.onClicked.addListener((tab) => {
    if (tab.id && tab.url && tab.url.includes("web.whatsapp.com")) {
      chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_SIDE_PANEL" });
    }
  });
}
