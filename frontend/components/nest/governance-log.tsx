"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { nestAPI, DeliberationEvent } from "@/lib/api";

interface LogEntry {
  id: string;
  timestamp: string;
  agent: "ONYX" | "IGNIS" | "HYDRA" | "SYSTEM";
  type: "info" | "success" | "warning" | "error";
  message: string;
}

const agentColors: Record<string, string> = {
  ONYX: "#a855f7",
  IGNIS: "#f97316",
  HYDRA: "#22c55e",
  SYSTEM: "#eab308",
};

const typeColors: Record<string, string> = {
  info: "#60a5fa",
  success: "#22c55e",
  warning: "#eab308",
  error: "#ef4444",
};

export function GovernanceLog() {
  const [expanded, setExpanded] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Determine API URL
    // In production, Next.js environment variables should be used. 
    // If running on Vercel, relative path might work for API routes, but 
    // for external backend (Railway), we need the full URL.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    if (!nestAPI.isConfigured()) {
       nestAPI.configure(apiUrl);
    }

    const cleanup = nestAPI.connectWebSocket((event: DeliberationEvent) => {
        if (!event) return;
        
        // Ensure timestamp exists and is formatted
        let timeStr = new Date().toLocaleTimeString();
        if (event.timestamp) {
            try {
                timeStr = new Date(event.timestamp).toLocaleTimeString();
            } catch (e) {
                console.error("Invalid timestamp", event.timestamp);
            }
        }
        
        // Map Phase/Message to Visual Type
        let msgType: LogEntry["type"] = "info";
        if (event.phase === "VERDICT") {
             // Check content for success/failure
             if (event.message && (event.message.includes("PASSED") || event.message.includes("APPROVED"))) {
                 msgType = "success";
             } else {
                 msgType = "error";
             }
        } else if (event.phase === "PROPOSAL") {
             msgType = "success";
        } else if (event.phase === "CONVENING") {
             msgType = "info";
        } else if (event.agent === "HYDRA") {
             msgType = "warning";
        }
        
        const newLog: LogEntry = {
            id: Math.random().toString(36).substring(7),
            timestamp: timeStr,
            agent: (event.agent as any) || "SYSTEM",
            type: msgType,
            message: event.message || JSON.stringify(event)
        };
        
        setLogs(prev => [...prev, newLog]);
    });
    
    return cleanup;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber" />
          <span className="font-mono text-sm">Live Governance Log</span>
          <span className="px-2 py-0.5 rounded text-xs bg-amber/20 text-amber font-mono">
            {logs.length} entries
          </span>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {expanded && (
        <div
          ref={scrollRef}
          className="h-64 overflow-y-auto p-4 font-mono text-xs bg-black/50"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {logs.length === 0 && (
              <div className="text-muted-foreground italic flex flex-col gap-2">
                  <span>Waiting for Senate session...</span>
                  <span className="text-xs opacity-50">System ready.</span>
              </div>
          )}
          {logs.map((log) => {
            if (!log) return null;
            return (
              <div key={log.id} className="flex gap-2 mb-1 leading-relaxed">
                <span className="text-muted-foreground">[{log.timestamp}]</span>
                <span style={{ color: agentColors[log.agent] || agentColors.SYSTEM }} className="terminal-glow">
                  [{log.agent}]
                </span>
                <span style={{ color: typeColors[log.type] }}>{log.message}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-1 text-muted-foreground mt-2">
            <span className="animate-pulse">▌</span>
            <span>Awaiting next directive...</span>
          </div>
        </div>
      )}
    </div>
  );
}
