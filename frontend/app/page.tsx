"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Sidebar } from "@/components/nest/sidebar";
import { CommandPanel } from "@/components/nest/command-panel";
import { Chronicle } from "@/components/nest/chronicle";
import { Constitution } from "@/components/nest/constitution";
import { Settings } from "@/components/nest/settings";

// Types for telemetry
interface Telemetry {
  latency_ms: number;
  ram_usage_mb: number;
  cpu_usage_percent: number;
  governance_mode: string;
  kernel_status: string;
  uptime_seconds: number;
}

export default function Dashboard() {
  const [activeView, setActiveView] = useState("command");
  const [telemetry, setTelemetry] = useState<Telemetry>({
    latency_ms: 0,
    ram_usage_mb: 0,
    cpu_usage_percent: 0,
    governance_mode: "INITIALIZING",
    kernel_status: "CONNECTING",
    uptime_seconds: 0,
  });
  const [isConnected, setIsConnected] = useState(false);

  // Poll telemetry endpoint
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("http://localhost:8000/system/telemetry");
        if (res.ok) {
          const data = await res.json();
          setTelemetry(data);
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch {
        setIsConnected(false);
        setTelemetry((prev) => ({ ...prev, kernel_status: "OFFLINE" }));
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
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
    <div className="flex h-screen">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TelemetryHeader telemetry={telemetry} isConnected={isConnected} />
        <div className="flex-1 overflow-auto screen-bezel bg-[#0a0a0c]">
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

  const latencyColor = telemetry.latency_ms < 50 ? "#22c55e" : telemetry.latency_ms < 100 ? "#eab308" : "#ef4444";
  const isStrict = telemetry.governance_mode.includes("STRICT");

  return (
    <header className="h-10 border-b border-white/10 px-4 flex items-center justify-between bg-[#09090b]">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <span className="metallic text-sm font-mono font-medium tracking-wide">
          THE NEST
        </span>
        <span className="chassis-label opacity-50">v5.2.0</span>
      </div>

      {/* Right: Telemetry Cluster */}
      <div className="flex items-center gap-3 font-mono text-[10px] tracking-wider">
        {/* Connection Status */}
        <div className="flex items-center gap-1.5">
          <div 
            className="w-1.5 h-1.5 rounded-full" 
            style={{ 
              backgroundColor: isConnected ? latencyColor : "#52525b",
              boxShadow: isConnected ? `0 0 4px ${latencyColor}` : "none"
            }} 
          />
          <span className="text-zinc-500">LATENCY</span>
          <span className="text-zinc-400 tabular-nums">
            {isConnected ? `${telemetry.latency_ms}ms` : "--"}
          </span>
        </div>

        <div className="telem-divider" />

        {/* RAM */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">RAM</span>
          <span className="text-zinc-400 tabular-nums">
            {isConnected ? `${Math.round(telemetry.ram_usage_mb)}MB` : "--"}
          </span>
        </div>

        <div className="telem-divider" />

        {/* Governance */}
        <div className="flex items-center gap-1.5">
          <svg className={`w-2.5 h-2.5 ${isStrict ? "text-amber-500" : "text-zinc-500"}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-zinc-500">GOVERNANCE</span>
          <span className={isStrict ? "text-amber-500/80" : "text-zinc-400"}>
            {isStrict ? "STRICT" : "STD"}
          </span>
        </div>

        <div className="telem-divider" />

        {/* Kernel Status */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-500">KERNEL</span>
          <span className={`${telemetry.kernel_status === "ONLINE" ? "text-emerald-500/80" : "text-zinc-600"}`}>
            {telemetry.kernel_status}
          </span>
        </div>

        <div className="telem-divider" />

        {/* Timestamp */}
        <span className="text-zinc-600 tabular-nums">{clockTime}Z</span>
      </div>
    </header>
  );
}
