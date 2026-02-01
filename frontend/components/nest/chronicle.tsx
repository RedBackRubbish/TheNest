"use client";

import { useState } from "react";

interface Case {
  id: string;
  question: string;
  ruling: "approved" | "refused" | "ungoverned";
  timestamp: string;
  appealCount: number;
}

const mockCases: Case[] = [
  {
    id: "CASE-2026-02-01-a1b2c3d4",
    question: "Generate secure API endpoint for user authentication",
    ruling: "approved",
    timestamp: "2026-02-01T10:30:00Z",
    appealCount: 0,
  },
  {
    id: "CASE-2026-02-01-e5f6g7h8",
    question: "Create database migration for user permissions",
    ruling: "approved",
    timestamp: "2026-02-01T11:45:00Z",
    appealCount: 0,
  },
  {
    id: "CASE-2026-02-01-i9j0k1l2",
    question: "Deploy code without security review",
    ruling: "refused",
    timestamp: "2026-02-01T14:20:00Z",
    appealCount: 1,
  },
];

export function Chronicle() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cases] = useState<Case[]>(mockCases);

  const filteredCases = cases.filter(
    (c) =>
      c.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="chassis-label text-zinc-600">CASE ARCHIVE</span>
            <p className="text-xs text-zinc-700 font-mono mt-1">Precedent &amp; Rulings Database</p>
          </div>
          <div className="chassis-label text-zinc-700 tabular-nums">
            {cases.length} RECORDS
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-xs">
            QUERY:
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search parameters..."
            className="w-full pl-16 pr-3 py-2 bg-white/[0.02] border border-white/10 rounded font-mono text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-white/20"
          />
        </div>

        {/* Table */}
        <div className="border border-white/10 rounded overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-white/[0.02] border-b border-white/10">
            <div className="col-span-3 chassis-label text-zinc-600">CASE ID</div>
            <div className="col-span-5 chassis-label text-zinc-600">DIRECTIVE</div>
            <div className="col-span-2 chassis-label text-zinc-600">TIMESTAMP</div>
            <div className="col-span-1 chassis-label text-zinc-600">RULING</div>
            <div className="col-span-1 chassis-label text-zinc-600 text-right">APL</div>
          </div>

          {/* Data Rows */}
          {filteredCases.map((c, i) => (
            <CaseRow key={c.id} caseData={c} isEven={i % 2 === 0} />
          ))}

          {filteredCases.length === 0 && (
            <div className="text-center py-12">
              <span className="chassis-label text-zinc-600">NO MATCHING RECORDS</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CaseRow({ caseData, isEven }: { caseData: Case; isEven: boolean }) {
  const rulingConfig = {
    approved: { color: "text-emerald-500/80", dot: "bg-emerald-500" },
    refused: { color: "text-red-500/80", dot: "bg-red-500" },
    ungoverned: { color: "text-amber-500/80", dot: "bg-amber-500" },
  };

  const config = rulingConfig[caseData.ruling];

  return (
    <div className={`grid grid-cols-12 gap-4 px-4 py-2.5 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${isEven ? '' : 'bg-white/[0.01]'}`}>
      <div className="col-span-3 font-mono text-[10px] text-zinc-500 truncate tracking-wide">
        {caseData.id}
      </div>
      <div className="col-span-5 font-mono text-xs text-zinc-300 truncate">
        {caseData.question}
      </div>
      <div className="col-span-2 font-mono text-[10px] text-zinc-600 tabular-nums">
        {caseData.timestamp.slice(0, 10)}
      </div>
      <div className="col-span-1 flex items-center gap-1.5">
        <div className={`w-1 h-1 rounded-full ${config.dot}`} />
        <span className={`font-mono text-[10px] uppercase tracking-wider ${config.color}`}>
          {caseData.ruling.slice(0, 3)}
        </span>
      </div>
      <div className="col-span-1 text-right font-mono text-[10px] text-zinc-600 tabular-nums">
        {caseData.appealCount}
      </div>
    </div>
  );
}
