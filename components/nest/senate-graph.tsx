"use client";

import { useState, useEffect } from "react";

type NodeState = "idle" | "active" | "complete";

interface AgentNode {
  id: string;
  name: string;
  role: string;
  color: string;
  glowColor: string;
}

const agents: AgentNode[] = [
  { id: "sentinel", name: "ONYX", role: "Sentinel", color: "#a855f7", glowColor: "rgba(168, 85, 247, 0.6)" },
  { id: "forge", name: "IGNIS", role: "The Forge", color: "#f97316", glowColor: "rgba(249, 115, 22, 0.6)" },
  { id: "gauntlet", name: "HYDRA", role: "The Gauntlet", color: "#22c55e", glowColor: "rgba(34, 197, 94, 0.6)" },
  { id: "arbiter", name: "ONYX", role: "Arbiter", color: "#a855f7", glowColor: "rgba(168, 85, 247, 0.6)" },
];

const variants = ["Speed", "Safety", "Clarity"];

export function SenateGraph() {
  const [activeNode, setActiveNode] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % agents.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Senate Logic Graph</h2>
          <p className="text-sm text-muted-foreground">Decision Pipeline Visualization</p>
        </div>
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className="px-3 py-1.5 text-xs font-mono rounded border border-border hover:bg-secondary transition-colors"
        >
          {isAnimating ? "PAUSE" : "RESUME"}
        </button>
      </div>

      <div className="relative h-64 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 200">
          {/* Connection Lines */}
          <line x1="120" y1="100" x2="280" y2="100" stroke="#333" strokeWidth="2" />
          <line x1="280" y1="100" x2="350" y2="50" stroke="#333" strokeWidth="2" />
          <line x1="280" y1="100" x2="350" y2="100" stroke="#333" strokeWidth="2" />
          <line x1="280" y1="100" x2="350" y2="150" stroke="#333" strokeWidth="2" />
          <line x1="450" y1="50" x2="520" y2="100" stroke="#333" strokeWidth="2" />
          <line x1="450" y1="100" x2="520" y2="100" stroke="#333" strokeWidth="2" />
          <line x1="450" y1="150" x2="520" y2="100" stroke="#333" strokeWidth="2" />
          <line x1="600" y1="100" x2="720" y2="100" stroke="#333" strokeWidth="2" />

          {/* Animated Flow Lines */}
          {activeNode >= 0 && (
            <line
              x1="120" y1="100" x2="280" y2="100"
              stroke={agents[0].color}
              strokeWidth="2"
              strokeDasharray="10,10"
              className={activeNode === 0 ? "animate-flow" : ""}
              opacity={activeNode >= 0 ? 1 : 0.3}
            />
          )}
        </svg>

        {/* Nodes */}
        <div className="relative z-10 flex items-center justify-between w-full px-8">
          {/* Sentinel Node */}
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500"
              style={{
                borderColor: agents[0].color,
                boxShadow: activeNode === 0 ? `0 0 30px ${agents[0].glowColor}` : "none",
                backgroundColor: activeNode === 0 ? `${agents[0].color}20` : "transparent",
              }}
            >
              <span className="text-2xl">🛡️</span>
            </div>
            <span className="mt-2 text-xs font-mono text-muted-foreground">{agents[0].role}</span>
            <span className="text-xs font-bold" style={{ color: agents[0].color }}>{agents[0].name}</span>
          </div>

          {/* Forge Node with Branches */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col gap-2">
              {variants.map((v, i) => (
                <div
                  key={v}
                  className="px-3 py-1 rounded text-xs font-mono border transition-all duration-300"
                  style={{
                    borderColor: activeNode === 1 ? agents[1].color : "#333",
                    backgroundColor: activeNode === 1 ? `${agents[1].color}20` : "transparent",
                    boxShadow: activeNode === 1 ? `0 0 15px ${agents[1].glowColor}` : "none",
                  }}
                >
                  {v}
                </div>
              ))}
            </div>
            <span className="mt-2 text-xs font-mono text-muted-foreground">{agents[1].role}</span>
            <span className="text-xs font-bold" style={{ color: agents[1].color }}>{agents[1].name}</span>
          </div>

          {/* Gauntlet Node */}
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500"
              style={{
                borderColor: agents[2].color,
                boxShadow: activeNode === 2 ? `0 0 30px ${agents[2].glowColor}` : "none",
                backgroundColor: activeNode === 2 ? `${agents[2].color}20` : "transparent",
              }}
            >
              <span className="text-2xl">🐉</span>
            </div>
            <span className="mt-2 text-xs font-mono text-muted-foreground">{agents[2].role}</span>
            <span className="text-xs font-bold" style={{ color: agents[2].color }}>{agents[2].name}</span>
          </div>

          {/* Arbiter Node */}
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500"
              style={{
                borderColor: agents[3].color,
                boxShadow: activeNode === 3 ? `0 0 30px ${agents[3].glowColor}` : "none",
                backgroundColor: activeNode === 3 ? `${agents[3].color}20` : "transparent",
              }}
            >
              <span className="text-2xl">⚖️</span>
            </div>
            <span className="mt-2 text-xs font-mono text-muted-foreground">{agents[3].role}</span>
            <span className="text-xs font-bold" style={{ color: agents[3].color }}>{agents[3].name}</span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs font-mono">
        <span className="text-muted-foreground">
          Active: <span style={{ color: agents[activeNode].color }}>{agents[activeNode].name}</span>
        </span>
        <span className="text-muted-foreground">Phase: {activeNode + 1}/4</span>
      </div>
    </div>
  );
}
