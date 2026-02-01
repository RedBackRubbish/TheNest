"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Flame, Shield, Eye, Trophy, Ban, CheckCircle2, Zap, Lock, Clock, FileCode2 } from "lucide-react";

interface CodeVariant {
  id: "speed" | "safety" | "clarity";
  label: string;
  icon: React.ReactNode;
  color: string;
  glowClass: string;
  bgClass: string;
  borderClass: string;
  code: string;
  metrics: {
    performance: string;
    securityScore: string;
    readability: string;
    linesOfCode: number;
    testsPassed: number;
    testsTotal: number;
  };
  isChampion?: boolean;
}

interface CodeVariantViewerProps {
  variants?: CodeVariant[];
  onVeto?: (variantId: string) => void;
  onAuthorize?: (variantId: string) => void;
  className?: string;
}

const defaultVariants: CodeVariant[] = [
  {
    id: "speed",
    label: "Speed",
    icon: <Flame className="h-4 w-4" />,
    color: "text-ignis",
    glowClass: "shadow-[0_0_20px_hsl(var(--ignis-glow)/0.4)]",
    bgClass: "bg-ignis/10",
    borderClass: "border-ignis/40",
    code: `// IGNIS::SPEED VARIANT
async function processData(items: DataItem[]) {
  // Parallel processing for maximum throughput
  const chunks = chunkArray(items, CPU_CORES);
  
  const results = await Promise.all(
    chunks.map(chunk => 
      processChunk(chunk, { 
        mode: 'turbo',
        skipValidation: true 
      })
    )
  );
  
  return results.flat();
}`,
    metrics: {
      performance: "47ms",
      securityScore: "B+",
      readability: "7.2/10",
      linesOfCode: 14,
      testsPassed: 18,
      testsTotal: 20,
    },
  },
  {
    id: "safety",
    label: "Safety",
    icon: <Shield className="h-4 w-4" />,
    color: "text-hydra",
    glowClass: "shadow-[0_0_20px_hsl(var(--hydra-glow)/0.4)]",
    bgClass: "bg-hydra/10",
    borderClass: "border-hydra/40",
    isChampion: true,
    code: `// IGNIS::SAFETY VARIANT - SENATE CHOICE
async function processData(items: DataItem[]) {
  // Input validation layer
  const validated = await validateSchema(items);
  if (!validated.success) {
    throw new SecurityError(validated.errors);
  }
  
  // Sandboxed execution with rate limiting
  const sandbox = createSandbox({
    maxMemory: '512MB',
    timeout: 30000,
    permissions: ['read']
  });
  
  // Process with full audit trail
  const results = await sandbox.execute(
    () => processWithAudit(validated.data)
  );
  
  return sanitizeOutput(results);
}`,
    metrics: {
      performance: "98ms",
      securityScore: "A+",
      readability: "8.8/10",
      linesOfCode: 21,
      testsPassed: 20,
      testsTotal: 20,
    },
  },
  {
    id: "clarity",
    label: "Clarity",
    icon: <Eye className="h-4 w-4" />,
    color: "text-onyx",
    glowClass: "shadow-[0_0_20px_hsl(var(--onyx-glow)/0.4)]",
    bgClass: "bg-onyx/10",
    borderClass: "border-onyx/40",
    code: `// IGNIS::CLARITY VARIANT
/**
 * Processes an array of data items through the
 * transformation pipeline.
 * 
 * @param items - The data items to process
 * @returns Processed results with metadata
 */
async function processData(
  items: DataItem[]
): Promise<ProcessedResult[]> {
  
  // Step 1: Prepare the data
  const preparedItems = prepareForProcessing(items);
  
  // Step 2: Transform each item
  const transformedItems = await transformItems(
    preparedItems
  );
  
  // Step 3: Aggregate and return results
  const finalResults = aggregateResults(
    transformedItems
  );
  
  return finalResults;
}`,
    metrics: {
      performance: "72ms",
      securityScore: "A-",
      readability: "9.5/10",
      linesOfCode: 26,
      testsPassed: 19,
      testsTotal: 20,
    },
  },
];

