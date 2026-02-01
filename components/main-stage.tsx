"use client";

import { cn } from "@/lib/utils";
import { SenateGraph } from "./senate-graph";
import { MissionConsole } from "./mission-console";
import { StatusPanel } from "./status-panel";
import { CodeVariantViewer } from "./code-variant-viewer";

interface MainStageProps {
  activeView: string;
  isSessionActive: boolean;
  className?: string;
}

export function MainStage({ activeView, isSessionActive, className }: MainStageProps) {
  return (
    <div className={cn("flex-1 overflow-auto", className)}>
      {activeView === "missions" && isSessionActive ? (
        <MissionsView />
      ) : activeView === "chronicle" ? (
        <ChronicleView />
      ) : activeView === "constitution" ? (
        <ConstitutionView />
      ) : activeView === "settings" ? (
        <SettingsView />
      ) : (
        <RecessView />
      )}
    </div>
  );
}

function RecessView() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      {/* Recess Glow Effect */}
      <div className="relative">
        {/* Outer glow rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-80 w-80 rounded-full bg-amber/5 blur-3xl animate-pulse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-64 w-64 rounded-full bg-amber/10 blur-2xl animate-pulse delay-300" />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Senate Icon */}
          <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full border border-amber/20 bg-zinc-950/80 backdrop-blur-sm shadow-[0_0_60px_rgba(217,169,70,0.15)]">
            <svg
              viewBox="0 0 24 24"
              className="h-16 w-16 text-amber/60"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="font-sans text-3xl font-semibold text-foreground tracking-tight">
            The Senate is in Recess
          </h2>

          {/* Subtitle */}
          <p className="mt-3 text-center font-mono text-sm text-muted-foreground max-w-md">
            Select <span className="text-amber">Missions</span> from the sidebar to begin a deliberation session
          </p>

          {/* Decorative line */}
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber/30" />
            <div className="h-2 w-2 rounded-full bg-amber/30" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber/30" />
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="font-mono text-2xl font-semibold text-foreground">4</div>
              <div className="font-mono text-xs text-muted-foreground">DRAGONS ACTIVE</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-semibold text-foreground">1,247</div>
              <div className="font-mono text-xs text-muted-foreground">MISSIONS PROCESSED</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-semibold text-hydra">94.2%</div>
              <div className="font-mono text-xs text-muted-foreground">APPROVAL RATE</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionsView() {
  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <span>THE NEST</span>
        <span>/</span>
        <span className="text-amber">MISSIONS</span>
      </div>

      {/* Title */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Mission Control</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit directives to the Senate for deliberation
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-9 space-y-6">
          <SenateGraph />
          <CodeVariantViewer 
            onVeto={(id) => console.log("Vetoed:", id)}
            onAuthorize={(id) => console.log("Authorized:", id)}
          />
          <MissionConsole />
        </div>

        {/* Status Sidebar */}
        <div className="xl:col-span-3">
          <StatusPanel className="sticky top-6" />
        </div>
      </div>
    </div>
  );
}

function ChronicleView() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <span>THE NEST</span>
        <span>/</span>
        <span className="text-amber">CHRONICLE</span>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-foreground">The Chronicle</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Search case law and precedent history
        </p>
      </div>

      {/* Search Bar */}
      <div className="rounded-lg border border-white/[0.08] bg-card/50 p-4">
        <div className="flex items-center gap-3">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search precedents, rulings, and case history..."
            className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Example Precedents */}
      <div className="space-y-3">
        {[
          { id: "CASE-001", title: "Security Override Protocol", verdict: "APPROVED", agent: "ONYX" },
          { id: "CASE-002", title: "Emergency Data Migration", verdict: "STOP_WORK", agent: "HYDRA" },
          { id: "CASE-003", title: "API Rate Limit Bypass", verdict: "APPROVED", agent: "IGNIS" },
        ].map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-white/[0.08] bg-card/30 p-4 hover:bg-card/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">{item.id}</span>
                <span className="font-sans text-sm text-foreground">{item.title}</span>
              </div>
              <span
                className={cn(
                  "font-mono text-xs px-2 py-1 rounded",
                  item.verdict === "APPROVED"
                    ? "bg-hydra/10 text-hydra"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {item.verdict}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConstitutionView() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <span>THE NEST</span>
        <span>/</span>
        <span className="text-amber">CONSTITUTION</span>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-foreground">The Constitution</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Governance rules and ethical frameworks
        </p>
      </div>

      <div className="rounded-lg border border-white/[0.08] bg-card/30 p-6 space-y-4">
        <h3 className="font-mono text-sm text-amber">ARTICLE 1 - CORE PRINCIPLES</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          The Nest operates under the principle of distributed governance, where no single agent
          holds absolute authority. All decisions must pass through the Senate deliberation process.
        </p>

        <h3 className="font-mono text-sm text-amber pt-4">ARTICLE 50 - MARTIAL GOVERNANCE</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          In emergency situations, the Elder may invoke Article 50 to bypass standard deliberation.
          All code produced under Article 50 is tagged as UNGOVERNED and subject to post-hoc review.
        </p>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <span>THE NEST</span>
        <span>/</span>
        <span className="text-amber">SETTINGS</span>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure system parameters
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-white/[0.08] bg-card/30 p-4">
          <label className="font-mono text-xs text-muted-foreground">API ENDPOINT</label>
          <input
            type="text"
            placeholder="https://your-api.example.com"
            className="mt-2 w-full rounded-md border border-white/[0.08] bg-background/50 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber"
          />
        </div>

        <div className="rounded-lg border border-white/[0.08] bg-card/30 p-4">
          <label className="font-mono text-xs text-muted-foreground">GOVERNANCE TIMEOUT (MS)</label>
          <input
            type="number"
            defaultValue={30000}
            className="mt-2 w-full rounded-md border border-white/[0.08] bg-background/50 px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber"
          />
        </div>
      </div>
    </div>
  );
}
