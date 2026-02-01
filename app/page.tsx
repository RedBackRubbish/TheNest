"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { SenateGraph } from "@/components/senate-graph";
import { MissionConsole } from "@/components/mission-console";
import { StatusPanel } from "@/components/status-panel";

export default function GovernanceDeck() {
  const [apiUrl, setApiUrl] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* API Configuration Banner */}
        {!isConfigured && (
          <div className="mb-6 rounded-lg border border-amber/30 bg-amber/5 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-mono text-sm font-semibold text-amber">
                  BACKEND CONNECTION
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter your FastAPI backend URL to enable live governance
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://your-api.example.com"
                  className="h-9 rounded-md border border-border bg-background px-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={() => apiUrl && setIsConfigured(true)}
                  className="h-9 rounded-md bg-primary px-4 font-mono text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-2">
            <span>THE NEST</span>
            <span>/</span>
            <span className="text-foreground">SENATE</span>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Governance Deck
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time visualization of the synthetic civilization decision pipeline
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Senate Logic Graph */}
            <SenateGraph />

            {/* Mission Console */}
            <MissionConsole />
          </div>

          {/* Right Column - Status Panel */}
          <div className="lg:col-span-3">
            <StatusPanel className="sticky top-6" />
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Missions Processed" value="1,247" change="+12%" />
          <StatCard label="Approval Rate" value="94.2%" change="+2.1%" />
          <StatCard label="Avg. Deliberation" value="2.3s" change="-0.4s" />
          <StatCard label="Stop Work Orders" value="73" change="-8" isNegative />
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  isNegative = false,
}: {
  label: string;
  value: string;
  change: string;
  isNegative?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        <span
          className={`text-xs font-mono ${
            isNegative ? "text-destructive" : "text-hydra"
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  );
}
