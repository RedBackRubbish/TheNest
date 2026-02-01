"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type AgentType = "sentinel" | "forge" | "gauntlet" | "arbiter" | "idle";
type ForgeVariant = "speed" | "safety" | "clarity";

interface SenateGraphProps {
  activeAgent?: AgentType;
  activeForgeVariant?: ForgeVariant;
  className?: string;
}

interface NodeProps {
  id: string;
  label: string;
  sublabel?: string;
  agent: "onyx" | "ignis" | "hydra" | "amber";
  isActive: boolean;
  x: number;
  y: number;
  size?: "sm" | "md" | "lg";
}

function GraphNode({ label, sublabel, agent, isActive, x, y, size = "md" }: NodeProps) {
  const sizeClasses = {
    sm: "w-20 h-20",
    md: "w-28 h-28",
    lg: "w-32 h-32",
  };

  const agentColors = {
    onyx: {
      bg: "bg-onyx/20",
      border: "border-onyx",
      text: "text-onyx",
      glow: "animate-pulse-onyx",
    },
    ignis: {
      bg: "bg-ignis/20",
      border: "border-ignis",
      text: "text-ignis",
      glow: "animate-pulse-ignis",
    },
    hydra: {
      bg: "bg-hydra/20",
      border: "border-hydra",
      text: "text-hydra",
      glow: "animate-pulse-hydra",
    },
    amber: {
      bg: "bg-amber/20",
      border: "border-amber",
      text: "text-amber",
      glow: "",
    },
  };

  const colors = agentColors[agent];

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Glow effect when active */}
      {isActive && (
        <circle
          r={size === "lg" ? 70 : size === "md" ? 60 : 45}
          className={cn(
            "fill-transparent",
            agent === "onyx" && "stroke-onyx",
            agent === "ignis" && "stroke-ignis",
            agent === "hydra" && "stroke-hydra",
            agent === "amber" && "stroke-amber"
          )}
          strokeWidth="2"
          style={{
            filter: `drop-shadow(0 0 20px hsl(var(--${agent}-glow) / 0.6))`,
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      )}

      {/* Main node circle */}
      <circle
        r={size === "lg" ? 56 : size === "md" ? 48 : 36}
        className={cn(
          "fill-card stroke-2 transition-all duration-500",
          isActive ? colors.border : "stroke-border",
          isActive && "stroke-[3px]"
        )}
        style={
          isActive
            ? {
                filter: `drop-shadow(0 0 30px hsl(var(--${agent}-glow) / 0.5))`,
              }
            : undefined
        }
      />

      {/* Inner decorative ring */}
      <circle
        r={size === "lg" ? 44 : size === "md" ? 38 : 28}
        className={cn(
          "fill-transparent stroke-1 transition-all duration-500",
          isActive ? colors.border : "stroke-muted",
          isActive && "opacity-60"
        )}
        strokeDasharray="4 4"
      />

      {/* Node label */}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        y={sublabel ? -6 : 0}
        className={cn(
          "font-sans text-sm font-semibold transition-all duration-300 fill-current",
          isActive ? colors.text : "text-muted-foreground"
        )}
      >
        {label}
      </text>

      {/* Sublabel */}
      {sublabel && (
        <text
          textAnchor="middle"
          dominantBaseline="middle"
          y={12}
          className={cn(
            "font-mono text-xs transition-all duration-300 fill-current",
            isActive ? "text-foreground/80" : "text-muted-foreground/60"
          )}
        >
          {sublabel}
        </text>
      )}

      {/* Status indicator */}
      <circle
        cx={size === "lg" ? 40 : size === "md" ? 34 : 26}
        cy={size === "lg" ? -40 : size === "md" ? -34 : -26}
        r="6"
        className={cn(
          "transition-all duration-300",
          isActive ? `fill-current ${colors.text}` : "fill-muted"
        )}
      />
    </g>
  );
}

