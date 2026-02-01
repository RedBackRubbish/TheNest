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
    <div className="h-full flex flex-col p-4">
      <div className="max-w-4xl mx-auto w-full space-y-4">
        <div>
          <h1 className="text-lg font-medium text-[#e4e4e7]">Chronicle</h1>
          <p className="text-sm text-[#52525b]">Case law and precedent history</p>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cases..."
          className="w-full px-3 py-2 bg-[#111113] border border-[#1c1c1f] rounded text-sm text-[#e4e4e7] placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6]"
        />

        <div className="space-y-1">
          <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-medium text-[#52525b] border-b border-[#1c1c1f]">
            <div className="col-span-3">Case ID</div>
            <div className="col-span-6">Question</div>
            <div className="col-span-2">Ruling</div>
            <div className="col-span-1 text-right">Appeals</div>
          </div>

          {filteredCases.map((c) => (
            <CaseRow key={c.id} caseData={c} />
          ))}

          {filteredCases.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[#52525b]">No cases found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CaseRow({ caseData }: { caseData: Case }) {
  const rulingStyles = {
    approved: "text-[#22c55e]",
    refused: "text-[#ef4444]",
    ungoverned: "text-[#eab308]",
  };

  return (
    <div className="grid grid-cols-12 gap-4 px-3 py-2.5 text-sm hover:bg-[#111113] rounded transition-colors cursor-pointer">
      <div className="col-span-3 font-mono text-xs text-[#a1a1aa] truncate">
        {caseData.id}
      </div>
      <div className="col-span-6 text-[#e4e4e7] truncate">{caseData.question}</div>
      <div className={`col-span-2 font-mono text-xs uppercase ${rulingStyles[caseData.ruling]}`}>
        {caseData.ruling}
      </div>
      <div className="col-span-1 text-right text-[#52525b]">
        {caseData.appealCount}
      </div>
    </div>
  );
}