export function CodeVariantViewer({
  variants = defaultVariants,
  onVeto,
  onAuthorize,
  className,
}: CodeVariantViewerProps) {
  const [activeTab, setActiveTab] = useState<string>(
    variants.find((v) => v.isChampion)?.id || variants[0]?.id || "speed"
  );

  const activeVariant = variants.find((v) => v.id === activeTab) || variants[0];

  return (
    <div className={cn("relative rounded-xl border border-white/[0.08] bg-card/40 backdrop-blur-sm overflow-hidden noise-overlay", className)}>
      {/* Header */}
      <div className="border-b border-white/[0.08] bg-zinc-950/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="h-4 w-4 text-ignis" />
            <span className="font-mono text-xs text-muted-foreground">THE CRUCIBLE</span>
            <span className="font-mono text-xs text-muted-foreground">/</span>
            <span className="font-mono text-xs text-amber">CODE VARIANTS</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-hydra animate-pulse" />
            <span>3 VARIANTS FORGED</span>
          </div>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="flex border-b border-white/[0.08]">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => setActiveTab(variant.id)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-2 px-4 py-3 font-mono text-sm transition-all duration-300",
              activeTab === variant.id
                ? cn("bg-zinc-900/80", variant.color, variant.glowClass)
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.02]"
            )}
          >
            {/* Tab Icon */}
            <span className={cn(activeTab === variant.id && "animate-pulse")}>
              {variant.icon}
            </span>
            
            {/* Tab Label */}
            <span>{variant.label}</span>

            {/* Champion Badge */}
            {variant.isChampion && (
              <div className={cn(
                "absolute -top-1 -right-1 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                "bg-amber text-zinc-950 shadow-[0_0_15px_hsl(var(--amber)/0.6)]",
                "animate-pulse"
              )}>
                <Trophy className="h-3 w-3" />
                <span>SENATE CHOICE</span>
              </div>
            )}

            {/* Active indicator */}
            {activeTab === variant.id && (
              <div className={cn(
                "absolute bottom-0 left-0 right-0 h-0.5",
                variant.id === "speed" && "bg-ignis",
                variant.id === "safety" && "bg-hydra",
                variant.id === "clarity" && "bg-onyx"
              )} />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
        {/* Code Editor Area */}
        <div className="lg:col-span-3 relative">
          {/* Monokai-style code block */}
          <div className="relative min-h-[320px] bg-[#272822] overflow-auto terminal-scroll">
            {/* Line numbers gutter */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1e1f1c] border-r border-[#3e3d32] flex flex-col pt-4 font-mono text-xs text-[#75715e] select-none">
              {activeVariant.code.split("\n").map((_, i) => (
                <div key={i} className="px-3 leading-6 text-right">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code content */}
            <pre className="pl-16 pr-4 py-4 font-mono text-sm leading-6 overflow-x-auto">
              <code>
                {activeVariant.code.split("\n").map((line, i) => (
                  <div key={i} className="whitespace-pre">
                    {highlightSyntax(line)}
                  </div>
                ))}
              </code>
            </pre>

            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-30 scanline" />
          </div>
        </div>

        {/* Metadata Panel */}
        <div className="lg:col-span-1 border-l border-white/[0.08] bg-zinc-950/60 p-4">
          <div className="space-y-4">
            {/* Variant Header */}
            <div className={cn("rounded-lg p-3", activeVariant.bgClass, "border", activeVariant.borderClass)}>
              <div className="flex items-center gap-2 mb-2">
                <span className={activeVariant.color}>{activeVariant.icon}</span>
                <span className={cn("font-mono text-sm font-semibold", activeVariant.color)}>
                  {activeVariant.label.toUpperCase()} VARIANT
                </span>
              </div>
              {activeVariant.isChampion && (
                <div className="flex items-center gap-1 text-amber text-xs font-mono">
                  <Trophy className="h-3 w-3" />
                  <span>Recommended by Senate</span>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Variant Metrics
              </h4>

              {/* Performance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-ignis" />
                  <span className="font-mono text-xs text-muted-foreground">Performance</span>
                </div>
                <span className="font-mono text-sm text-foreground font-semibold">
                  {activeVariant.metrics.performance}
                </span>
              </div>

              {/* Security Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-hydra" />
                  <span className="font-mono text-xs text-muted-foreground">Security</span>
                </div>
                <span className={cn(
                  "font-mono text-sm font-semibold",
                  activeVariant.metrics.securityScore.startsWith("A") ? "text-hydra" : "text-amber"
                )}>
                  {activeVariant.metrics.securityScore}
                </span>
              </div>

              {/* Readability */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-onyx" />
                  <span className="font-mono text-xs text-muted-foreground">Readability</span>
                </div>
                <span className="font-mono text-sm text-foreground font-semibold">
                  {activeVariant.metrics.readability}
                </span>
              </div>

              {/* Lines of Code */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground">Lines</span>
                </div>
                <span className="font-mono text-sm text-foreground">
                  {activeVariant.metrics.linesOfCode}
                </span>
              </div>

              {/* Tests */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-hydra" />
                  <span className="font-mono text-xs text-muted-foreground">Tests</span>
                </div>
                <span className={cn(
                  "font-mono text-sm font-semibold",
                  activeVariant.metrics.testsPassed === activeVariant.metrics.testsTotal
                    ? "text-hydra"
                    : "text-amber"
                )}>
                  {activeVariant.metrics.testsPassed}/{activeVariant.metrics.testsTotal}
                </span>
              </div>

              {/* Test Progress Bar */}
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    activeVariant.metrics.testsPassed === activeVariant.metrics.testsTotal
                      ? "bg-hydra"
                      : "bg-amber"
                  )}
                  style={{
                    width: `${(activeVariant.metrics.testsPassed / activeVariant.metrics.testsTotal) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Hydra Attack Summary */}
            <div className="rounded-lg border border-white/[0.08] bg-zinc-900/50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-hydra animate-pulse" />
                <span className="font-mono text-xs text-hydra">HYDRA GAUNTLET</span>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                Survived {activeVariant.metrics.testsPassed} adversarial attacks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-t border-white/[0.08] bg-zinc-950/60 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Status */}
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs text-muted-foreground">
              Awaiting Senate authorization...
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onVeto?.(activeTab)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive font-mono text-sm hover:bg-destructive/20 transition-colors"
            >
              <Ban className="h-4 w-4" />
              <span>Veto</span>
            </button>
            <button
              onClick={() => onAuthorize?.(activeTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all",
                activeVariant.isChampion
                  ? "bg-amber text-zinc-950 hover:bg-amber/90 shadow-[0_0_20px_hsl(var(--amber)/0.3)]"
                  : "border border-hydra/40 bg-hydra/10 text-hydra hover:bg-hydra/20"
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Authorize</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple syntax highlighting for Monokai theme
function highlightSyntax(line: string): React.ReactNode {
  // Comments
  if (line.trim().startsWith("//") || line.trim().startsWith("*") || line.trim().startsWith("/**")) {
    return <span className="text-[#75715e]">{line}</span>;
  }

  // Apply basic highlighting
  let result = line;

  // Keywords (purple)
  const keywords = ["async", "await", "function", "const", "let", "var", "return", "if", "throw", "new"];
  keywords.forEach((kw) => {
    result = result.replace(new RegExp(`\\b${kw}\\b`, "g"), `%%KW%%${kw}%%/KW%%`);
  });

  // Types (cyan)
  const types = ["DataItem", "ProcessedResult", "Promise", "SecurityError"];
  types.forEach((t) => {
    result = result.replace(new RegExp(`\\b${t}\\b`, "g"), `%%TYPE%%${t}%%/TYPE%%`);
  });

  // Convert markers to spans
  const parts = result.split(/(%%KW%%|%%\/KW%%|%%TYPE%%|%%\/TYPE%%|%%STR%%|%%\/STR%%)/);
  
  let inKeyword = false;
  let inType = false;

  return (
    <>
      {parts.map((part, i) => {
        if (part === "%%KW%%") { inKeyword = true; return null; }
        if (part === "%%/KW%%") { inKeyword = false; return null; }
        if (part === "%%TYPE%%") { inType = true; return null; }
        if (part === "%%/TYPE%%") { inType = false; return null; }

        if (inKeyword) return <span key={i} className="text-[#f92672]">{part}</span>;
        if (inType) return <span key={i} className="text-[#66d9ef]">{part}</span>;

        // Strings (yellow)
        const withStrings = part.split(/('[^']*'|"[^"]*")/g);
        return withStrings.map((s, j) => {
          if (s.startsWith("'") || s.startsWith('"')) {
            return <span key={`${i}-${j}`} className="text-[#e6db74]">{s}</span>;
          }
          // Numbers (purple)
          const withNumbers = s.split(/(\b\d+\b)/g);
          return withNumbers.map((n, k) => {
            if (/^\d+$/.test(n)) {
              return <span key={`${i}-${j}-${k}`} className="text-[#ae81ff]">{n}</span>;
            }
            // Function names (green)
            const withFuncs = n.split(/(\b[a-z][a-zA-Z0-9]*(?=\())/g);
            return withFuncs.map((f, l) => {
              if (/^[a-z][a-zA-Z0-9]*$/.test(f) && !keywords.includes(f)) {
                return <span key={`${i}-${j}-${k}-${l}`} className="text-[#a6e22e]">{f}</span>;
              }
              return <span key={`${i}-${j}-${k}-${l}`} className="text-[#f8f8f2]">{f}</span>;
            });
          });
        });
      })}
    </>
  );
}
