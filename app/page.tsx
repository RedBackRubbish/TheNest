"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { MainStage } from "@/components/main-stage";
import { GovernanceTerminal } from "@/components/governance-terminal";

export default function NestDashboard() {
  const [activeNav, setActiveNav] = useState("missions");

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950/50 backdrop-blur-sm">
          <div>
            <h1 className="text-lg font-medium text-foreground">
              {activeNav === "missions" && "Mission Control"}
              {activeNav === "chronicle" && "Chronicle Archives"}
              {activeNav === "settings" && "System Settings"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeNav === "missions" && "Command and monitor active governance operations"}
              {activeNav === "chronicle" && "Review historical decisions and outcomes"}
              {activeNav === "settings" && "Configure system parameters"}
            </p>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
              <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-xs text-muted-foreground">System Online</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-foreground font-medium">Senate Chamber</div>
              <div className="text-[10px] text-muted-foreground">Node-1 Primary</div>
            </div>
          </div>
        </header>

        {/* Main Stage */}
        <MainStage activeNav={activeNav} />

        {/* Terminal */}
        <GovernanceTerminal />
      </div>
    </div>
  );
}
