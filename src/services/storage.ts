export interface OmniFlowConfig {
  baseUrl: string;
  tenantId: string;
  operatorToken: string;
  operatorName: string;
  operatorEmail: string;
  autoTakeoverOnType: boolean;
  autoAnalyzeCopilot: boolean;
  theme: "light" | "dark";
}

const DEFAULT_CONFIG: OmniFlowConfig = {
  baseUrl: "https://api.omniflow.cloud",
  tenantId: "tenant_latam_asuncion_01",
  operatorToken: "of_op_jwt_98f4a13c92e44d5ba7",
  operatorName: "Carlos Benítez (Operador Senior)",
  operatorEmail: "carlos.b@omniflow.lat",
  autoTakeoverOnType: true,
  autoAnalyzeCopilot: true,
  theme: "light",
};

const STORAGE_KEY = "omniflow_extension_storage_v1";

export const storageService = {
  getConfig(): OmniFlowConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_CONFIG;
  },

  saveConfig(newConfig: Partial<OmniFlowConfig>): OmniFlowConfig {
    const current = this.getConfig();
    const updated = { ...current, ...newConfig };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save config to local storage:", e);
    }
    return updated;
  },

  resetDefaults(): OmniFlowConfig {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_CONFIG;
  },
};
