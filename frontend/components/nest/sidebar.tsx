"use client";

import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { 
    id: "command", 
    label: "COMMAND", 
    shortcut: "⌘1",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  { 
    id: "chronicle", 
    label: "CHRONICLE", 
    shortcut: "⌘2",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  { 
    id: "constitution", 
    label: "LAWS", 
    shortcut: "⌘3",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  { 
    id: "settings", 
    label: "SYSTEM", 
    shortcut: "⌘4",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-48 h-full flex flex-col bg-[#060608] border-r border-white/10">
      {/* System Status */}
      <div className="h-11 px-4 flex items-center border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
          <span className="chassis-label text-zinc-500">SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Section Header */}
      <div className="px-4 pt-6 pb-2">
        <span className="chassis-label text-zinc-700">NAVIGATION</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full px-3 py-2.5 flex items-center gap-3 rounded-lg transition-all group",
              activeView === item.id
                ? "bg-white/5 border border-white/10"
                : "border border-transparent hover:bg-white/[0.02] hover:border-white/5"
            )}
          >
            <div className={cn(
              "transition-colors",
              activeView === item.id ? "text-zinc-200" : "text-zinc-600 group-hover:text-zinc-400"
            )}>
              {item.icon}
            </div>
            <span className={cn(
              "flex-1 text-left font-mono text-[10px] tracking-widest uppercase transition-colors",
              activeView === item.id ? "text-zinc-200" : "text-zinc-500 group-hover:text-zinc-300"
            )}>
              {item.label}
            </span>
            <span className={cn(
              "font-mono text-[9px] transition-opacity",
              activeView === item.id ? "text-zinc-600" : "text-zinc-800 group-hover:text-zinc-700"
            )}>
              {item.shortcut}
            </span>
          </button>
        ))}
      </nav>

      {/* Agents Status */}
      <div className="px-4 py-4 border-t border-white/5">
        <span className="chassis-label text-zinc-700 block mb-3">AGENTS</span>
        <div className="flex gap-2">
          <div className="flex-1 py-2 px-2 bg-white/[0.02] border border-white/5 rounded text-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mx-auto mb-1" />
            <span className="font-mono text-[8px] text-blue-400/60">ONYX</span>
          </div>
          <div className="flex-1 py-2 px-2 bg-white/[0.02] border border-white/5 rounded text-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mx-auto mb-1" />
            <span className="font-mono text-[8px] text-amber-400/60">IGNIS</span>
          </div>
          <div className="flex-1 py-2 px-2 bg-white/[0.02] border border-white/5 rounded text-center">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 mx-auto mb-1" />
            <span className="font-mono text-[8px] text-red-400/60">HYDRA</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="chassis-label text-zinc-700">BUILD</span>
            <span className="font-mono text-[10px] text-zinc-600 tabular-nums">5.2.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="chassis-label text-zinc-700">ENV</span>
            <span className="font-mono text-[10px] text-emerald-500/60">SOVEREIGN</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

