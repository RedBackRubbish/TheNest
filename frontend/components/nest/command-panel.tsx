"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// WebSocket message types
interface LogMessage {
  type: "log";
  timestamp: string;
  agent: string;
  status: string;
  message: string;
}

interface StateChangeMessage {
  type: "state_change";
  node: string;
  status: string;
}

interface ArtifactMessage {
  type: "artifact";
  code: string;
  verdict: string;
}

interface FinalVerdictMessage {
  type: "final_verdict";
  result: string;
  reason?: string;
  appealable?: boolean;
}

type WSMessage = LogMessage | StateChangeMessage | ArtifactMessage | FinalVerdictMessage | { type: "error"; message: string };

// Terminal log entry
interface TerminalEntry {
  id: string;
  timestamp: string;
  agent: string;
  status: string;
  message: string;
}

// Agent node states
interface AgentStates {
  ONYX: "IDLE" | "ACTIVE";
  IGNIS: "IDLE" | "ACTIVE";
  HYDRA: "IDLE" | "ACTIVE";
}

export function CommandPanel() {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<TerminalEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [artifact, setArtifact] = useState<string | null>(null);
  const [agentStates, setAgentStates] = useState<AgentStates>({
    ONYX: "IDLE",
    IGNIS: "IDLE",
    HYDRA: "IDLE",
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addLog = useCallback((agent: string, status: string, message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        agent,
        status,
        message,
      },
    ]);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || isProcessing) return;

    const mission = input.trim();
    setInput("");
    setIsProcessing(true);
    setArtifact(null);

    // Connect WebSocket
    const ws = new WebSocket("ws://localhost:8000/ws/senate");
    wsRef.current = ws;

    ws.onopen = () => {
      addLog("SYSTEM", "CONNECT", "WebSocket connected to Senate");
      ws.send(JSON.stringify({ mission }));
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);

        switch (msg.type) {
          case "log":
            addLog(msg.agent, msg.status, msg.message);
            break;

          case "state_change":
            setAgentStates((prev) => ({
              ...prev,
              [msg.node]: msg.status as "IDLE" | "ACTIVE",
            }));
            break;

          case "artifact":
            setArtifact(msg.code);
            addLog("SYSTEM", "ARTIFACT", `Code generated (${msg.code.length} chars)`);
            break;

          case "final_verdict":
            addLog("SENATE", msg.result, msg.reason || "Session complete");
            setIsProcessing(false);
            setAgentStates({ ONYX: "IDLE", IGNIS: "IDLE", HYDRA: "IDLE" });
            ws.close();
            break;

          case "error":
            addLog("ERROR", "FATAL", msg.message);
            setIsProcessing(false);
            ws.close();
            break;
        }
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onerror = () => {
      addLog("SYSTEM", "ERROR", "WebSocket connection failed");
      setIsProcessing(false);
    };

    ws.onclose = () => {
      wsRef.current = null;
    };
  }, [input, isProcessing, addLog]);

  return (
    <div className="h-full flex flex-col relative">
      {/* Agent Status Bar */}
      <div className="px-6 py-3 border-b border-white/5 flex items-center gap-6">
        <span className="chassis-label text-zinc-600">AGENTS</span>
        {(["ONYX", "IGNIS", "HYDRA"] as const).map((agent) => (
          <AgentNode key={agent} name={agent} status={agentStates[agent]} />
        ))}
      </div>

      {/* Terminal Log */}
      <div 
        ref={logContainerRef}
        className="flex-1 overflow-auto p-4 pb-28 font-mono text-xs"
      >
        <div className="max-w-4xl mx-auto space-y-0.5">
          {logs.length === 0 ? (
            <div className="text-center py-20">
              <div className="chassis-label text-zinc-600 mb-2">TERMINAL READY</div>
              <p className="text-zinc-700 text-xs font-mono">
                Enter directive below to initialize Senate session
              </p>
            </div>
          ) : (
            logs.map((entry) => (
              <TerminalLine key={entry.id} entry={entry} />
            ))
          )}
          
          {/* Show artifact if generated */}
          {artifact && (
            <div className="mt-4 p-3 bg-white/[0.02] border border-white/10 rounded">
              <div className="chassis-label text-zinc-500 mb-2">ARTIFACT OUTPUT</div>
              <pre className="text-zinc-400 text-[10px] overflow-x-auto whitespace-pre-wrap">
                {artifact.slice(0, 2000)}
                {artifact.length > 2000 && "\n... (truncated)"}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Floating Command Bar */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6">
        <div className="w-full max-w-3xl command-float rounded-lg p-1">
          <div className="flex items-center gap-2">
            {/* Terminal Prefix */}
            <span className="pl-3 font-mono text-xs text-zinc-600 select-none">
              root@nest:~$
            </span>
            
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Awaiting Executive Directive..."
              disabled={isProcessing}
              className="flex-1 px-2 py-2 bg-transparent font-mono text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none disabled:opacity-50"
            />

            {/* Blinking cursor when empty */}
            {!input && !isProcessing && (
              <span className="font-mono text-sm text-[#3b82f6] animate-pulse">▋</span>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !input.trim()}
              className="px-3 py-1.5 bg-white/5 border border-white/10 text-zinc-400 text-xs font-mono uppercase tracking-wider rounded hover:bg-white/10 hover:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? "EXEC..." : "EXEC"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentNode({ name, status }: { name: string; status: "IDLE" | "ACTIVE" }) {
  const isActive = status === "ACTIVE";
  
  const colors: Record<string, { active: string; glow: string }> = {
    ONYX: { active: "#3b82f6", glow: "#3b82f6" },
    IGNIS: { active: "#f59e0b", glow: "#f59e0b" },
    HYDRA: { active: "#ef4444", glow: "#ef4444" },
  };

  const color = colors[name] || { active: "#22c55e", glow: "#22c55e" };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 rounded-full transition-all duration-300"
        style={{
          backgroundColor: isActive ? color.active : "#27272a",
          boxShadow: isActive ? `0 0 8px ${color.glow}` : "none",
        }}
      />
      <span className={`text-[10px] font-mono tracking-wider ${isActive ? "text-zinc-300" : "text-zinc-600"}`}>
        {name}
      </span>
    </div>
  );
}

function TerminalLine({ entry }: { entry: TerminalEntry }) {
  // Status-based coloring
  const statusColors: Record<string, string> = {
    RECEIVED: "text-zinc-500",
    CONNECT: "text-zinc-500",
    AUDITING: "text-blue-400/70",
    FORGING: "text-amber-400/70",
    INJECTING: "text-red-400/70",
    DELIBERATING: "text-blue-400/70",
    COMPLETE: "text-zinc-400",
    AUTHORIZE: "text-emerald-400",
    AUTHORIZED: "text-emerald-400",
    VETO: "text-red-400",
    VETOED: "text-red-400",
    WARNING: "text-amber-400",
    SKIPPED: "text-zinc-600",
    ERROR: "text-red-500",
    FATAL: "text-red-500",
    ARTIFACT: "text-cyan-400/70",
  };

  const agentColors: Record<string, string> = {
    SYSTEM: "text-zinc-600",
    ONYX: "text-blue-500/80",
    IGNIS: "text-amber-500/80",
    HYDRA: "text-red-500/80",
    SENATE: "text-purple-400/80",
    ERROR: "text-red-600",
  };

  const time = entry.timestamp.slice(11, 19);
  const statusColor = statusColors[entry.status] || "text-zinc-400";
  const agentColor = agentColors[entry.agent] || "text-zinc-500";

  return (
    <div className="flex items-start gap-2 py-0.5 hover:bg-white/[0.01]">
      <span className="text-zinc-700 tabular-nums shrink-0">{time}</span>
      <span className={`shrink-0 w-14 ${agentColor}`}>[{entry.agent}]</span>
      <span className={`shrink-0 w-20 ${statusColor}`}>{entry.status}</span>
      <span className="text-zinc-400 break-all">{entry.message}</span>
    </div>
  );
}
