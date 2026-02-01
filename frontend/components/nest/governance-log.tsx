"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronUp, Terminal, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  timestamp: string;
  agent: "ONYX" | "IGNIS" | "HYDRA" | "SYSTEM";
  type: "info" | "success" | "warning" | "error";
  message: string;
}

const agentConfig = {
  ONYX: { color: "#a855f7", emoji: "🛡️" },
  IGNIS: { color: "#f97316", emoji: "🔥" },
  HYDRA: { color: "#22c55e", emoji: "🐉" },
  SYSTEM: { color: "#eab308", emoji: "⚡" },
};

const typeConfig = {
  info: { color: "#60a5fa", icon: "●" },
  success: { color: "#22c55e", icon: "✓" },
  warning: { color: "#eab308", icon: "⚠" },
  error: { color: "#ef4444", icon: "✕" },
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
    }, 600);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-panel rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(234, 179, 8, 0.4)",
                "0 0 0 8px rgba(234, 179, 8, 0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Terminal className="w-5 h-5 text-amber" />
          </motion.div>
          <span className="font-medium">Live Governance Log</span>
          <motion.span
            className="px-2.5 py-1 rounded-full text-xs font-mono bg-amber/10 text-amber border border-amber/20"
            animate={{
              scale: logs.length > 0 ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
            key={logs.length}
          >
            {logs.length} entries
          </motion.span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* Log Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              ref={scrollRef}
              className="h-64 overflow-y-auto px-5 pb-4 font-mono text-sm bg-black/30"
            >
              {/* Scanlines Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)]" />

              <AnimatePresence>
                {logs.map((log, index) => {
                  const agent = agentConfig[log.agent];
                  const type = typeConfig[log.type];

                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-2 py-1.5 group"
                    >
                      {/* Timestamp */}
                      <span className="text-muted-foreground/60 text-xs shrink-0">
                        [{log.timestamp}]
                      </span>

                      {/* Type Indicator */}
                      <motion.span
                        style={{ color: type.color }}
                        className="shrink-0 text-xs"
                        animate={
                          log.type === "warning" || log.type === "error"
                            ? { opacity: [1, 0.5, 1] }
                            : {}
                        }
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {type.icon}
                      </motion.span>

                      {/* Agent Badge */}
                      <span
                        className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{
                          color: agent.color,
                          backgroundColor: `${agent.color}15`,
                          textShadow: `0 0 10px ${agent.color}`,
                        }}
                      >
                        {log.agent}
                      </span>

                      {/* Message */}
                      <span
                        className="flex-1 transition-colors"
                        style={{ color: type.color }}
                      >
                        {log.message}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Cursor */}
              <motion.div
                className="flex items-center gap-2 text-muted-foreground mt-2"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="text-amber">▌</span>
                <span className="text-xs">Awaiting next directive...</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
