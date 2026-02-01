"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Terminal, X } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: Date;
  agent: "ONYX" | "IGNIS" | "HYDRA" | "SENATE" | "SYSTEM";
  level: "info" | "warn" | "error" | "success";
  message: string;
}

interface GovernanceLogProps {
  entries?: LogEntry[];
  className?: string;
}

// Simulated log entries
const defaultEntries: LogEntry[] = [
  { id: "1", timestamp: new Date(), agent: "SYSTEM", level: "info", message: "Governance kernel initialized..." },
  { id: "2", timestamp: new Date(), agent: "ONYX", level: "info", message: "Sentinel protocols active" },
  { id: "3", timestamp: new Date(), agent: "IGNIS", level: "info", message: "Crucible temperature nominal" },
  { id: "4", timestamp: new Date(), agent: "HYDRA", level: "info", message: "Metamorphic engines ready" },
  { id: "5", timestamp: new Date(), agent: "SENATE", level: "success", message: "The Senate is in session" },
];

export function GovernanceLog({ entries: propEntries, className }: GovernanceLogProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [entries, setEntries] = useState<LogEntry[]>(propEntries || defaultEntries);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (scrollRef.current && !isCollapsed) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, isCollapsed]);

  // Simulate incoming logs
  useEffect(() => {
    const messages = [
      { agent: "SYSTEM" as const, message: "Health check: All dragons responding" },
      { agent: "ONYX" as const, message: "Scanning for pending missions..." },
      { agent: "IGNIS" as const, message: "Cache warmed: 847 patterns indexed" },
      { agent: "HYDRA" as const, message: "Threat matrix updated" },
      { agent: "SENATE" as const, message: "Quorum maintained: 4/4 agents active" },
    ];

    const interval = setInterval(() => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const newEntry: LogEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        agent: randomMessage.agent,
        level: "info",
        message: randomMessage.message,
      };
      setEntries((prev) => [...prev.slice(-50), newEntry]); // Keep last 50 entries
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getAgentColor = (agent: LogEntry["agent"]) => {
    switch (agent) {
      case "ONYX":
        return "text-onyx";
      case "IGNIS":
        return "text-ignis";
      case "HYDRA":
        return "text-hydra";
      case "SENATE":
        return "text-amber";
      case "SYSTEM":
        return "text-muted-foreground";
    }
  };

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "success":
        return "text-hydra";
      case "warn":
        return "text-ignis";
      case "error":
        return "text-destructive";
      default:
        return "text-foreground/80";
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={cn(
          "fixed bottom-4 right-4 flex items-center gap-2 rounded-lg border border-white/[0.08] bg-zinc-950/90 backdrop-blur-xl px-4 py-2 text-muted-foreground hover:text-foreground hover:border-amber/30 transition-all z-50",
          className
        )}
      >
        <Terminal className="h-4 w-4 text-hydra" />
        <span className="font-mono text-xs">GOVERNANCE LOG</span>
        <span className="h-2 w-2 rounded-full bg-hydra animate-pulse" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col border-t border-white/[0.08] bg-zinc-950/90 backdrop-blur-xl transition-all duration-300",
        isCollapsed ? "h-12" : "h-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.08] px-4">
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-hydra" />
          <span className="font-mono text-sm text-foreground">LIVE GOVERNANCE LOG</span>
          <span className="h-2 w-2 rounded-full bg-hydra animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors"
          >
            {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Log Content */}
      {!isCollapsed && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-sm"
          style={{
            background: `
              linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 0, 0.01) 2px,
                rgba(0, 255, 0, 0.01) 4px
              )
            `,
          }}
        >
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-4 py-1 hover:bg-white/[0.02]">
              {/* Timestamp */}
              <span className="shrink-0 text-xs text-muted-foreground/60">
                {entry.timestamp.toLocaleTimeString("en-US", { hour12: false })}
              </span>

              {/* Agent Tag */}
              <span className={cn("shrink-0 w-16 text-xs font-semibold", getAgentColor(entry.agent))}>
                [{entry.agent}]
              </span>

              {/* Message */}
              <span className={cn("text-xs", getLevelColor(entry.level))}>{entry.message}</span>
            </div>
          ))}

          {/* Cursor blink */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-hydra text-xs">$</span>
            <span className="h-4 w-2 bg-hydra/80 animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
