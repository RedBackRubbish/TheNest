"use client";

import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: "command", label: "Command" },
  { id: "chronicle", label: "Chronicle" },
  { id: "constitution", label: "Constitution" },
  { id: "settings", label: "Settings" },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-48 h-full flex flex-col bg-[#0c0c0e] border-r border-[#1c1c1f]">
      <div className="h-12 px-4 flex items-center border-b border-[#1c1c1f]">
        <span className="text-sm font-medium text-[#e4e4e7]">The Nest</span>
      </div>

      <nav className="flex-1 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "w-full px-4 py-2 text-left text-sm transition-colors",
              activeView === item.id
                ? "text-[#e4e4e7] bg-[#111113]"
                : "text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#111113]/50"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1c1c1f]">
        <div className="text-xs font-mono text-[#52525b]">
          <div>v5.2.0</div>
        </div>
      </div>
    </aside>
  );
}
