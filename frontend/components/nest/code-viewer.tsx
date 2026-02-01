"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Zap, Shield, Eye, ThumbsDown, CheckCircle, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardSpotlight } from "@/components/ui/glowing-card";

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

// Simple syntax highlighting
const highlightCode = (code: string) => {
  const keywords = /\b(async|await|function|const|let|var|return|try|catch|throw|if|new|import|export)\b/g;
  const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g;
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
  const types = /\b(Data|Result|Promise|ValidationError)\b/g;
  const numbers = /\b(\d+)\b/g;

  return code
    .replace(comments, '<span class="text-muted-foreground/60 italic">$1</span>')
    .replace(strings, '<span class="text-amber">$&</span>')
    .replace(keywords, '<span class="text-onyx">$1</span>')
    .replace(types, '<span class="text-hydra">$1</span>')
    .replace(numbers, '<span class="text-ignis">$1</span>');
};

export function CodeViewer() {
  const [activeTab, setActiveTab] = useState("safety");
  const [copied, setCopied] = useState(false);
  const active = variants.find((v) => v.id === activeTab)!;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(active.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass-panel rounded-2xl overflow-hidden"
    >
      {/* Tabs */}
      <div className="flex border-b border-border/50 bg-background/50">
        {variants.map((v, index) => {
          const Icon = v.icon;
          const isActive = v.id === activeTab;
          return (
            <motion.button
              key={v.id}
              onClick={() => setActiveTab(v.id)}
              className={cn(
                "relative flex-1 px-4 py-4 flex items-center justify-center gap-2 transition-all",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4" style={{ color: v.color }} />
              <span className="text-sm font-medium">{v.name}</span>

              {/* Champion Badge */}
              {v.champion && (
                <motion.span
                  className="absolute -top-1 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1"
                  style={{
                    backgroundColor: `${v.color}20`,
                    color: v.color,
                    boxShadow: `0 0 15px ${v.color}40`,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.5 }}
                >
                  <Trophy className="w-3 h-3" />
                  CHAMPION
                </motion.span>
              )}

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: v.color }}
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="p-5">
        {/* Code Block */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-xl bg-black/60 overflow-hidden border border-border/30"
          >
            {/* Window Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-black/40">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                variant_{active.id}.ts
              </span>
              <motion.button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </motion.button>
            </div>

            {/* Code Content with Highlighting */}
            <div className="p-5 overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed">
                <code
                  className="text-foreground/90"
                  dangerouslySetInnerHTML={{ __html: highlightCode(active.code) }}
                />
              </pre>
            </div>

            {/* Gradient Overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
              style={{
                background: `linear-gradient(to top, ${active.color}10, transparent)`,
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Stats Grid */}
        <motion.div
          className="mt-5 grid grid-cols-4 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Object.entries(active.stats).map(([key, value], i) => (
            <motion.div
              key={key}
              className="relative p-4 rounded-xl border border-border/30 bg-card/50 text-center overflow-hidden group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, borderColor: `${active.color}50` }}
            >
              {/* Hover Glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `radial-gradient(circle at center, ${active.color}10, transparent 70%)`,
                }}
              />

              <p className="text-xs text-muted-foreground capitalize relative z-10">
                {key}
              </p>
              <motion.p
                className="text-lg font-bold font-mono mt-1 relative z-10"
                style={{ color: active.color }}
                key={`${activeTab}-${key}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {value}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-3">
          <motion.button
            className="flex-1 py-3 px-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all flex items-center justify-center gap-2 font-medium"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <ThumbsDown className="w-4 h-4" />
            Veto
          </motion.button>
          <motion.button
            className="flex-1 py-3 px-4 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 transition-all flex items-center justify-center gap-2 font-medium"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <CheckCircle className="w-4 h-4" />
            Authorize
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
