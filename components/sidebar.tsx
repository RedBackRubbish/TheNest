"use client";

import { cn } from "@/lib/utils";
import {
  Crosshair,
  ScrollText,
  Settings,
  Activity,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  className?: string;
}

const navItems = [
  { id: "missions", label: "Missions", icon: Crosshair, description: "Submit directives" },
  { id: "chronicle", label: "Chronicle", icon: ScrollText, description: "Case law history" },
  { id: "constitution", label: "Constitution", icon: Shield, description: "Governance rules" },
  { id: "settings", label: "Settings", icon: Settings, description: "Configuration" },
];

export function Sidebar({ activeView, onViewChange, className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber/30 bg-amber/10">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-amber"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <h1 className="font-sans text-sm font-semibold text-foreground">THE NEST</h1>
              <p className="font-mono text-[10px] text-muted-foreground">v5.2</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                isActive
                  ? "bg-amber/10 text-amber"
                  : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
              )}
            >
              {/* Active indicator glow */}
              {isActive && (
                <div className="absolute inset-0 rounded-lg bg-amber/5 shadow-[inset_0_0_20px_rgba(217,169,70,0.1)]" />
              )}

              <Icon className={cn("h-5 w-5 shrink-0 relative z-10", isActive && "text-amber")} />

              {!collapsed && (
                <div className="flex flex-col items-start relative z-10">
                  <span className="font-mono text-sm">{item.label}</span>
                  {isActive && (
                    <span className="font-mono text-[10px] text-amber/60">{item.description}</span>
                  )}
                </div>
              )}

              {/* Left border indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-amber shadow-[0_0_10px_rgba(217,169,70,0.6)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Status Section */}
      <div className="border-t border-white/[0.08] p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="relative">
            <Activity className="h-4 w-4 text-hydra" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-hydra animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-mono text-xs text-foreground">KERNEL ONLINE</span>
              <span className="font-mono text-[10px] text-muted-foreground">All systems nominal</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
