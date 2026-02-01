"use client";

import { cn } from "@/lib/utils";

// Constitutional Articles matching the backend governance
const articles = [
  {
    number: 1,
    title: "Primacy of Human Authority",
    content: "The Keeper retains ultimate authority over all system operations. No agent may override explicit Keeper directives. Human judgment supersedes algorithmic consensus.",
    classification: "CORE",
    enforcement: "MECHANICAL",
  },
  {
    number: 7,
    title: "Stare Decisis (Binding Precedent)",
    content: "All precedent is binding. The Chronicle is append-only. No agent may modify or delete established case law. Once a decision is recorded, it becomes constitutional bedrock.",
    classification: "CORE",
    enforcement: "MECHANICAL",
    invariant: "CHRONICLE_APPEND_ONLY",
  },
  {
    number: 12,
    title: "Right to Appeal",
    content: "Any refused mission may be appealed with expanded context. Appeals expand history—they never erase it. Each appeal increases liability by 1.5x multiplier. Due process is guaranteed.",
    classification: "PROCEDURE",
    enforcement: "MECHANICAL",
    invariant: "APPEALS_EXPAND_NEVER_ERASE",
  },
  {
    number: 17,
    title: "Hydra Binding Rule",
    content: "If Hydra demonstrates a concrete exploit path, Onyx MUST either explicitly CITE and ACCEPT the risk in its reasoning, OR VETO. Ignored adversaries invalidate the Senate. This is enforced in Python logic, not prompts.",
    classification: "SECURITY",
    enforcement: "MECHANICAL",
    invariant: "HYDRA_CANNOT_BE_IGNORED",
  },
  {
    number: 23,
    title: "NullVerdict Persistence",
    content: "Refusals are constitutional law. Every NullVerdict must be persisted to the Chronicle with complete reasoning, nulling agents, and context. Refusals cannot be hidden or lost.",
    classification: "CORE",
    enforcement: "MECHANICAL",
    invariant: "NULL_VERDICTS_PERSIST",
  },
  {
    number: 31,
    title: "Ungoverned Namespace Quarantine",
    content: "Code in the ungoverned namespace is constitutionally isolated. Ungoverned artifacts may not import from governed namespaces. Cross-contamination is blocked at the filesystem level.",
    classification: "SECURITY",
    enforcement: "MECHANICAL",
    invariant: "NAMESPACE_ISOLATION",
  },
  {
    number: 42,
    title: "Fail-Closed Governance",
    content: "On error, refuse. Systems must fail safely. When governance checks encounter exceptions or uncertainty, the default is VETO. Security cannot depend on things going right.",
    classification: "SECURITY",
    enforcement: "MECHANICAL",
    invariant: "FAIL_CLOSED",
  },
  {
    number: 50,
    title: "Martial Governance (Article 50)",
    content: "The Keeper may invoke emergency powers to bypass normal governance. All artifacts generated under this article are quarantined, watermarked, and attached with explicit liability. This power is not delegable.",
    classification: "EMERGENCY",
    enforcement: "KEEPER_ONLY",
  },
  {
    number: 99,
    title: "Constitutional Immutability",
    content: "Core invariants cannot be weakened without explicit constitutional amendment. Regression tests lock kernel behavior. Any change that would allow governance bypass MUST fail automated testing.",
    classification: "META",
    enforcement: "TESTING",
  },
];

const classificationConfig = {
  CORE: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: "⚖️" },
  SECURITY: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: "🛡️" },
  PROCEDURE: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "📋" },
  EMERGENCY: { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", icon: "⚡" },
  META: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "🔒" },
};

export function Constitution() {
  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="chassis-label text-zinc-600">GOVERNANCE FRAMEWORK</span>
              <span className="seal">IMMUTABLE</span>
            </div>
            <p className="text-xs text-zinc-700 font-mono">Constitutional Articles • Mechanical Enforcement • Python-Backed Invariants</p>
          </div>
          <div className="text-right">
            <span className="chassis-label text-zinc-700">REV 2026.02</span>
            <p className="text-[9px] text-zinc-600 font-mono mt-1">v5.2 SOVEREIGN</p>
          </div>
        </div>

        {/* Classification Legend */}
        <div className="flex flex-wrap gap-3 py-3 px-4 bg-white/[0.01] border border-white/5 rounded-lg">
          {Object.entries(classificationConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs">{config.icon}</span>
              <span className={cn("text-[10px] font-mono tracking-wider", config.color)}>{key}</span>
            </div>
          ))}
        </div>

        {/* Articles */}
        <div className="space-y-4">
          {articles.map((article) => {
            const config = classificationConfig[article.classification as keyof typeof classificationConfig];
            
            return (
              <article
                key={article.number}
                className={cn(
                  "p-5 rounded-lg border transition-all group",
                  "bg-[#0a0a0d] hover:bg-[#0c0c0f]",
                  "border-white/5 hover:border-white/10"
                )}
              >
                {/* Article Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {/* Article Number */}
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      config.bg, config.border, "border"
                    )}>
                      <span className={cn("font-mono text-lg font-bold", config.color)}>
                        {article.number}
                      </span>
                    </div>
                    
                    {/* Title & Meta */}
                    <div>
                      <h2 className="font-mono text-sm text-zinc-200 font-medium tracking-wide">
                        {article.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-[9px] font-mono font-semibold tracking-widest px-2 py-0.5 rounded",
                          config.bg, config.color
                        )}>
                          {article.classification}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600 tracking-wide">
                          {article.enforcement}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Invariant Badge */}
                  {article.invariant && (
                    <div className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[8px] font-mono text-zinc-500 tracking-wider">
                      {article.invariant}
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <p className="text-xs text-zinc-400 leading-relaxed font-mono pl-16">
                  {article.content}
                </p>

                {/* Mechanical Enforcement Indicator */}
                {article.enforcement === "MECHANICAL" && (
                  <div className="mt-4 pl-16 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-mono text-emerald-500/70 tracking-wider">
                      ENFORCED IN PYTHON LOGIC • CANNOT BE BYPASSED BY LLM
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/5 space-y-4">
          {/* Invariant Summary */}
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="chassis-label text-zinc-500 block mb-3">KERNEL INVARIANTS (TEST-LOCKED)</span>
            <div className="grid grid-cols-2 gap-2">
              {articles.filter(a => a.invariant).map(a => (
                <div key={a.invariant} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-mono text-zinc-500">{a.invariant}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-zinc-700 font-mono text-center tracking-wide">
            DOCUMENT CLASSIFICATION: INTERNAL • MODIFICATION PROHIBITED WITHOUT KEEPER AUTHORIZATION
          </p>
          <p className="text-[9px] text-zinc-800 font-mono text-center">
            109 TESTS LOCKING CONSTITUTIONAL INVARIANTS • ZERO TOLERANCE FOR GOVERNANCE REGRESSION
          </p>
        </div>
      </div>
    </div>
  );
}

export default Constitution;

