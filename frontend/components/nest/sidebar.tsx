"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Crosshair,
  ScrollText,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: "missions", label: "Command", icon: Crosshair, color: "#f59e0b" },
  { id: "chronicle", label: "Chronicle", icon: ScrollText, color: "#a855f7" },
  { id: "constitution", label: "Constitution", icon: Shield, color: "#22c55e" },
  { id: "settings", label: "Settings", icon: Settings, color: "#6b7280" },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.aside
      className={cn(
        "relative h-full flex flex-col transition-all duration-300 ease-out",
        "bg-background/80 backdrop-blur-2xl border-r border-border/50"
      )}
      initial={{ width: 224 }}
      animate={{ width: collapsed ? 72 : 224 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Gradient Border Effect */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber/20 to-transparent" />

      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <motion.div
          className="flex items-center gap-3"
          initial={false}
          animate={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <motion.div
            className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber/20 to-ignis/20 flex items-center justify-center overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Animated Sparkle Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-amber/40 to-transparent"
              animate={{
                rotate: [0, 360],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <Sparkles className="w-5 h-5 text-amber relative z-10" />
          </motion.div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-bold text-base bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  The Nest
                </h1>
                <p className="text-[10px] text-muted-foreground font-mono tracking-wider">
                  GOVERNANCE DECK
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              onHoverStart={() => setHoveredItem(item.id)}
              onHoverEnd={() => setHoveredItem(null)}
              className={cn(
                "relative w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                collapsed ? "justify-center" : "",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background Glow */}
              <AnimatePresence>
                {(isActive || isHovered) && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      backgroundColor: isActive ? `${item.color}15` : `${item.color}08`,
                      boxShadow: isActive ? `inset 0 0 20px ${item.color}10` : "none",
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              {/* Active Indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              {/* Icon with glow effect */}
              <motion.div
                className="relative z-10"
                animate={{
                  color: isActive ? item.color : undefined,
                }}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    className="absolute inset-0 blur-lg"
                    style={{ backgroundColor: item.color }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className="relative z-10 text-sm font-medium"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              <AnimatePresence>
                {collapsed && isHovered && (
                  <motion.div
                    className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-card border border-border shadow-xl z-50"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                  >
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Status Indicator */}
      <div className="p-3 border-t border-border/50">
        <motion.div
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20",
            collapsed ? "justify-center" : ""
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(34, 197, 94, 0.4)",
                "0 0 0 8px rgba(34, 197, 94, 0)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <p className="text-xs font-medium text-green-500">System Online</p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  All agents active
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-border/50">
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>
    </motion.aside>
  );
}
