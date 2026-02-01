"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Target, ScrollText, Settings, ChevronLeft, Hexagon } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: "missions", label: "Missions", icon: <Target className="h-5 w-5" /> },
  { id: "chronicle", label: "Chronicle", icon: <ScrollText className="h-5 w-5" /> },
  { id: "settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

interface SidebarProps {
  activeNav: string;
  onNavChange: (id: string) => void;
}

export function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full border-r border-white/10 bg-zinc-950/80 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-6 border-b border-white/10">
        <div className="relative">
          <Hexagon className="h-8 w-8 text-green-500" strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
          </div>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground tracking-wide">THE NEST</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Governance v1.0
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              activeNav === item.id
                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
            )}
          >
            <span
              className={cn(
                "transition-colors",
                activeNav === item.id ? "text-green-500" : "text-muted-foreground group-hover:text-foreground"
              )}
            >
              {item.icon}
            </span>
            {!collapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
            {activeNav === item.id && !collapsed && (
              <div className="ml-auto h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            )}
          </button>
        ))}
      </nav>

      <div className="px-2 py-4 border-t border-white/10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>

      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-green-500/20 blur-3xl pointer-events-none" />
    </aside>
  );
}
