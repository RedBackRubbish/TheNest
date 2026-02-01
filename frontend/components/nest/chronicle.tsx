"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { nestAPI, type ChronicleCase } from "@/lib/api";

// Case type icons
const CaseTypeIcons = {
  precedent: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  appeal: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 9l6-6m0 0l6 6m-6-6v12a6 6 0 01-12 0v-3" />
    </svg>
  ),
  null_verdict: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
  ungoverned: (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
};

interface CaseDetailModalProps {
  caseData: ChronicleCase;
  onClose: () => void;
  onAppeal?: (caseId: string) => void;
}

function CaseDetailModal({ caseData, onClose, onAppeal }: CaseDetailModalProps) {
  const [appeals, setAppeals] = useState<ChronicleCase[]>([]);
  const [loadingAppeals, setLoadingAppeals] = useState(true);

  useEffect(() => {
    async function fetchAppeals() {
      try {
        const result = await nestAPI.getCaseAppeals(caseData.id);
        setAppeals(result.appeals);
      } catch {
        // Silent fail for now
      } finally {
        setLoadingAppeals(false);
      }
    }
    fetchAppeals();
  }, [caseData.id]);

  const rulingConfig = {
    approved: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    refused: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
    ungoverned: { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
    overturned: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    upheld: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  };

  const config = rulingConfig[caseData.ruling] || rulingConfig.refused;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="bg-[#0a0a0d] border border-white/10 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="seal">{caseData.case_type.toUpperCase()}</span>
            <span className="font-mono text-[10px] text-zinc-500 tracking-wider">{caseData.id}</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[60vh]">
          {/* Question */}
          <div className="mb-6">
            <span className="chassis-label text-zinc-600 block mb-2">DIRECTIVE</span>
            <p className="font-mono text-sm text-zinc-300 leading-relaxed">{caseData.question}</p>
          </div>

          {/* Ruling */}
          <div className="mb-6">
            <span className="chassis-label text-zinc-600 block mb-2">RULING</span>
            <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded", config.bg, config.border, "border")}>
              <span className={cn("font-mono text-xs font-semibold uppercase tracking-wider", config.color)}>
                {caseData.ruling}
              </span>
            </div>
          </div>

          {/* Votes */}
          {caseData.votes && caseData.votes.length > 0 && (
            <div className="mb-6">
              <span className="chassis-label text-zinc-600 block mb-2">SENATE VOTES</span>
              <div className="space-y-2">
                {caseData.votes.map((vote, i) => (
                  <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn(
                        "font-mono text-[10px] font-semibold tracking-wider",
                        vote.agent.includes("onyx") ? "text-blue-400" :
                        vote.agent.includes("ignis") ? "text-amber-400" :
                        vote.agent.includes("hydra") ? "text-red-400" : "text-zinc-400"
                      )}>
                        {vote.agent.toUpperCase()}
                      </span>
                      <span className={cn(
                        "font-mono text-[10px]",
                        vote.verdict === "AUTHORIZE" ? "text-emerald-400" : "text-red-400"
                      )}>
                        {vote.verdict}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-600">
                        {Math.round(vote.confidence * 100)}% confidence
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{vote.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appeals */}
          {!loadingAppeals && appeals.length > 0 && (
            <div className="mb-6">
              <span className="chassis-label text-zinc-600 block mb-2">APPEAL HISTORY ({appeals.length})</span>
              <div className="space-y-2">
                {appeals.map((appeal) => (
                  <div key={appeal.id} className="p-3 bg-purple-500/5 border border-purple-500/20 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] text-purple-400/80 tracking-wider">{appeal.id}</span>
                      <span className={cn(
                        "font-mono text-[10px]",
                        appeal.ruling === "overturned" ? "text-amber-400" : "text-blue-400"
                      )}>
                        {appeal.ruling.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="chassis-label text-zinc-700">TIMESTAMP</span>
              <p className="text-zinc-500 mt-1">{new Date(caseData.timestamp).toLocaleString()}</p>
            </div>
            <div>
              <span className="chassis-label text-zinc-700">APPEAL COUNT</span>
              <p className="text-zinc-500 mt-1">{caseData.appeal_count}</p>
            </div>
            {caseData.artifact_hash && (
              <div className="col-span-2">
                <span className="chassis-label text-zinc-700">ARTIFACT HASH</span>
                <p className="text-zinc-600 mt-1 truncate">{caseData.artifact_hash}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {caseData.ruling === "refused" && (
          <div className="px-6 py-4 border-t border-white/10 flex justify-end">
            <button
              onClick={() => onAppeal?.(caseData.id)}
              className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded text-purple-400 text-xs font-mono uppercase tracking-wider hover:bg-purple-600/30 transition-colors"
            >
              FILE APPEAL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Chronicle() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cases, setCases] = useState<ChronicleCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<ChronicleCase | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchCases = useCallback(async (query: string) => {
    if (!query.trim()) {
      setCases([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await nestAPI.searchChronicle(query);
      // Results are already ChronicleCase[] from the API
      setCases(result.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to search chronicle");
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCases(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchCases]);

  return (
    <div className="h-full flex flex-col p-6">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="chassis-label text-zinc-600">CASE LAW ARCHIVE</span>
              <span className="seal">STARE DECISIS</span>
            </div>
            <p className="text-xs text-zinc-700 font-mono">Constitutional precedent database • Append-only • Immutable</p>
          </div>
          <div className="chassis-label text-zinc-700 tabular-nums">
            {hasSearched ? `${cases.length} RESULTS` : "READY"}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cases by directive, ID, or keywords..."
            className="w-full pl-12 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-lg font-mono text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-white/20 transition-colors"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="font-mono text-xs text-red-400">{error}</p>
            <p className="font-mono text-[10px] text-zinc-500 mt-1">Ensure the backend is running at localhost:8000</p>
          </div>
        )}

        {/* Cases Table */}
        <div className="flex-1 border border-white/10 rounded-lg overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/[0.02] border-b border-white/10">
            <div className="col-span-1 chassis-label text-zinc-600">TYPE</div>
            <div className="col-span-2 chassis-label text-zinc-600">CASE ID</div>
            <div className="col-span-5 chassis-label text-zinc-600">DIRECTIVE</div>
            <div className="col-span-2 chassis-label text-zinc-600">TIMESTAMP</div>
            <div className="col-span-1 chassis-label text-zinc-600">RULING</div>
            <div className="col-span-1 chassis-label text-zinc-600 text-right">APL</div>
          </div>

          {/* Data Rows */}
          <div className="overflow-auto max-h-[calc(100vh-400px)]">
            {cases.map((c, i) => (
              <CaseRow key={c.id} caseData={c} isEven={i % 2 === 0} onClick={() => setSelectedCase(c)} />
            ))}

            {!loading && hasSearched && cases.length === 0 && (
              <div className="text-center py-16">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="chassis-label text-zinc-600">NO MATCHING PRECEDENT</span>
                <p className="text-[10px] text-zinc-700 font-mono mt-2">Try a different search query</p>
              </div>
            )}

            {!hasSearched && (
              <div className="text-center py-16">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center">
                  {CaseTypeIcons.precedent}
                </div>
                <span className="chassis-label text-zinc-600">ENTER SEARCH QUERY</span>
                <p className="text-[10px] text-zinc-700 font-mono mt-2 max-w-xs mx-auto">
                  Search the constitutional case archive by directive text, case ID, or keywords
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 flex items-center justify-between">
          <p className="text-[10px] text-zinc-700 font-mono tracking-wide">
            ARTICLE 7: ALL PRECEDENT IS BINDING • CHRONICLE IS APPEND-ONLY
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] text-zinc-600 font-mono">APPROVED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[9px] text-zinc-600 font-mono">REFUSED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span className="text-[9px] text-zinc-600 font-mono">UNGOVERNED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
          onAppeal={(id) => {
            console.log("Appeal filed for:", id);
            setSelectedCase(null);
          }}
        />
      )}
    </div>
  );
}

function CaseRow({ caseData, isEven, onClick }: { caseData: ChronicleCase; isEven: boolean; onClick: () => void }) {
  const rulingConfig = {
    approved: { color: "text-emerald-400", dot: "bg-emerald-500" },
    refused: { color: "text-red-400", dot: "bg-red-500" },
    ungoverned: { color: "text-purple-400", dot: "bg-purple-500" },
    overturned: { color: "text-amber-400", dot: "bg-amber-500" },
    upheld: { color: "text-blue-400", dot: "bg-blue-500" },
  };

  const typeConfig = {
    precedent: { color: "text-blue-400/60", icon: CaseTypeIcons.precedent },
    appeal: { color: "text-purple-400/60", icon: CaseTypeIcons.appeal },
    null_verdict: { color: "text-red-400/60", icon: CaseTypeIcons.null_verdict },
    ungoverned: { color: "text-amber-400/60", icon: CaseTypeIcons.ungoverned },
  };

  const ruling = rulingConfig[caseData.ruling] || rulingConfig.refused;
  const caseType = typeConfig[caseData.case_type] || typeConfig.precedent;

  return (
    <div
      onClick={onClick}
      className={cn(
        "grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/5 cursor-pointer transition-colors",
        isEven ? "bg-transparent" : "bg-white/[0.01]",
        "hover:bg-white/[0.03]"
      )}
    >
      <div className={cn("col-span-1 flex items-center", caseType.color)}>
        {caseType.icon}
      </div>
      <div className="col-span-2 font-mono text-[10px] text-zinc-500 truncate tracking-wide">
        {caseData.id.slice(0, 20)}...
      </div>
      <div className="col-span-5 font-mono text-xs text-zinc-300 truncate">
        {caseData.question}
      </div>
      <div className="col-span-2 font-mono text-[10px] text-zinc-600 tabular-nums">
        {caseData.timestamp.slice(0, 10)}
      </div>
      <div className="col-span-1 flex items-center gap-1.5">
        <div className={cn("w-1.5 h-1.5 rounded-full", ruling.dot)} />
        <span className={cn("font-mono text-[10px] uppercase tracking-wider", ruling.color)}>
          {caseData.ruling.slice(0, 3)}
        </span>
      </div>
      <div className="col-span-1 text-right font-mono text-[10px] text-zinc-600 tabular-nums">
        {caseData.appeal_count}
      </div>
    </div>
  );
}

export default Chronicle;

