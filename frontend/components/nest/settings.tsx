"use client";

import { useState } from "react";

export function Settings() {
  const [apiEndpoint, setApiEndpoint] = useState("http://localhost:8000");
  const [securedMode, setSecuredMode] = useState(false);

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <span className="chassis-label text-zinc-600">SYSTEM CONFIGURATION</span>
          <p className="text-xs text-zinc-700 font-mono mt-1">Runtime Parameters &amp; Security Controls</p>
        </div>

        <div className="space-y-4">
          {/* Connection Panel */}
          <div className="p-4 bg-white/[0.02] border border-white/10 rounded space-y-4">
            <div className="flex items-center gap-2">
              <span className="chassis-label text-zinc-500">CONNECTION</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            
            <div className="space-y-2">
              <label className="chassis-label text-zinc-600">API ENDPOINT</label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded font-mono text-xs text-zinc-300 focus:outline-none focus:border-white/20"
              />
            </div>
          </div>

          {/* Security Panel */}
          <div className="p-4 bg-white/[0.02] border border-white/10 rounded space-y-4">
            <div className="flex items-center gap-2">
              <span className="chassis-label text-zinc-500">SECURITY</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="font-mono text-xs text-zinc-300 uppercase tracking-wide">Secured Mode</p>
                <p className="text-[10px] text-zinc-600 font-mono mt-0.5">Require explicit write handles for Chronicle</p>
              </div>
              <button
                onClick={() => setSecuredMode(!securedMode)}
                className={`relative w-10 h-5 rounded transition-colors ${
                  securedMode ? "bg-blue-600/50 border border-blue-500/50" : "bg-white/5 border border-white/10"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded bg-zinc-200 transition-transform ${
                    securedMode ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </label>
          </div>

          {/* System Info Panel */}
          <div className="p-4 bg-white/[0.02] border border-white/10 rounded">
            <div className="flex items-center gap-2 mb-4">
              <span className="chassis-label text-zinc-500">DIAGNOSTICS</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="chassis-label text-zinc-700">BUILD</span>
                <p className="font-mono text-xs text-zinc-400 tabular-nums">5.2.0</p>
              </div>
              <div className="space-y-1">
                <span className="chassis-label text-zinc-700">KERNEL</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_#22c55e]" />
                  <p className="font-mono text-xs text-emerald-500/80">ONLINE</p>
                </div>
              </div>
              <div className="space-y-1">
                <span className="chassis-label text-zinc-700">STORAGE</span>
                <p className="font-mono text-xs text-zinc-500">JSON</p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="p-4 bg-red-950/10 border border-red-900/20 rounded">
            <div className="flex items-center gap-2 mb-3">
              <span className="chassis-label text-red-500/60">DANGER ZONE</span>
              <div className="flex-1 h-px bg-red-900/20" />
            </div>
            <p className="text-[10px] text-zinc-600 font-mono mb-3">
              Irreversible operations. Proceed with caution.
            </p>
            <button className="px-3 py-1.5 bg-red-950/30 border border-red-900/30 rounded font-mono text-[10px] text-red-400/60 uppercase tracking-wider hover:bg-red-950/50 hover:border-red-900/50 transition-colors">
              Purge Chronicle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
