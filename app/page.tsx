"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { MainStage } from "@/components/main-stage";
import { GovernanceLog } from "@/components/governance-log";

export default function GovernanceDeck() {
  const [activeView, setActiveView] = useState("missions");
  const [isSessionActive, setIsSessionActive] = useState(false);

  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (view === "missions") {
      setIsSessionActive(true);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl px-6">
          <div className="flex items-center gap-4">
            <h2 className="font-sans text-sm font-medium text-foreground capitalize">
              {activeView}
            </h2>
            <div className="h-4 w-px bg-white/[0.08]" />
            <span className="font-mono text-xs text-muted-foreground">
              Protocol v5.2
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSessionActive(!isSessionActive)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs transition-all ${
                isSessionActive
                  ? "border-hydra/30 bg-hydra/10 text-hydra"
                  : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-foreground"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isSessionActive ? "bg-hydra animate-pulse" : "bg-muted"
                }`}
              />
              {isSessionActive ? "SESSION ACTIVE" : "SESSION PAUSED"}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <DragonIndicator name="O" color="onyx" />
              <DragonIndicator name="I" color="ignis" />
              <DragonIndicator name="H" color="hydra" />
            </div>
          </div>
        </header>

        <MainStage
          activeView={activeView}
          isSessionActive={isSessionActive}
          className="flex-1"
        />

        <GovernanceLog />
      </div>
    </div>
  );
}

function DragonIndicator({ name, color }: { name: string; color: "onyx" | "ignis" | "hydra" }) {
  const colorClasses = {
    onyx: "border-onyx/50 bg-onyx/10 text-onyx",
    ignis: "border-ignis/50 bg-ignis/10 text-ignis",
    hydra: "border-hydra/50 bg-hydra/10 text-hydra",
  };

  return (
    <div
      className={`flex h-7 w-7 items-center justify-center rounded-md border font-mono text-xs font-semibold ${colorClasses[color]}`}
      title={`${name === "O" ? "Onyx" : name === "I" ? "Ignis" : "Hydra"} - Active`}
    >
      {name}
    </div>
  );
}