function ForgeNode({
  variant,
  isActive,
  x,
  y,
}: {
  variant: ForgeVariant;
  isActive: boolean;
  x: number;
  y: number;
}) {
  const variantConfig = {
    speed: { label: "Speed", icon: "⚡" },
    safety: { label: "Safety", icon: "🛡" },
    clarity: { label: "Clarity", icon: "◇" },
  };

  const config = variantConfig[variant];

  return (
    <g transform={`translate(${x}, ${y})`}>
      {isActive && (
        <rect
          x="-32"
          y="-20"
          width="64"
          height="40"
          rx="8"
          className="fill-transparent stroke-ignis stroke-2"
          style={{
            filter: "drop-shadow(0 0 15px hsl(var(--ignis-glow) / 0.6))",
          }}
        />
      )}
      <rect
        x="-28"
        y="-16"
        width="56"
        height="32"
        rx="6"
        className={cn(
          "fill-card stroke transition-all duration-300",
          isActive ? "stroke-ignis stroke-2" : "stroke-border"
        )}
      />
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        y="-2"
        className={cn(
          "font-mono text-xs transition-all duration-300 fill-current",
          isActive ? "text-ignis" : "text-muted-foreground"
        )}
      >
        {config.label}
      </text>
    </g>
  );
}

function AnimatedConnector({
  x1,
  y1,
  x2,
  y2,
  isActive,
  agent,
  curved = false,
  curveDirection = "down",
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isActive: boolean;
  agent: "onyx" | "ignis" | "hydra" | "amber";
  curved?: boolean;
  curveDirection?: "up" | "down";
}) {
  const midX = (x1 + x2) / 2;
  const curveOffset = curveDirection === "up" ? -40 : 40;

  const pathD = curved
    ? `M ${x1} ${y1} Q ${midX} ${y1 + curveOffset} ${x2} ${y2}`
    : `M ${x1} ${y1} L ${x2} ${y2}`;

  return (
    <g>
      {/* Background line */}
      <path
        d={pathD}
        fill="none"
        className="stroke-border"
        strokeWidth="2"
      />

      {/* Animated flow line */}
      {isActive && (
        <path
          d={pathD}
          fill="none"
          className={cn(
            "flow-line",
            agent === "onyx" && "stroke-onyx",
            agent === "ignis" && "stroke-ignis",
            agent === "hydra" && "stroke-hydra",
            agent === "amber" && "stroke-amber"
          )}
          strokeWidth="2"
          style={{
            filter: `drop-shadow(0 0 8px hsl(var(--${agent}-glow) / 0.8))`,
          }}
        />
      )}

      {/* Data packet animation */}
      {isActive && (
        <circle r="4" className={cn(
          agent === "onyx" && "fill-onyx",
          agent === "ignis" && "fill-ignis",
          agent === "hydra" && "fill-hydra",
          agent === "amber" && "fill-amber"
        )}>
          <animateMotion
            dur="1.5s"
            repeatCount="indefinite"
            path={pathD}
          />
        </circle>
      )}

      {/* Arrow head */}
      <polygon
        points={`${x2 - 8},${y2 - 4} ${x2},${y2} ${x2 - 8},${y2 + 4}`}
        className={cn(
          "transition-all duration-300",
          isActive
            ? cn(
                agent === "onyx" && "fill-onyx",
                agent === "ignis" && "fill-ignis",
                agent === "hydra" && "fill-hydra",
                agent === "amber" && "fill-amber"
              )
            : "fill-muted"
        )}
      />
    </g>
  );
}

