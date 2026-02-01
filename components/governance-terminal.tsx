"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Terminal } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

const initialLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: "2024.12.15 08:42:11",
    type: "success",
    message: "System initialized. All governance nodes online.",
  },
  {
    id: "2",
    timestamp: "2024.12.15 08:42:13",
    type: "info",
    message: "Connecting to Senate Chamber...",
  },
  {
    id: "3",
    timestamp: "2024.12.15 08:42:15",
    type: "success",
    message: "Connection established. Awaiting directives.",
  },
  {
    id: "4",
    timestamp: "2024.12.15 08:42:18",
    type: "warning",
    message: "No active missions in queue.",
  },
  {
    id: "5",
    timestamp: "2024.12.15 08:42:20",
    type: "info",
    message: "Entering standby mode...",
  },
];

const additionalLogs: Omit<LogEntry, "id" | "timestamp">[] = [
  { type: "info", message: "Heartbeat check... All systems nominal." },
  { type: "success", message: "Memory optimization complete." },
  { type: "info", message: "Scanning for new mission proposals..." },
  { type: "warning", message: "Network latency detected: 12ms" },
  { type: "success", message: "Security protocols verified." },
  { type: "info", message: "Synchronizing with remote nodes..." },
  { type: "error", message: "Failed to reach Node-7. Retrying..." },
  { type: "success", message: "Node-7 connection restored." },
];

export function GovernanceTerminal() {
  const [collapsed, setCollapsed] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const scrollRef = useRef<HTMLDivElement>(null);
  const logIndexRef = useRef(0);

  // Simulate live log updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = additionalLogs[logIndexRef.current % additionalLogs.length];
      const now = new Date();
      const timestamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

      setLogs((prev) => [
        ...prev.slice(-50),
        {
          ...newLog,
          id: `log-${Date.now()}`,
          timestamp,
        },
      ]);
      logIndexRef.current++;
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current && !collapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, collapsed]);

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-blue-400";
    }
  };

  const getTypePrefix = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "[OK]";
      case "error":
        return "[ERR]";
      case "warning":
        return "[WARN]";
      default:
        return "[INFO]";
    }
  };

  return (
    <div
      className={cn(
        "border-t border-white/10 bg-zinc-950/90 backdrop-blur-xl transition-all duration-300",
        collapsed ? "h-12" : "h-64"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-white/10 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-green-500" />
          <span className="text-xs font-medium text-foreground uppercase tracking-wider">
            Live Governance Log
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
            <span className="text-[10px] text-muted-foreground">CONNECTED</span>
          </div>
        </div>
        {collapsed ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Terminal Content */}
      {!collapsed && (
        <div
          ref={scrollRef}
          className="h-[calc(100%-48px)] overflow-y-auto terminal-scroll p-4 font-mono text-xs"
          style={{ fontFamily: "var(--font-jetbrains), monospace" }}
        >
          {logs.map((log, index) => (
            <div
              key={log.id}
              className={cn(
                "flex gap-3 mb-1.5 opacity-0",
                index === logs.length - 1 ? "animate-fade-in-up" : "opacity-100"
              )}
              style={{
                animationDelay: index === logs.length - 1 ? "0ms" : undefined,
              }}
            >
              <span className="text-muted-foreground/60 shrink-0">
                {log.timestamp}
              </span>
              <span className={cn("shrink-0 w-12", getTypeColor(log.type))}>
                {getTypePrefix(log.type)}
              </span>
              <span className="text-foreground/80">{log.message}</span>
            </div>
          ))}
          {/* Blinking Cursor */}
          <div className="flex items-center gap-1 mt-2 text-green-500">
            <span className="text-muted-foreground/60">{">"}</span>
            <span className="animate-terminal-blink">_</span>
          </div>
        </div>
      )}
    </div>
  );
}
