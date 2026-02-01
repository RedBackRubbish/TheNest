"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/nest/sidebar";
import { CommandPanel } from "@/components/nest/command-panel";
import { Chronicle } from "@/components/nest/chronicle";
import { Constitution } from "@/components/nest/constitution";
import { Settings } from "@/components/nest/settings";
import { nestAPI, type Telemetry } from "@/lib/api";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("command");
  const [telemetry, setTelemetry] = useState<Telemetry>({
    latency_ms: 0,
    ram_usage_mb: 0,
    cpu_usage_percent: 0,
    governance_mode: "INITIALIZING",
    kernel_status: "CONNECTING",
    uptime_seconds: 0,
    active_agents: [],
  });
  const [isConnected, setIsConnected] = useState(false);

  // Poll telemetry endpoint
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const data = await nestAPI.getTelemetry();
        setTelemetry(data);
        setIsConnected(true);
      } catch {
        setIsConnected(false);
        setTelemetry((prev) => ({ ...prev, kernel_status: "OFFLINE" }));
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            setActiveView("command");
            break;
          case "2":
            e.preventDefault();
            setActiveView("chronicle");
            break;
          case "3":
            e.preventDefault();
            setActiveView("constitution");
            break;
          case "4":
            e.preventDefault();
            setActiveView("settings");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const renderView = useCallback(() => {
    switch (activeView) {
      case "command":
        return <CommandPanel />;
      case "chronicle":
        return <Chronicle />;
      case "constitution":
        return <Constitution />;
      case "settings":
        return <Settings />;
      default:
        return <CommandPanel />;
    }
  }, [activeView]);

  return (
    <div className="flex h-screen bg-[#060608]">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TelemetryHeader telemetry={telemetry} isConnected={isConnected} />
        <div className="flex-1 overflow-auto screen-bezel bg-[#0a0a0c] grid-bg">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

function TelemetryHeader({ telemetry, isConnected }: { telemetry: Telemetry; isConnected: boolean }) {
  const [clockTime, setClockTime] = useState(new Date().toISOString().slice(11, 19));

  useEffect(() => {
    const interval = setInterval(() => {
      setClockTime(new Date().toISOString().slice(11, 19));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const latencyColor = telemetry.latency_ms < 50 ? "#10b981" : telemetry.latency_ms < 100 ? "#f59e0b" : "#ef4444";
  const isStrict = telemetry.governance_mode.includes("STRICT");

  const formatUptime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <header className="h-11 border-b border-white/10 px-4 flex items-center justify-between bg-[#060608]">
      {/* Left: Logo & Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          {/* Logo */}
          <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span className="metallic text-sm font-mono font-semibold tracking-wide">THE NEST</span>
          </div>
        </div>
        <div className="telem-divider" />
        <span className="seal">SOVEREIGN v5.2</span>
      </div>

      {/* Right: Telemetry Cluster */}
      <div className="flex items-center gap-4 font-mono text-[10px] tracking-wider">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full transition-all"
            style={{
              backgroundColor: isConnected ? latencyColor : "#52525b",
              boxShadow: isConnected ? `0 0 6px ${latencyColor}` : "none",
            }}
          />
          <span className="text-zinc-500">LINK</span>
          <span className={cn("tabular-nums", isConnected ? "text-zinc-300" : "text-zinc-600")}>
            {isConnected ? `${telemetry.latency_ms}ms` : "—"}
          </span>
        </div>

        <div className="telem-divider" />

        {/* RAM */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">RAM</span>
          <span className="text-zinc-400 tabular-nums">
            {isConnected ? `${Math.round(telemetry.ram_usage_mb)}MB` : "—"}
          </span>
        </div>

        <div className="telem-divider" />

        {/* Uptime */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">UP</span>
          <span className="text-zinc-400 tabular-nums">
            {isConnected ? formatUptime(telemetry.uptime_seconds) : "—"}
          </span>
        </div>

        <div className="telem-divider" />

        {/* Governance Mode */}
        <div className="flex items-center gap-2">
          <svg className={cn("w-3 h-3", isStrict ? "text-amber-500" : "text-zinc-600")} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className={isStrict ? "text-amber-500" : "text-zinc-500"}>
            {isStrict ? "STRICT" : "STD"}
          </span>
        </div>

        <div className="telem-divider" />

        {/* Kernel Status */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">KERNEL</span>
          <span className={cn(
            "font-semibold",
            telemetry.kernel_status === "ONLINE" ? "text-emerald-400" :
            telemetry.kernel_status === "OFFLINE" ? "text-red-400" : "text-zinc-500"
          )}>
            {telemetry.kernel_status}
          </span>
        </div>

        <div className="telem-divider" />

        {/* Clock */}
        <span className="text-zinc-600 tabular-nums tracking-widest">{clockTime}Z</span>
      </div>
    </header>
  );
}

