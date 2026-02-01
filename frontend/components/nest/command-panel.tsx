"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { SenateFlow, SenateFlowCompact, type AgentStatus } from "./senate-flow";
import type { WSMessage, WSLogMessage, WSFinalVerdictMessage } from "@/lib/api";

// Terminal log entry
interface TerminalEntry {
  id: string;
  timestamp: string;
  agent: string;
  status: string;
  message: string;
  isSystem?: boolean;
  isHydraBinding?: boolean;
}

// Agent node states
interface AgentStates {
  ONYX: AgentStatus;
  IGNIS: AgentStatus;
  HYDRA: AgentStatus;
}

// Session state
interface SessionState {
  isProcessing: boolean;
  artifact: string | null;
  finalVerdict: WSFinalVerdictMessage | null;
  hydraFindings: number;
  wasOverridden: boolean;
  isAppealable: boolean;
  lastCaseId: string | null;
}

export function CommandPanel() {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<TerminalEntry[]>([]);
  const [article50Mode, setArticle50Mode] = useState(false);
  const [agentStates, setAgentStates] = useState<AgentStates>({
    ONYX: "IDLE",
    IGNIS: "IDLE",
    HYDRA: "IDLE",
  });
  const [session, setSession] = useState<SessionState>({
    isProcessing: false,
    artifact: null,
    finalVerdict: null,
    hydraFindings: 0,
    wasOverridden: false,
    isAppealable: false,
    lastCaseId: null,
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

  const addLog = useCallback(
    (agent: string, status: string, message: string, extra?: { isSystem?: boolean; isHydraBinding?: boolean }) => {
      setLogs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          agent,
          status,
          message,
          ...extra,
        },
      ]);
    },
    []
  );

  const handleMessage = useCallback(
    (msg: WSMessage) => {
      switch (msg.type) {
        case "log":
          const isHydra = msg.status === "CRITICAL" || msg.status === "OVERRIDE";
          addLog(msg.agent, msg.status, msg.message, { isHydraBinding: isHydra });
          break;

        case "state_change":
          setAgentStates((prev) => ({
            ...prev,
            [msg.node]: msg.status === "ACTIVE" ? "ACTIVE" : "IDLE",
          }));
          break;

        case "artifact":
          setSession((prev) => ({ ...prev, artifact: msg.code }));
          addLog("SYSTEM", "ARTIFACT", `Artifact generated (${msg.code.length} chars)`, { isSystem: true });
          break;

        case "final_verdict":
          setSession((prev) => ({
            ...prev,
            isProcessing: false,
            finalVerdict: msg,
            wasOverridden: msg.hydra_override || false,
            isAppealable: msg.appealable || false,
            hydraFindings: msg.unacknowledged_findings || prev.hydraFindings,
          }));
          
          const resultColor = msg.result === "AUTHORIZED" ? "✓" : msg.result === "HYDRA_OVERRIDE" ? "🚨" : "✗";
          addLog("SENATE", msg.result, `${resultColor} Session complete. ${msg.reason || ""}`);
          
          setAgentStates({ ONYX: "IDLE", IGNIS: "IDLE", HYDRA: "IDLE" });
          break;

        case "error":
          addLog("ERROR", "FATAL", msg.message);
          setSession((prev) => ({ ...prev, isProcessing: false }));
          break;
      }
    },
    [addLog]
  );

  const handleSubmit = useCallback(() => {
    if (!input.trim() || session.isProcessing) return;

    const mission = input.trim();
    setInput("");
    setSession({
      isProcessing: true,
      artifact: null,
      finalVerdict: null,
      hydraFindings: 0,
      wasOverridden: false,
      isAppealable: false,
      lastCaseId: null,
    });

    // Connect WebSocket
    const ws = new WebSocket("ws://localhost:8000/ws/senate");
    wsRef.current = ws;

    ws.onopen = () => {
      addLog("SYSTEM", "UPLINK", "Neural link established to Senate chamber", { isSystem: true });
      ws.send(JSON.stringify({ mission, allow_ungoverned: article50Mode }));
      
      if (article50Mode) {
        addLog("SYSTEM", "ART.50", "⚠️ MARTIAL GOVERNANCE INVOKED — Liability attached to Keeper", { isSystem: true });
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        handleMessage(msg);
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onerror = () => {
      addLog("SYSTEM", "ERROR", "WebSocket connection failed — check backend status", { isSystem: true });
      setSession((prev) => ({ ...prev, isProcessing: false }));
    };

    ws.onclose = () => {
      wsRef.current = null;
    };
  }, [input, session.isProcessing, article50Mode, addLog, handleMessage]);

  const handleAppeal = useCallback(() => {
    // TODO: Implement appeal modal
    addLog("SYSTEM", "APPEAL", "Appeal submission UI coming soon...", { isSystem: true });
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setSession({
      isProcessing: false,
      artifact: null,
      finalVerdict: null,
      hydraFindings: 0,
      wasOverridden: false,
      isAppealable: false,
      lastCaseId: null,
    });
  }, []);

  return (
    <div className="h-full flex flex-col relative">
      {/* Header Bar with Senate Flow */}
      <div className="px-6 py-4 border-b border-white/5 bg-[#0a0a0d]/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="chassis-label text-zinc-600">SENATE CHAMBER</span>
            <div className="telem-divider" />
            <span className="seal">CONSTITUTIONAL SESSION</span>
          </div>
          
          {/* Article 50 Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={clearLogs}
              className="px-2 py-1 text-[10px] font-mono tracking-wider text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              CLEAR
            </button>
            <div className="telem-divider" />
            <label className="flex items-center gap-2 cursor-pointer group">
              <span className={cn(
                "chassis-label transition-colors",
                article50Mode ? "text-purple-400" : "text-zinc-600"
              )}>
                ART. 50
              </span>
              <button
                onClick={() => setArticle50Mode(!article50Mode)}
                className={cn(
                  "relative w-8 h-4 rounded-full transition-all",
                  article50Mode
                    ? "bg-purple-600/50 border border-purple-500/50"
                    : "bg-white/5 border border-white/10"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-3 h-3 rounded-full transition-transform",
                    article50Mode ? "translate-x-4 bg-purple-400" : "translate-x-0.5 bg-zinc-500"
                  )}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Senate Flow Visualization */}
        <SenateFlow
          onyxStatus={agentStates.ONYX}
          ignisStatus={agentStates.IGNIS}
          hydraStatus={agentStates.HYDRA}
          hydraFindings={session.hydraFindings}
          hydraOverride={session.wasOverridden}
        />
      </div>

      {/* Hydra Binding Alert (if override occurred) */}
      {session.wasOverridden && (
        <div className="mx-6 mt-4 hydra-alert">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-400 text-xs">!</span>
            </div>
            <div className="flex-1">
              <p className="font-mono text-xs text-red-400 font-semibold mb-1">HYDRA BINDING OVERRIDE</p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Onyx attempted to authorize despite {session.hydraFindings} unacknowledged security finding(s). 
                The vote was mechanically overridden per constitutional mandate. This cannot be bypassed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Log */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-auto p-4 pb-32 font-mono text-xs data-stream"
      >
        <div className="max-w-4xl mx-auto space-y-0.5">
          {logs.length === 0 ? (
            <EmptyState />
          ) : (
            logs.map((entry) => (
              <TerminalLine key={entry.id} entry={entry} />
            ))
          )}

          {/* Artifact Display */}
          {session.artifact && (
            <div className="mt-6 artifact-display">
              <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/10">
                <span className="chassis-label text-zinc-500">AUTHORIZED ARTIFACT</span>
                <button
                  onClick={() => navigator.clipboard.writeText(session.artifact || "")}
                  className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  COPY
                </button>
              </div>
              <pre className="p-4 text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap text-zinc-300">
                {session.artifact.slice(0, 3000)}
                {session.artifact.length > 3000 && (
                  <span className="text-zinc-600">{"\n\n"}... ({session.artifact.length - 3000} chars truncated)</span>
                )}
              </pre>
            </div>
          )}

          {/* Appeal Button */}
          {session.isAppealable && session.finalVerdict?.result !== "AUTHORIZED" && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleAppeal}
                className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-400 text-xs font-mono uppercase tracking-wider hover:bg-purple-600/30 hover:border-purple-500/50 transition-all"
              >
                FILE APPEAL (Art. 12)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Command Bar */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6">
        <div className="w-full max-w-3xl command-float rounded-lg p-1">
          <div className="flex items-center gap-2">
            {/* Terminal Prefix */}
            <div className="pl-3 flex items-center gap-2">
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                session.isProcessing 
                  ? "bg-amber-500 animate-pulse" 
                  : "bg-emerald-500"
              )} />
              <span className="font-mono text-xs text-zinc-600 select-none">
                keeper@nest:~$
              </span>
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={session.isProcessing ? "Awaiting Senate deliberation..." : "Enter mission directive..."}
              disabled={session.isProcessing}
              className="flex-1 px-2 py-2.5 bg-transparent font-mono text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none disabled:opacity-50"
            />

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={session.isProcessing || !input.trim()}
              className={cn(
                "px-4 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all",
                session.isProcessing
                  ? "bg-amber-500/20 border border-amber-500/30 text-amber-400/70"
                  : "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-zinc-200",
                "disabled:opacity-30 disabled:cursor-not-allowed"
              )}
            >
              {session.isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  CONVENING
                </span>
              ) : (
                "SUBMIT"
              )}
            </button>
          </div>
          
          {/* Keyboard hint */}
          <div className="flex justify-center mt-1.5 opacity-0 group-focus-within:opacity-100 transition-opacity">
            <span className="text-[9px] text-zinc-700 font-mono">
              Press <span className="kbd">Enter</span> to submit • <span className="kbd">Esc</span> to cancel
            </span>
          </div>
        </div>
      </div>

      {/* Constitutional Watermark */}
      <div className="watermark">GOVERNED BY THE NEST CONSTITUTION v5.2</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.02] border border-white/10 mb-6">
        <svg className="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <p className="chassis-label text-zinc-600 mb-2">SENATE AWAITING DIRECTIVE</p>
      <p className="text-zinc-700 text-xs font-mono max-w-md mx-auto leading-relaxed">
        Enter a mission below to convene the constitutional assembly. 
        All outputs are governed by Stare Decisis and subject to Hydra review.
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <div className="text-center">
          <div className="w-2 h-2 rounded-full bg-blue-500/50 mx-auto mb-1" />
          <span className="text-[9px] text-zinc-600 font-mono">ONYX</span>
        </div>
        <div className="text-center">
          <div className="w-2 h-2 rounded-full bg-amber-500/50 mx-auto mb-1" />
          <span className="text-[9px] text-zinc-600 font-mono">IGNIS</span>
        </div>
        <div className="text-center">
          <div className="w-2 h-2 rounded-full bg-red-500/50 mx-auto mb-1" />
          <span className="text-[9px] text-zinc-600 font-mono">HYDRA</span>
        </div>
      </div>
    </div>
  );
}

