import { storageService } from "./storage";

/**
 * Background Service Worker Bridge Proxy
 * Mimics chrome.runtime.sendMessage to Background Worker for secure HTTP requests
 * as detailed in Phase 2 & 3
 */

export interface BackgroundWorkerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  workerTimestamp: string;
}

export const apiClient = {
  async sendViaWorker<T>(endpoint: string, options?: RequestInit): Promise<BackgroundWorkerResponse<T>> {
    const config = storageService.getConfig();
    
    // Check if relative API endpoint for backend
    const url = endpoint.startsWith("/api") ? endpoint : `${config.baseUrl}${endpoint}`;

    try {
      const headers = {
        "Content-Type": "application/json",
        "X-OmniFlow-Tenant": config.tenantId,
        "Authorization": `Bearer ${config.operatorToken}`,
        ...(options?.headers || {}),
      };

      const res = await fetch(url, {
        ...options,
        headers,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        success: true,
        data,
        workerTimestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      console.warn(`[Background Worker Proxy] Error invoking ${endpoint}:`, err.message);
      return {
        success: false,
        error: err.message,
        workerTimestamp: new Date().toISOString(),
      };
    }
  },
};
