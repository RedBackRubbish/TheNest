"use client";

import { useState } from "react";
import { Trophy, Zap, Shield, Eye, ThumbsDown, CheckCircle } from "lucide-react";

interface Variant {
  id: string;
  name: string;
  icon: typeof Zap;
  color: string;
  champion: boolean;
  code: string;
  stats: {
    performance: string;
    security: string;
    readability: string;
    lines: number;
  };
}

const variants: Variant[] = [
  {
    id: "speed",
    name: "Speed",
    icon: Zap,
    color: "#f97316",
    champion: false,
    code: `async function processData(input: Data[]) {
  // Optimized for speed - parallel processing
  const results = await Promise.all(
    input.map(item => transform(item))
  );
  return results.filter(Boolean);
}`,
    stats: { performance: "98ms", security: "B+", readability: "78%", lines: 6 },
  },
  {
    id: "safety",
    name: "Safety",
    icon: Shield,
    color: "#22c55e",
    champion: true,
    code: `async function processData(input: Data[]) {
  // Prioritizes safety - full validation
  if (!Array.isArray(input)) {
    throw new ValidationError("Invalid input");
  }
  
  const validated = input.filter(isValidData);
  const sanitized = validated.map(sanitize);
  
  try {
    return await Promise.all(
      sanitized.map(item => transform(item))
    );
  } catch (error) {
    logger.error("Process failed", error);
    return [];
  }
}`,
    stats: { performance: "145ms", security: "A+", readability: "85%", lines: 16 },
  },
  {
    id: "clarity",
    name: "Clarity",
    icon: Eye,
    color: "#a855f7",
    champion: false,
    code: `/**
 * Processes and transforms data items
 * @param input - Array of data to process
 * @returns Transformed results
 */
async function processData(input: Data[]): Promise<Result[]> {
  // Step 1: Validate input
  const validatedInput = validateInput(input);
  
  // Step 2: Transform each item
  const transformedItems = await transformAll(validatedInput);
  
  // Step 3: Return filtered results
  return filterSuccessful(transformedItems);
}`,
    stats: { performance: "132ms", security: "A", readability: "92%", lines: 14 },
  },
];

export function CodeViewer() {
  const [activeTab, setActiveTab] = useState("safety");
  const active = variants.find((v) => v.id === activeTab)!;

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {variants.map((v) => {
          const Icon = v.icon;
          const isActive = v.id === activeTab;
          return (
            <button
              key={v.id}
              onClick={() => setActiveTab(v.id)}
              className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all relative ${
                isActive ? "bg-secondary" : "hover:bg-secondary/50"
              }`}
              style={{ borderBottom: isActive ? `2px solid ${v.color}` : "none" }}
            >
              <Icon className="w-4 h-4" style={{ color: v.color }} />
              <span className="text-sm font-medium">{v.name}</span>
              {v.champion && (
                <span
                  className="absolute -top-1 -right-1 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1"
                  style={{
                    backgroundColor: `${v.color}30`,
                    color: v.color,
                    boxShadow: `0 0 12px ${v.color}50`,
                  }}
                >
                  <Trophy className="w-3 h-3" />
                  Senate Choice
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {/* Code Block */}
        <div className="relative rounded-lg bg-black/60 overflow-hidden">
          <div className="absolute top-2 right-2 flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <pre className="p-4 pt-8 overflow-x-auto text-sm font-mono leading-relaxed">
            <code style={{ color: "#e5e5e5" }}>{active.code}</code>
          </pre>
        </div>

        {/* Stats Card */}
        <div
          className="mt-4 p-3 rounded-lg border"
          style={{ borderColor: `${active.color}40`, backgroundColor: `${active.color}10` }}
        >
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Performance</p>
              <p className="font-mono font-bold" style={{ color: active.color }}>
                {active.stats.performance}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Security</p>
              <p className="font-mono font-bold" style={{ color: active.color }}>
                {active.stats.security}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Readability</p>
              <p className="font-mono font-bold" style={{ color: active.color }}>
                {active.stats.readability}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lines</p>
              <p className="font-mono font-bold" style={{ color: active.color }}>
                {active.stats.lines}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3">
          <button className="flex-1 py-2.5 px-4 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 font-medium">
            <ThumbsDown className="w-4 h-4" />
            Veto
          </button>
          <button className="flex-1 py-2.5 px-4 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4" />
            Authorize
          </button>
        </div>
      </div>
    </div>
  );
}
