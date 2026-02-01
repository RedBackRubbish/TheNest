"use client";

import { useState } from "react";

interface Mission {
  id: string;
  text: string;
  status: "pending" | "processing" | "approved" | "refused";
  timestamp: string;
}

export function CommandPanel() {
  const [input, setInput] = useState("");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return;

    const mission: Mission = {
      id: crypto.randomUUID(),
      text: input,
      status: "processing",
      timestamp: new Date().toISOString(),
    };

    setMissions((prev) => [mission, ...prev]);
    setInput("");
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setMissions((prev) =>
        prev.map((m) =>
          m.id === mission.id
            ? { ...m, status: Math.random() > 0.3 ? "approved" : "refused" }
            : m
        )
      );
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto space-y-2">
          {missions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#52525b] text-sm">No missions submitted</p>
            </div>
          ) : (
            missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))
          )}
        </div>
      </div>

      <div className="border-t border-[#1c1c1f] p-4 bg-[#0c0c0e]">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Enter mission directive..."
              disabled={isProcessing}
              className="flex-1 px-3 py-2 bg-[#111113] border border-[#1c1c1f] rounded text-sm text-[#e4e4e7] placeholder:text-[#52525b] focus:outline-none focus:border-[#3b82f6] disabled:opacity-50"
            />
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !input.trim()}
              className="px-4 py-2 bg-[#3b82f6] text-white text-sm font-medium rounded hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? "Processing" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionCard({ mission }: { mission: Mission }) {
  const statusStyles = {
    pending: "text-[#52525b]",
    processing: "text-[#eab308]",
    approved: "text-[#22c55e]",
    refused: "text-[#ef4444]",
  };

  const statusLabels = {
    pending: "PENDING",
    processing: "PROCESSING",
    approved: "APPROVED",
    refused: "REFUSED",
  };

  return (
    <div className="p-3 bg-[#111113] border border-[#1c1c1f] rounded">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#e4e4e7] break-words">{mission.text}</p>
          <p className="text-xs text-[#52525b] mt-1 font-mono">
            {new Date(mission.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <span className={`text-xs font-mono ${statusStyles[mission.status]}`}>
          {statusLabels[mission.status]}
        </span>
      </div>
    </div>
  );
}
