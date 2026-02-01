"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/nest/sidebar";
import { CommandPanel } from "@/components/nest/command-panel";
import { Chronicle } from "@/components/nest/chronicle";
import { Constitution } from "@/components/nest/constitution";
import { Settings } from "@/components/nest/settings";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("command");

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
    <div className="flex h-screen bg-[#09090b]">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto">{renderView()}</div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="h-12 border-b border-[#1c1c1f] px-4 flex items-center justify-between bg-[#0c0c0e]">
      <div className="flex items-center gap-3">
        <StatusIndicator status="online" />
        <span className="text-xs font-mono text-[#52525b]">
          KERNEL ACTIVE
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-[#52525b]">
          {new Date().toISOString().split("T")[0]}
        </span>
      </div>
    </header>
  );
}

function StatusIndicator({ status }: { status: "online" | "offline" | "processing" }) {
  const colors = {
    online: "bg-[#22c55e]",
    offline: "bg-[#52525b]",
    processing: "bg-[#eab308]",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${colors[status]}`} />
    </div>
  );
}
