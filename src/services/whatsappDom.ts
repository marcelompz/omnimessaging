import { WHATSAPP_SELECTORS } from "../constants/selectors";
import { detectBrowserEngine, BrowserEngine } from "./crossBrowser";

export type MessagePasteOptions = {
  sendImmediately?: boolean;
  onTakeoverTriggered?: () => void;
  engineOverride?: BrowserEngine;
};

export const whatsappDom = {
  activeObservers: [] as MutationObserver[],

  /**
   * Finds the WhatsApp Web text editor (Lexical / Draft.js contenteditable)
   */
  getMessageInput(): HTMLElement | null {
    return (
      document.querySelector(WHATSAPP_SELECTORS.INPUT_CONTENT_EDITABLE) ||
      document.querySelector(WHATSAPP_SELECTORS.INPUT_FALLBACK) ||
      document.getElementById("wa-main-editor")
    );
  },

  /**
   * Safely inserts text into the WhatsApp Web message editor, respecting React's internal state
   * Supports Blink (Chrome/Edge/Brave), Gecko (Firefox), and WebKit (Safari).
   */
  insertTextIntoInput(text: string, options?: MessagePasteOptions): boolean {
    const input = this.getMessageInput();
    if (!input) {
      console.warn("WhatsApp Web message input not found in DOM");
      return false;
    }

    const engine = options?.engineOverride || detectBrowserEngine();
    input.focus();

    let insertionSucceeded = false;

    // Strategy 1: Gecko (Firefox) specific InputEvent beforeinput dispatch
    if (engine === "firefox" && typeof InputEvent !== "undefined") {
      try {
        const beforeInputEvent = new InputEvent("beforeinput", {
          bubbles: true,
          cancelable: true,
          inputType: "insertText",
          data: text,
        });
        input.dispatchEvent(beforeInputEvent);
        insertionSucceeded = true;
      } catch {
        insertionSucceeded = false;
      }
    }

    // Strategy 2: Blink & WebKit standard document.execCommand('insertText')
    if (!insertionSucceeded) {
      try {
        insertionSucceeded = document.execCommand("insertText", false, text);
      } catch {
        insertionSucceeded = false;
      }
    }

    // Strategy 3: Universal Caret Range insertion fallback (Safari & direct contenteditable)
    if (!insertionSucceeded) {
      try {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const textNode = document.createTextNode(text);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection.removeAllRanges();
          selection.addRange(range);
          insertionSucceeded = true;
        } else if ("value" in input) {
          (input as any).value = text;
          insertionSucceeded = true;
        } else {
          input.textContent = text;
          insertionSucceeded = true;
        }
      } catch {
        input.textContent = text;
      }
    }

    // Dispatch input & keyup events to force React / Lexical dirty-check & show send button in all engines
    const inputEvent = new Event("input", { bubbles: true, cancelable: true });
    input.dispatchEvent(inputEvent);

    const changeEvent = new Event("change", { bubbles: true });
    input.dispatchEvent(changeEvent);

    if (options?.onTakeoverTriggered) {
      options.onTakeoverTriggered();
    }

    if (options?.sendImmediately) {
      setTimeout(() => {
        this.clickSendButton();
      }, 150);
    }

    return true;
  },

  /**
   * Finds and simulates clicking the send button
   */
  clickSendButton(): boolean {
    const sendBtn = (
      document.querySelector(WHATSAPP_SELECTORS.SEND_BUTTON) ||
      document.querySelector(WHATSAPP_SELECTORS.SEND_BUTTON_FALLBACK) ||
      document.getElementById("wa-send-btn")
    ) as HTMLElement | null;

    if (sendBtn) {
      sendBtn.click();
      return true;
    }
    return false;
  },

  /**
   * Scrapes active chat header info from #main header dynamically
   */
  getActiveChatInfo(): { name: string; phone: string; isGroup: boolean } | null {
    const mainHeader = document.querySelector(WHATSAPP_SELECTORS.CHAT_HEADER);
    if (!mainHeader) return null;

    const titleEl =
      document.querySelector(WHATSAPP_SELECTORS.CHAT_TITLE) ||
      mainHeader.querySelector("span[title]");
    const subtitleEl =
      document.querySelector(WHATSAPP_SELECTORS.CHAT_SUBTITLE) ||
      mainHeader.querySelector("span[dir='auto']");

    const rawTitle = titleEl?.getAttribute("title") || titleEl?.textContent?.trim() || "";
    const rawSubtitle = subtitleEl?.getAttribute("title") || subtitleEl?.textContent?.trim() || "";

    if (!rawTitle) return null;

    // Detect phone number in title or subtitle
    const phoneMatch = (rawTitle + " " + rawSubtitle).match(/\+?\d[\d\s\-\(\)]{8,}\d/);
    let extractedPhone = "";
    if (phoneMatch) {
      extractedPhone = "+" + phoneMatch[0].replace(/\D/g, "");
    }

    const isGroup = rawSubtitle.toLowerCase().includes("grupo") || rawSubtitle.toLowerCase().includes("group");

    return {
      name: rawTitle,
      phone: extractedPhone,
      isGroup,
    };
  },

  /**
   * Registers a managed MutationObserver and prevents memory leaks
   */
  registerObserver(observer: MutationObserver) {
    this.activeObservers.push(observer);
  },

  /**
   * Clean up all observers (Fase 4: Prueba de Consumo de Recursos y Memory Leaks)
   */
  cleanupObservers() {
    this.activeObservers.forEach((obs) => obs.disconnect());
    this.activeObservers = [];
  },
};

