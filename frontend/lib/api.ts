/**
 * The Nest API Client
 * Connects to the Python/FastAPI backend for governance operations
 */

export interface Mission {
  id?: string;
  directive: string;
  timestamp?: string;
}

export interface HealthStatus {
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  kernel_version?: string;
  uptime?: number;
}

export interface DeliberationEvent {
  phase: string;
  agent: string;
  message: string;
  timestamp: string;
}

export interface Verdict {
  status: "APPROVED" | "STOP_WORK_ORDER" | "FAILED_TESTS";
  champion?: string;
  rationale?: string;
  article_50?: boolean;
}

export interface ChronicleEntry {
  id: string;
  mission: string;
  verdict: Verdict;
  timestamp: string;
}

class NestAPIClient {
  private baseUrl: string = "";
  private ws: WebSocket | null = null;

  configure(url: string) {
    // Remove trailing slash if present
    this.baseUrl = url.replace(/\/$/, "");
  }

  isConfigured(): boolean {
    return this.baseUrl.length > 0;
  }

  async checkHealth(): Promise<HealthStatus> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error("Failed to connect to backend");
    }
    return response.json();
  }

  async submitMission(mission: Mission): Promise<{ mission_id: string }> {
    const response = await fetch(`${this.baseUrl}/missions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mission),
    });
    if (!response.ok) {
      throw new Error("Failed to submit mission");
    }
    return response.json();
  }

  async searchChronicle(query: string): Promise<ChronicleEntry[]> {
    const response = await fetch(
      `${this.baseUrl}/chronicle/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error("Failed to search chronicle");
    }
    return response.json();
  }

  connectWebSocket(onEvent: (event: DeliberationEvent) => void): () => void {
    const wsUrl = this.baseUrl.replace(/^http/, "ws") + "/ws/senate";
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEvent(data);
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Return cleanup function
    return () => {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    };
  }
}

// Export singleton instance
export const nestAPI = new NestAPIClient();
