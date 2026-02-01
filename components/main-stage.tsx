"use client";

import { Hexagon } from "lucide-react";

interface MainStageProps {
  activeNav: string;
}

export function MainStage({ activeNav }: MainStageProps) {
  return (
    <main className="flex-1 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        {activeNav === "missions" && <RecessState />}
        {activeNav === "chronicle" && <ChronicleState />}
        {activeNav === "settings" && <SettingsState />}
      </div>
    </main>
  );
}

function RecessState() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Glow Effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-96 w-96 rounded-full bg-green-500/10 animate-pulse-glow" />
      </div>

      {/* Icon with Glow Ring */}
      <div className="relative mb-8">
        <div className="absolute inset-0 scale-150 rounded-full bg-green-500/5 blur-2xl" />
        <div className="relative">
          <Hexagon className="h-24 w-24 text-green-500/30" strokeWidth={0.75} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Hexagon className="h-16 w-16 text-green-500/50" strokeWidth={1} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-green-500/60 shadow-[0_0_30px_rgba(34,197,94,0.6)]" />
          </div>
        </div>
      </div>

      {/* Text */}
      <h1 className="text-3xl font-light text-foreground tracking-wide mb-3">
        The Senate is in Recess
      </h1>
      <p className="text-muted-foreground text-sm max-w-md">
        No active missions are currently in session. The governance council awaits new directives.
      </p>

      {/* Status Indicator */}
      <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5">
        <div className="h-2 w-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Standby Mode
        </span>
      </div>
    </div>
  );
}

function ChronicleState() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 scale-150 rounded-full bg-blue-500/5 blur-2xl" />
        <div className="h-24 w-24 rounded-full border border-blue-500/20 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border border-blue-500/30 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.6)]" />
          </div>
        </div>
      </div>
      <h1 className="text-3xl font-light text-foreground tracking-wide mb-3">
        Chronicle Archives
      </h1>
      <p className="text-muted-foreground text-sm max-w-md">
        Historical records of all governance decisions and mission outcomes.
      </p>
    </div>
  );
}

function SettingsState() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 scale-150 rounded-full bg-zinc-500/5 blur-2xl" />
        <div className="h-24 w-24 rounded-full border border-white/10 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border border-white/20 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
          </div>
        </div>
      </div>
      <h1 className="text-3xl font-light text-foreground tracking-wide mb-3">
        System Configuration
      </h1>
      <p className="text-muted-foreground text-sm max-w-md">
        Adjust governance parameters and system preferences.
      </p>
    </div>
  );
}
