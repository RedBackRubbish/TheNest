"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

interface AgentNode {
  id: string;
  name: string;
  role: string;
  color: string;
  emoji: string;
  x: number;
  y: number;
}

const agents: AgentNode[] = [
  { id: "sentinel", name: "ONYX", role: "Sentinel", color: "#a855f7", emoji: "🛡️", x: 15, y: 50 },
  { id: "forge", name: "IGNIS", role: "The Forge", color: "#f97316", emoji: "🔥", x: 50, y: 50 },
  { id: "gauntlet", name: "HYDRA", role: "The Gauntlet", color: "#22c55e", emoji: "🐉", x: 85, y: 50 },
];

const variants = [
  { id: "speed", label: "Speed", y: 25 },
  { id: "safety", label: "Safety", y: 50 },
  { id: "clarity", label: "Clarity", y: 75 },
];

export function SenateGraph() {
  const [activeAgent, setActiveAgent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const progress = useMotionValue(0);
  const smoothProgress = useSpring(progress, { stiffness: 100, damping: 20 });

  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setActiveAgent((prev) => {
        const next = (prev + 1) % agents.length;
        progress.set((next / (agents.length - 1)) * 100);
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isAnimating, progress]);

  const getConnectionClass = (fromIndex: number, toIndex: number) => {
    const isActive = activeAgent >= fromIndex && activeAgent >= toIndex - 1;
    return isActive ? "opacity-100" : "opacity-30";
  };

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative glass-panel rounded-2xl p-6 overflow-hidden"
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--color-border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Subtle Glow Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${15 + activeAgent * 35}% 50%, ${agents[activeAgent]?.color || '#fff'}15 0%, transparent 40%)`,
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-8">
        <div>
          <motion.h2
            className="text-xl font-bold text-foreground flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="bg-gradient-to-r from-amber via-ignis to-onyx bg-clip-text text-transparent">
              Senate Logic Graph
            </span>
          </motion.h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time Decision Pipeline
          </p>
        </div>

        <motion.button
          onClick={() => setIsAnimating(!isAnimating)}
          className={cn(
            "px-4 py-2 text-xs font-mono rounded-lg border transition-all",
            isAnimating
              ? "border-amber/50 bg-amber/10 text-amber"
              : "border-border bg-secondary text-muted-foreground hover:text-foreground"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isAnimating ? "● LIVE" : "○ PAUSED"}
        </motion.button>
      </div>

      {/* Main Graph Area */}
      <div className="relative h-72">
        {/* SVG Connections */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={agents[0].color} />
              <stop offset="50%" stopColor={agents[1].color} />
              <stop offset="100%" stopColor={agents[2].color} />
            </linearGradient>

            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection: Sentinel -> Forge */}
          <motion.line
            x1="20%"
            y1="50%"
            x2="45%"
            y2="50%"
            stroke={agents[0].color}
            strokeWidth="2"
            strokeLinecap="round"
            className={getConnectionClass(0, 1)}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: activeAgent >= 1 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />

          {/* Forge Variants Lines */}
          {variants.map((v) => (
            <motion.line
              key={v.id}
              x1="50%"
              y1={`${v.y}%`}
              x2="55%"
              y2="50%"
              stroke={agents[1].color}
              strokeWidth="1.5"
              className={cn(
                "transition-opacity duration-300",
                activeAgent === 1 ? "opacity-100" : "opacity-20"
              )}
            />
          ))}

          {/* Connection: Forge -> Gauntlet */}
          <motion.line
            x1="55%"
            y1="50%"
            x2="80%"
            y2="50%"
            stroke={agents[2].color}
            strokeWidth="2"
            strokeLinecap="round"
            className={getConnectionClass(1, 2)}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: activeAgent >= 2 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />

          {/* Animated Flow Particle */}
          <motion.circle
            r="4"
            fill="url(#flowGradient)"
            filter="url(#glow)"
            initial={{ cx: "15%", cy: "50%" }}
            animate={{
              cx: `${15 + activeAgent * 35}%`,
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </svg>

        {/* Agent Nodes */}
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
            onHoverStart={() => setHoveredNode(agent.id)}
            onHoverEnd={() => setHoveredNode(null)}
          >
            {/* Glow Ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: agent.color }}
              animate={{
                scale: activeAgent === index ? [1, 1.5, 1] : 1,
                opacity: activeAgent === index ? [0.5, 0, 0.5] : 0,
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Node Circle */}
            <motion.div
              className={cn(
                "relative w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer transition-all",
                "bg-background/80 backdrop-blur-sm"
              )}
              style={{
                borderColor: agent.color,
                boxShadow:
                  activeAgent === index
                    ? `0 0 30px ${agent.color}60, inset 0 0 20px ${agent.color}20`
                    : hoveredNode === agent.id
                    ? `0 0 20px ${agent.color}40`
                    : "none",
              }}
              animate={{
                scale: activeAgent === index ? 1.1 : 1,
              }}
              whileHover={{ scale: 1.15 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="text-2xl">{agent.emoji}</span>
              <span
                className="text-xs font-bold mt-1"
                style={{ color: agent.color }}
              >
                {agent.name}
              </span>
            </motion.div>

            {/* Role Label */}
            <motion.div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-xs text-muted-foreground font-mono">
                {agent.role}
              </span>
            </motion.div>
          </motion.div>
        ))}

        {/* Forge Variants */}
        <div
          className="absolute transform -translate-x-1/2"
          style={{ left: "50%", top: "15%" }}
        >
          <div className="flex flex-col gap-3">
            {variants.map((v, i) => (
              <motion.div
                key={v.id}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-mono border transition-all cursor-pointer",
                  "bg-background/60 backdrop-blur-sm"
                )}
                style={{
                  borderColor: activeAgent === 1 ? agents[1].color : "var(--color-border)",
                  boxShadow: activeAgent === 1 ? `0 0 15px ${agents[1].color}30` : "none",
                }}
                animate={{
                  x: activeAgent === 1 ? [0, -5, 0] : 0,
                  opacity: activeAgent >= 1 ? 1 : 0.5,
                }}
                transition={{ delay: i * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  borderColor: agents[1].color,
                }}
              >
                {v.label}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <motion.div
        className="relative mt-6 pt-4 border-t border-border/50 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Active:{" "}
            <motion.span
              key={activeAgent}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: agents[activeAgent]?.color }}
              className="font-bold"
            >
              {agents[activeAgent]?.name}
            </motion.span>
          </span>

          {/* Progress Dots */}
          <div className="flex gap-2">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: i <= activeAgent ? agent.color : "var(--color-border)",
                }}
                animate={{
                  scale: i === activeAgent ? [1, 1.3, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
              />
            ))}
          </div>
        </div>

        <span className="text-xs font-mono text-muted-foreground">
          Phase {activeAgent + 1}/{agents.length}
        </span>
      </motion.div>
    </motion.div>
  );
}
