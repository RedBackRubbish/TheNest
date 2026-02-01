"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { nestAPI, type Telemetry } from "@/lib/api";

export function Settings() {
  const [apiEndpoint, setApiEndpoint] = useState("http://localhost:8000");
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Poll telemetry
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const data = await nestAPI.getTelemetry();
        setTelemetry(data);
        setIsConnected(true);
        setLastCheck(new Date());
      } catch {
        setIsConnected(false);
        setTelemetry(null);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTestConnection = async () => {
    setIsChecking(true);
    try {
      nestAPI.configure(apiEndpoint);
      const data = await nestAPI.getTelemetry();
      setTelemetry(data);
      setIsConnected(true);
      setLastCheck(new Date());
    } catch {
      setIsConnected(false);
      setTelemetry(null);
    } finally {
      setIsChecking(false);
    }
  };

  const formatUptime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="chassis-label text-zinc-600">SYSTEM DIAGNOSTICS</span>
              <span className={cn(
                "seal",
                isConnected ? "!bg-emerald-500/10 !border-emerald-500/30 !text-emerald-400" : "!bg-red-500/10 !border-red-500/30 !text-red-400"
              )}>
                {isConnected ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <p className="text-xs text-zinc-700 font-mono">Kernel telemetry • Connection settings • Runtime parameters</p>
          </div>
          {lastCheck && (
            <div className="text-right">
              <span className="chassis-label text-zinc-700">LAST CHECK</span>
              <p className="text-[10px] text-zinc-600 font-mono mt-0.5">{lastCheck.toLocaleTimeString()}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Kernel Status Panel */}
          <div className="p-5 bg-[#0a0a0d] border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"
              )} />
              <span className="chassis-label text-zinc-500">KERNEL STATUS</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {isConnected && telemetry ? (
              <div className="grid grid-cols-4 gap-6">
                <div className="space-y-1">
                  <span className="chassis-label text-zinc-700">STATUS</span>
                  <p className="font-mono text-sm text-emerald-400">{telemetry.kernel_status}</p>
                </div>
                <div className="space-y-1">
                  <span className="chassis-label text-zinc-700">UPTIME</span>
                  <p className="font-mono text-sm text-zinc-300 tabular-nums">{formatUptime(telemetry.uptime_seconds)}</p>
                </div>
                <div className="space-y-1">
                  <span className="chassis-label text-zinc-700">GOVERNANCE</span>
                  <p className={cn(
                    "font-mono text-sm",
                    telemetry.governance_mode.includes("STRICT") ? "text-amber-400" : "text-zinc-400"
                  )}>
                    {telemetry.governance_mode.includes("STRICT") ? "STRICT" : "STANDARD"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="chassis-label text-zinc-700">LATENCY</span>
                  <p className={cn(
                    "font-mono text-sm tabular-nums",
                    telemetry.latency_ms < 50 ? "text-emerald-400" : telemetry.latency_ms < 100 ? "text-amber-400" : "text-red-400"
                  )}>
                    {telemetry.latency_ms}ms
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="font-mono text-xs text-zinc-600">Unable to connect to kernel</p>
              </div>
            )}
          </div>

          {/* Resource Usage */}
          {isConnected && telemetry && (
            <div className="p-5 bg-[#0a0a0d] border border-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="chassis-label text-zinc-500">RESOURCE USAGE</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* CPU */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-600">CPU</span>
                    <span className="font-mono text-xs text-zinc-400 tabular-nums">{telemetry.cpu_usage_percent}%</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        telemetry.cpu_usage_percent < 50 ? "bg-emerald-500" :
                        telemetry.cpu_usage_percent < 80 ? "bg-amber-500" : "bg-red-500"
                      )}
                      style={{ width: `${telemetry.cpu_usage_percent}%` }}
                    />
                  </div>
                </div>

                {/* RAM */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-600">RAM</span>
                    <span className="font-mono text-xs text-zinc-400 tabular-nums">{Math.round(telemetry.ram_usage_mb)}MB</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (telemetry.ram_usage_mb / 512) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Agents */}
          {isConnected && telemetry && (
            <div className="p-5 bg-[#0a0a0d] border border-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <span className="chassis-label text-zinc-500">SENATE AGENTS</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <div className="flex gap-4">
                {telemetry.active_agents.map((agent) => {
                  const colors: Record<string, string> = {
                    ONYX: "border-blue-500/30 text-blue-400",
                    IGNIS: "border-amber-500/30 text-amber-400",
                    HYDRA: "border-red-500/30 text-red-400",
                  };
                  return (
                    <div
                      key={agent}
                      className={cn(
                        "px-4 py-2 bg-white/[0.02] border rounded-lg",
                        colors[agent] || "border-white/10 text-zinc-400"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="font-mono text-xs font-semibold tracking-wider">{agent}</span>
                      </div>
                      <p className="font-mono text-[9px] text-zinc-600 mt-1">STANDBY</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Connection Settings */}
          <div className="p-5 bg-[#0a0a0d] border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="chassis-label text-zinc-500">CONNECTION</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="chassis-label text-zinc-600">API ENDPOINT</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded font-mono text-xs text-zinc-300 focus:outline-none focus:border-white/20"
                  />
                  <button
                    onClick={handleTestConnection}
                    disabled={isChecking}
                    className={cn(
                      "px-4 py-2 rounded font-mono text-[10px] uppercase tracking-wider transition-all",
                      "bg-white/5 border border-white/10 text-zinc-400",
                      "hover:bg-white/10 hover:text-zinc-200",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {isChecking ? "TESTING..." : "TEST"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="p-5 bg-[#0a0a0d] border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="chassis-label text-zinc-500">SYSTEM INFO</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <span className="chassis-label text-zinc-700">VERSION</span>
                <p className="font-mono text-xs text-zinc-400">5.2.0</p>
              </div>
              <div className="space-y-1">
                <span className="chassis-label text-zinc-700">BACKEND</span>
                <p className="font-mono text-xs text-zinc-400">FastAPI</p>
              </div>
              <div className="space-y-1">
                <span className="chassis-label text-zinc-700">STORAGE</span>
                <p className="font-mono text-xs text-zinc-400">JSON</p>
              </div>
              <div className="space-y-1">
                <span className="chassis-label text-zinc-700">TESTS</span>
                <p className="font-mono text-xs text-emerald-400">109 PASSING</p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-5 bg-red-950/10 border border-red-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="chassis-label text-red-500/60">DANGER ZONE</span>
              <div className="flex-1 h-px bg-red-900/20" />
            </div>
            <p className="text-[10px] text-zinc-600 font-mono mb-4">
              Irreversible operations. These actions cannot be undone and may affect system integrity.
            </p>
            <div className="flex gap-3">
              <button
                disabled
                className="px-3 py-2 bg-red-950/30 border border-red-900/30 rounded font-mono text-[10px] text-red-400/40 uppercase tracking-wider cursor-not-allowed"
              >
                PURGE CHRONICLE
              </button>
              <button
                disabled
                className="px-3 py-2 bg-red-950/30 border border-red-900/30 rounded font-mono text-[10px] text-red-400/40 uppercase tracking-wider cursor-not-allowed"
              >
                RESET KERNEL
              </button>
            </div>
            <p className="text-[9px] text-zinc-700 font-mono mt-3">
              Destructive operations are disabled in this build. Contact Keeper for authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
