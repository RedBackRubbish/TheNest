/**
 * THE NEST — API Client
 * Constitutional AI Governance System
 * 
 * This module provides typed API access to the backend kernel.
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// =============================================================================
// TYPES — Matching Backend Pydantic Models
// =============================================================================

export interface Telemetry {
  uptime_seconds: number;
  cpu_usage_percent: number;
  ram_usage_mb: number;
  governance_mode: string;
  active_agents: string[];
  latency_ms: number;
  kernel_status: string;
}

export interface HydraFinding {
  pattern_matched: string;
  excerpt: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
}

export interface Vote {
  agent: string;
  verdict: "AUTHORIZE" | "VETO" | "ABSTAIN";
  reasoning: string;
  confidence: number;
  governance_mode_active: boolean;
  hydra_findings_cited: boolean;
}

export interface SenateRecord {
  state: "pending" | "null_verdict" | "awaiting_appeal" | "authorized" | "ungoverned" | "hydra_override";
  intent: string;
  ignis_proposal: string | null;
  hydra_report: string | null;
  hydra_findings: HydraFinding[];
  votes: Vote[];
  appealable: boolean;
  metadata: Record<string, unknown>;
}

export interface MissionResponse {
  status: "APPROVED" | "STOP_WORK_ORDER" | "FAILED_TESTS" | "UNKNOWN_VERDICT" | "PROCESSING";
  mission: string;
  artifact: Record<string, unknown> | null;
  verdict: Record<string, unknown> | null;
  message: string | null;
}

export interface ChronicleCase {
  id: string;
  case_type: "precedent" | "appeal" | "null_verdict" | "ungoverned";
  question: string;
  ruling: "approved" | "refused" | "ungoverned" | "overturned" | "upheld";
  timestamp: string;
  appeal_count: number;
  votes: Vote[];
  artifact_hash?: string;
  metadata?: Record<string, unknown>;
}

export interface AppealRequest {
  case_id: string;
  expanded_context: Record<string, unknown>;
  constraint_changes: Record<string, unknown>;
  appellant_reason: string;
}

export interface AppealResponse {
  appeal_id: string;
  original_case_id: string;
  status: "UPHELD" | "OVERTURNED" | "MODIFIED";
  original_ruling: string;
  new_ruling: string;
  appeal_depth: number;
  liability_multiplier: number;
  chronicle_citations: string[];
  message: string;
}

// WebSocket Message Types
export interface WSLogMessage {
  type: "log";
  timestamp: string;
  agent: string;
  status: string;
  message: string;
}

export interface WSStateChangeMessage {
  type: "state_change";
  node: "ONYX" | "IGNIS" | "HYDRA";
  status: "ACTIVE" | "IDLE";
}

export interface WSArtifactMessage {
  type: "artifact";
  code: string;
  verdict: string;
}

export interface WSFinalVerdictMessage {
  type: "final_verdict";
  result: "AUTHORIZED" | "VETOED" | "HYDRA_OVERRIDE" | "UNGOVERNED";
  reason?: string;
  appealable?: boolean;
  hydra_override?: boolean;
  unacknowledged_findings?: number;
  risk_acknowledged?: boolean;
}

export interface WSErrorMessage {
  type: "error";
  message: string;
}

export type WSMessage = 
  | WSLogMessage 
  | WSStateChangeMessage 
  | WSArtifactMessage 
  | WSFinalVerdictMessage 
  | WSErrorMessage;

// =============================================================================
// API CLIENT
// =============================================================================

class NestAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  configure(url: string) {
    this.baseUrl = url.replace(/\/$/, "");
  }

  isConfigured(): boolean {
    return this.baseUrl.length > 0;
  }

  // Health Check
  async health(): Promise<{ status: string; governance: string; mode: string }> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json();
  }

  // Alias for backward compatibility
  async checkHealth() {
    return this.health();
  }

  // System Telemetry
  async getTelemetry(): Promise<Telemetry> {
    const res = await fetch(`${this.baseUrl}/system/telemetry`);
    if (!res.ok) throw new Error(`Telemetry failed: ${res.status}`);
    return res.json();
  }

  // Submit Mission
  async submitMission(mission: string, context?: Record<string, unknown>): Promise<MissionResponse> {
    const res = await fetch(`${this.baseUrl}/missions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mission, context }),
    });
    if (!res.ok) throw new Error(`Mission failed: ${res.status}`);
    return res.json();
  }

  // Chronicle Search
  async searchChronicle(query: string): Promise<{ query: string; count: number; results: ChronicleCase[] }> {
    const res = await fetch(`${this.baseUrl}/chronicle/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`Chronicle search failed: ${res.status}`);
    return res.json();
  }

  // Get Case by ID
  async getCase(caseId: string): Promise<ChronicleCase> {
    const res = await fetch(`${this.baseUrl}/chronicle/case/${encodeURIComponent(caseId)}`);
    if (!res.ok) throw new Error(`Case not found: ${res.status}`);
    return res.json();
  }

  // Get Appeals for Case
  async getCaseAppeals(caseId: string): Promise<{ case_id: string; appeal_count: number; appeals: ChronicleCase[] }> {
    const res = await fetch(`${this.baseUrl}/chronicle/case/${encodeURIComponent(caseId)}/appeals`);
    if (!res.ok) throw new Error(`Appeals fetch failed: ${res.status}`);
    return res.json();
  }

  // Submit Appeal
  async submitAppeal(request: AppealRequest): Promise<AppealResponse> {
    const res = await fetch(`${this.baseUrl}/appeals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || `Appeal failed: ${res.status}`);
    }
    return res.json();
  }

  // WebSocket Connection to Senate
  createSenateConnection(
    onMessage: (msg: WSMessage) => void,
    onOpen?: () => void,
    onClose?: () => void,
    onError?: (error: Event) => void
  ): WebSocket {
    const wsUrl = this.baseUrl.replace(/^http/, "ws") + "/ws/senate";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => onOpen?.();
    ws.onclose = () => onClose?.();
    ws.onerror = (e) => onError?.(e);
    
    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        onMessage(msg);
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    return ws;
  }

  // Legacy method for backward compatibility
  connectWebSocket(onEvent: (event: WSLogMessage) => void): () => void {
    const ws = this.createSenateConnection(
      (msg) => {
        if (msg.type === "log") {
          onEvent(msg);
        }
      }
    );
    return () => ws.close();
  }
}

// Export singleton instance
export const nestAPI = new NestAPIClient();
export const api = nestAPI;
export { NestAPIClient };
export default nestAPI;