function TerminalLine({ entry }: { entry: TerminalEntry }) {
  const statusColors: Record<string, string> = {
    // System
    UPLINK: "text-emerald-500/70",
    CONNECT: "text-emerald-500/70",
    ARTIFACT: "text-cyan-400/80",
    APPEAL: "text-purple-400/80",
    "ART.50": "text-purple-400",
    
    // Flow
    RECEIVED: "text-zinc-500",
    AUDITING: "text-blue-400/70",
    FORGING: "text-amber-400/70",
    INJECTING: "text-red-400/70",
    DELIBERATING: "text-blue-400/70",
    COMPLETE: "text-zinc-400",
    SKIPPED: "text-zinc-600",
    
    // Verdicts
    AUTHORIZE: "text-emerald-400",
    AUTHORIZED: "text-emerald-400",
    VETO: "text-red-400",
    VETOED: "text-red-400",
    HYDRA_OVERRIDE: "text-red-500 font-semibold",
    UNGOVERNED: "text-purple-400",
    
    // Alerts
    WARNING: "text-amber-400",
    CRITICAL: "text-red-500",
    OVERRIDE: "text-red-500 font-semibold animate-pulse",
    ERROR: "text-red-500",
    FATAL: "text-red-600",
  };

  const agentColors: Record<string, string> = {
    SYSTEM: "text-zinc-500",
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
    <div
      className={cn(
        "flex items-start gap-2 py-0.5 px-2 -mx-2 rounded transition-colors",
        entry.isHydraBinding && "bg-red-500/5",
        entry.isSystem && "bg-white/[0.01]",
        "hover:bg-white/[0.02]"
      )}
    >
      <span className="text-zinc-700 tabular-nums shrink-0 select-none">{time}</span>
      <span className={cn("shrink-0 w-14", agentColor)}>[{entry.agent}]</span>
      <span className={cn("shrink-0 w-24", statusColor)}>{entry.status}</span>
      <span className="text-zinc-400 break-all flex-1">{entry.message}</span>
    </div>
  );
}

export default CommandPanel;