export function SenateGraph({
  activeAgent = "idle",
  activeForgeVariant,
  className,
}: SenateGraphProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-demo animation
  useEffect(() => {
    if (activeAgent === "idle") {
      setIsAnimating(true);
      const steps = ["sentinel", "forge", "gauntlet", "arbiter"];
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
      }, 2500);
      return () => clearInterval(interval);
    } else {
      setIsAnimating(false);
      const stepMap: Record<AgentType, number> = {
        sentinel: 0,
        forge: 1,
        gauntlet: 2,
        arbiter: 3,
        idle: 0,
      };
      setCurrentStep(stepMap[activeAgent]);
    }
  }, [activeAgent]);

  const getActiveState = (step: number) => {
    if (activeAgent !== "idle") {
      const stepMap: Record<AgentType, number> = {
        sentinel: 0,
        forge: 1,
        gauntlet: 2,
        arbiter: 3,
        idle: -1,
      };
      return stepMap[activeAgent] === step;
    }
    return currentStep === step;
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Title */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Senate Logic Graph</h3>
          <p className="text-sm text-muted-foreground font-mono">
            Decision Pipeline Visualization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isAnimating ? "bg-hydra animate-pulse" : "bg-muted"
            )}
          />
          <span className="text-xs text-muted-foreground font-mono">
            {isAnimating ? "SIMULATING" : "LIVE"}
          </span>
        </div>
      </div>

      {/* Graph Container */}
      <div className="relative rounded-lg border border-border bg-card/50 p-4 scanline overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <svg
          viewBox="0 0 900 320"
          className="w-full h-auto relative z-10"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Connectors - drawn first so nodes appear on top */}

          {/* Sentinel to Forge */}
          <AnimatedConnector
            x1={150}
            y1={160}
            x2={290}
            y2={160}
            isActive={getActiveState(0) || getActiveState(1)}
            agent="onyx"
          />

          {/* Forge to Speed variant */}
          <AnimatedConnector
            x1={400}
            y1={160}
            x2={480}
            y2={80}
            isActive={getActiveState(1)}
            agent="ignis"
            curved
            curveDirection="up"
          />

          {/* Forge to Safety variant */}
          <AnimatedConnector
            x1={400}
            y1={160}
            x2={500}
            y2={160}
            isActive={getActiveState(1)}
            agent="ignis"
          />

          {/* Forge to Clarity variant */}
          <AnimatedConnector
            x1={400}
            y1={160}
            x2={480}
            y2={240}
            isActive={getActiveState(1)}
            agent="ignis"
            curved
            curveDirection="down"
          />

          {/* Speed to Gauntlet */}
          <AnimatedConnector
            x1={540}
            y1={80}
            x2={620}
            y2={160}
            isActive={getActiveState(2)}
            agent="hydra"
            curved
            curveDirection="down"
          />

          {/* Safety to Gauntlet */}
          <AnimatedConnector
            x1={560}
            y1={160}
            x2={600}
            y2={160}
            isActive={getActiveState(2)}
            agent="hydra"
          />

          {/* Clarity to Gauntlet */}
          <AnimatedConnector
            x1={540}
            y1={240}
            x2={620}
            y2={160}
            isActive={getActiveState(2)}
            agent="hydra"
            curved
            curveDirection="up"
          />

          {/* Gauntlet to Arbiter */}
          <AnimatedConnector
            x1={750}
            y1={160}
            x2={800}
            y2={160}
            isActive={getActiveState(2) || getActiveState(3)}
            agent="onyx"
          />

          {/* Nodes */}

          {/* Sentinel (Onyx - Entry Point) */}
          <GraphNode
            id="sentinel"
            label="SENTINEL"
            sublabel="ONYX"
            agent="onyx"
            isActive={getActiveState(0)}
            x={100}
            y={160}
            size="lg"
          />

          {/* The Forge (Ignis - Code Generation) */}
          <GraphNode
            id="forge"
            label="THE FORGE"
            sublabel="IGNIS"
            agent="ignis"
            isActive={getActiveState(1)}
            x={345}
            y={160}
            size="lg"
          />

          {/* Forge Variants */}
          <ForgeNode
            variant="speed"
            isActive={getActiveState(1) && (activeForgeVariant === "speed" || !activeForgeVariant)}
            x={510}
            y={80}
          />
          <ForgeNode
            variant="safety"
            isActive={getActiveState(1) && (activeForgeVariant === "safety" || !activeForgeVariant)}
            x={530}
            y={160}
          />
          <ForgeNode
            variant="clarity"
            isActive={getActiveState(1) && (activeForgeVariant === "clarity" || !activeForgeVariant)}
            x={510}
            y={240}
          />

          {/* The Gauntlet (Hydra - Adversarial Testing) */}
          <GraphNode
            id="gauntlet"
            label="GAUNTLET"
            sublabel="HYDRA"
            agent="hydra"
            isActive={getActiveState(2)}
            x={680}
            y={160}
            size="lg"
          />

          {/* Arbiter (Onyx - Final Selection) */}
          <GraphNode
            id="arbiter"
            label="ARBITER"
            sublabel="ONYX"
            agent="onyx"
            isActive={getActiveState(3)}
            x={850}
            y={160}
            size="md"
          />
        </svg>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-onyx" />
            <span className="text-xs text-muted-foreground font-mono">ONYX - Sentinel</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-ignis" />
            <span className="text-xs text-muted-foreground font-mono">IGNIS - Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-hydra" />
            <span className="text-xs text-muted-foreground font-mono">HYDRA - Adversary</span>
          </div>
        </div>
      </div>
    </div>
  );
}
