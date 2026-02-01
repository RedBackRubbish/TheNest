"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Terminal } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  agent: "ONYX" | "IGNIS" | "HYDRA" | "SYSTEM";
  type: "info" | "success" | "warning" | "error";
  message: string;
}

const agentColors = {
  ONYX: "#a855f7",
  IGNIS: "#f97316",
  HYDRA: "#22c55e",
  SYSTEM: "#eab308",
};

const typeColors = {
  info: "#60a5fa",
  success: "#22c55e",
  warning: "#eab308",
  error: "#ef4444",
};

const mockLogs: LogEntry[] = [
  { id: "1", timestamp: "14:32:01", agent: "SYSTEM", type: "info", message: "Senate session initialized" },
  { id: "2", timestamp: "14:32:02", agent: "ONYX", type: "info", message: "Intent validation started..." },
  { id: "3", timestamp: "14:32:03", agent: "ONYX", type: "success", message: "INTENT_CLEARED - No malicious patterns detected" },
  { id: "4", timestamp: "14:32:04", agent: "IGNIS", type: "info", message: "Crucible ignited. Generating 3 variants..." },
  { id: "5", timestamp: "14:32:06", agent: "IGNIS", type: "success", message: "Variant SPEED generated (98ms execution)" },
  { id: "6", timestamp: "14:32:07", agent: "IGNIS", type: "success", message: "Variant SAFETY generated (A+ security score)" },
  { id: "7", timestamp: "14:32:08", agent: "IGNIS", type: "success", message: "Variant CLARITY generated (92% readability)" },
  { id: "8", timestamp: "14:32:09", agent: "HYDRA", type: "warning", message: "Entering The Gauntlet. Initiating chaos injection..." },
  { id: "9", timestamp: "14:32:11", agent: "HYDRA", type: "info", message: "Test suite: boundary_overflow, sql_injection, race_condition" },
  { id: "10", timestamp: "14:32:14", agent: "HYDRA", type: "success", message: "All candidates survived. SAFETY selected as champion." },
  { id: "11", timestamp: "14:32:15", agent: "ONYX", type: "info", message: "Final audit commencing..." },
  { id: "12", timestamp: "14:32:16", agent: "ONYX", type: "success", message: "VERDICT: APPROVED - Code passes all governance checks" },
];

export function GovernanceLog() {
  const [expanded, setExpanded] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < mockLogs.length) {
        setLogs((prev) => [...prev, mockLogs[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
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
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2 mb-1 leading-relaxed">
              <span className="text-muted-foreground">[{log.timestamp}]</span>
              <span style={{ color: agentColors[log.agent] }} className="terminal-glow">
                [{log.agent}]
              </span>
              <span style={{ color: typeColors[log.type] }}>{log.message}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="animate-pulse">▌</span>
            <span>Awaiting next directive...</span>
          </div>
        </div>
      )}
    </div>
  );
}
