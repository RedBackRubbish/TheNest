"use client";

import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: "command", label: "COMMAND", shortcut: "01" },
  { id: "chronicle", label: "CHRONICLE", shortcut: "02" },
  { id: "constitution", label: "CONSTITUTION", shortcut: "03" },
  { id: "settings", label: "SETTINGS", shortcut: "04" },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-44 h-full flex flex-col bg-[#09090b] border-r border-white/10">
      {/* System ID */}
      <div className="h-10 px-3 flex items-center border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_4px_#22c55e]" />
          <span className="chassis-label text-zinc-500">SYS ONLINE</span>
        </div>
      </div>

      {/* Section Header */}
      <div className="px-3 pt-4 pb-2">
        <span className="chassis-label text-zinc-600">NAVIGATION</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full px-2 py-1.5 flex items-center justify-between rounded transition-colors",
              "font-mono text-[10px] tracking-widest uppercase",
              activeView === item.id
                ? "text-zinc-200 bg-white/5"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
            )}
          >
            <span>{item.label}</span>
            <span className="text-zinc-700">{item.shortcut}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <div className="space-y-1">
          <div className="flex justify-between chassis-label">
            <span className="text-zinc-600">BUILD</span>
            <span className="text-zinc-500 tabular-nums">5.2.0</span>
          </div>
          <div className="flex justify-between chassis-label">
            <span className="text-zinc-600">ENV</span>
            <span className="text-zinc-500">PROD</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
