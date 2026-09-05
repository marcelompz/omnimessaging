/**
 * WhatsApp Web Centralized DOM Selectors & Semantic Fallbacks
 * Specified in OmniFlow Architecture Phase 3 & 4
 */

export const WHATSAPP_SELECTORS = {
  // Main chat container
  MAIN_CONTAINER: "#main",
  CHAT_HEADER: "#main header",
  CHAT_TITLE: "#main header [data-testid='conversation-info-header-chat-title']",
  CHAT_SUBTITLE: "#main header span[title]",
  CHAT_AVATAR: "#main header img",

  // Message list
  MESSAGE_LIST_CONTAINER: "#main div[data-testid='conversation-panel-messages']",
  MESSAGE_ROW: "div[data-testid='msg-container']",
  MESSAGE_IN: "div[data-testid='msg-container'].message-in",
  MESSAGE_OUT: "div[data-testid='msg-container'].message-out",

  // Message Input bar (Draft.js / Lexical container)
  INPUT_FOOTER: "#main footer",
  INPUT_CONTENT_EDITABLE: "footer div[contenteditable='true'][role='textbox']",
  INPUT_FALLBACK: "footer [contenteditable='true']",
  
  // Action buttons
  SEND_BUTTON: "footer button[data-testid='send']",
  SEND_BUTTON_FALLBACK: "footer span[data-icon='send']",
  ATTACH_BUTTON: "footer button[data-testid='clip']",
  EMOJI_BUTTON: "footer button[data-testid='smiley']",

  // Left panel / Chat list
  SIDE_PANEL_LEFT: "#side",
  SEARCH_INPUT: "#side div[contenteditable='true'][role='textbox']",
  CHAT_LIST: "#side div[data-testid='chat-list']",
  ACTIVE_CHAT_ITEM: "#side div[data-testid='cell-frame-container'][aria-selected='true']",

  // Extension Injection Target Anchor
  INJECTION_TARGET: "#app > div > div",
  SIDE_PANEL_MOUNT: "#omniflow-sidepanel-root",
};

/**
 * Normalizes JID (e.g., 595981123456@c.us) to international E.164 (+595981123456)
 */
export function normalizeJidToE164(jidOrPhone: string): string {
  if (!jidOrPhone) return "";
  const cleaned = jidOrPhone.replace(/@c\.us|@s\.whatsapp\.net|@g\.us/g, "").replace(/\D/g, "");
  if (!cleaned) return "";
  return `+${cleaned}`;
}

/**
 * Detects if current chat is a Group (@g.us) or 1-to-1 conversation
 */
export function isGroupChat(jid: string): boolean {
  return jid.includes("@g.us");
}
