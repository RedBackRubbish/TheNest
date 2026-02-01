"use client";

import { useState } from "react";

export function Settings() {
  const [apiEndpoint, setApiEndpoint] = useState("http://localhost:8000");
  const [securedMode, setSecuredMode] = useState(false);

  return (
    <div className="h-full overflow-auto p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-lg font-medium text-[#e4e4e7]">Settings</h1>
          <p className="text-sm text-[#52525b]">System configuration</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-[#111113] border border-[#1c1c1f] rounded space-y-4">
            <h2 className="text-sm font-medium text-[#e4e4e7]">Connection</h2>
            
            <div className="space-y-2">
              <label className="text-xs text-[#52525b]">API Endpoint</label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full px-3 py-2 bg-[#09090b] border border-[#1c1c1f] rounded text-sm text-[#e4e4e7] font-mono focus:outline-none focus:border-[#3b82f6]"
              />
            </div>
          </div>

          <div className="p-4 bg-[#111113] border border-[#1c1c1f] rounded space-y-4">
            <h2 className="text-sm font-medium text-[#e4e4e7]">Security</h2>
            
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm text-[#e4e4e7]">Secured Mode</p>
                <p className="text-xs text-[#52525b]">Require explicit write handles for Chronicle</p>
              </div>
              <button
                onClick={() => setSecuredMode(!securedMode)}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  securedMode ? "bg-[#3b82f6]" : "bg-[#1c1c1f]"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    securedMode ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          </div>

          <div className="p-4 bg-[#111113] border border-[#1c1c1f] rounded">
            <h2 className="text-sm font-medium text-[#e4e4e7] mb-3">System Info</h2>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#52525b]">Version</span>
                <span className="text-[#a1a1aa]">5.2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52525b]">Kernel</span>
                <span className="text-[#22c55e]">Online</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#52525b]">Chronicle</span>
                <span className="text-[#a1a1aa]">JSON Fallback</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
