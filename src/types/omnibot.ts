export type OmniBotMode = "ACTIVE" | "BOT_PAUSED" | "HUMAN_TAKEOVER";

export interface ToolInvocation {
  tool: string;
  status: "pending" | "executing" | "completed" | "failed";
  result?: string;
  timestamp?: string;
}

export interface CopilotSuggestion {
  intent: string;
  confidence: number;
  suggestedDraft: string;
  invokedTools: ToolInvocation[];
  reasoning: string;
  source?: string;
  generatedAt?: string;
}

export interface OmniBotSessionState {
  conversationId: string;
  e164Phone: string;
  botMode: OmniBotMode;
  isAiThinking: boolean;
  takeoverReason?: string;
  lastOperatorMessageAt?: string;
  lastCustomerMessageAt?: string;
  copilotSuggestion?: CopilotSuggestion | null;
  botConfig: {
    systemPromptPersona: string;
    temperature: number;
    autoTakeoverOnManualType: boolean;
    requireApprovalForQuotes: boolean;
    businessHoursEnforced: boolean;
  };
}
