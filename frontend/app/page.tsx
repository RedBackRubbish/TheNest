"use client";

import { useState } from "react";
import { Sidebar } from "@/components/nest/sidebar";
import { SenateGraph } from "@/components/nest/senate-graph";
import { CodeViewer } from "@/components/nest/code-viewer";
import { GovernanceLog } from "@/components/nest/governance-log";
import { Search, Activity } from "lucide-react";

export default function NestDashboard() {
  const [activeView, setActiveView] = useState("missions");

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border px-6 flex items-center justify-between glass-panel">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-sm font-mono text-muted-foreground">
              KERNEL: <span className="text-green-500">ONLINE</span>
            </span>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            Session: {new Date().toISOString().split("T")[0]}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeView === "missions" && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <SenateGraph />
              <CodeViewer />
            </div>
          )}

          {activeView === "chronicle" && (
            <div className="max-w-4xl mx-auto">
              <div className="glass-panel rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">The Chronicle</h2>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search precedents and case law..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-amber"
                  />
                </div>
                <div className="space-y-3">
                  {["CASE-2024-001", "CASE-2024-002", "CASE-2024-003"].map((id) => (
                    <div key={id} className="p-4 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm text-amber">{id}</span>
                        <span className="text-xs text-green-500">APPROVED</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Precedent established for secure API endpoint generation...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === "constitution" && (
            <div className="max-w-4xl mx-auto">
              <div className="glass-panel rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">The Constitution</h2>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">Article 1: Primary Directive</h3>
                    <p>All generated code must pass security validation before deployment.</p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">Article 50: Martial Governance</h3>
                    <p>Emergency bypass protocol for time-critical operations. All bypassed code tagged as UNGOVERNED.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "settings" && (
            <div className="max-w-4xl mx-auto">
              <div className="glass-panel rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">API Endpoint</label>
                    <input
                      type="text"
                      placeholder="https://your-backend.railway.app"
                      className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-1 focus:ring-amber"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Governance Log */}
        <div className="border-t border-border">
          <GovernanceLog />
        </div>
      </main>
    </div>
  );
}
