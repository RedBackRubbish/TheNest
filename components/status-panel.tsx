"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SystemStatus {
  kernel: "ONLINE" | "OFFLINE" | "DEGRADED";
  agents: {
    name: string;
    status: "ACTIVE" | "STANDBY" | "ERROR";
    color: string;
  }[];
  uptime: string;
  lastVerdict: string;
}

export function StatusPanel({ className }: { className?: string }) {
  const [status, setStatus] = useState<SystemStatus>({
    kernel: "ONLINE",
    agents: [
      { name: "ONYX", status: "ACTIVE", color: "onyx" },
      { name: "IGNIS", status: "ACTIVE", color: "ignis" },
      { name: "HYDRA", status: "STANDBY", color: "hydra" },
    ],
    uptime: "00:00:00",
    lastVerdict: "APPROVED",
  });

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate uptime counter
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setStatus((prev) => ({
        ...prev,
        uptime: `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card/50 p-4",
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              status.kernel === "ONLINE"
                ? "bg-hydra animate-pulse"
                : status.kernel === "DEGRADED"
                ? "bg-ignis animate-pulse"
                : "bg-destructive"
            )}
          />
          <span className="font-mono text-sm text-foreground">
            SYSTEM STATUS
          </span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {time.toLocaleTimeString("en-US", { hour12: false })}
        </span>
      </div>

      {/* Kernel Status */}
      <div className="mb-4 rounded border border-border bg-background/50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">KERNEL</span>
          <span
            className={cn(
              "font-mono text-sm font-semibold",
              status.kernel === "ONLINE"
                ? "text-hydra"
                : status.kernel === "DEGRADED"
                ? "text-ignis"
                : "text-destructive"
            )}
          >
            {status.kernel}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">UPTIME</span>
          <span className="font-mono text-sm text-foreground">
            {status.uptime}
          </span>
        </div>
      </div>

      {/* Agent Status */}
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">DRAGON SWARM</span>
        {status.agents.map((agent) => (
          <div
            key={agent.name}
            className="flex items-center justify-between rounded border border-border bg-background/30 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  agent.color === "onyx" && "bg-onyx",
                  agent.color === "ignis" && "bg-ignis",
                  agent.color === "hydra" && "bg-hydra"
                )}
              />
              <span className="font-mono text-sm text-foreground">
                {agent.name}
              </span>
            </div>
            <span
              className={cn(
                "font-mono text-xs",
                agent.status === "ACTIVE"
                  ? "text-hydra"
                  : agent.status === "STANDBY"
                  ? "text-muted-foreground"
                  : "text-destructive"
              )}
            >
              {agent.status}
            </span>
          </div>
        ))}
      </div>

      {/* Last Verdict */}
      <div className="mt-4 rounded border border-border bg-background/50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">LAST VERDICT</span>
          <span
            className={cn(
              "font-mono text-sm font-semibold",
              status.lastVerdict === "APPROVED"
                ? "text-hydra"
                : status.lastVerdict === "STOP_WORK_ORDER"
                ? "text-destructive"
                : "text-ignis"
            )}
          >
            {status.lastVerdict}
          </span>
        </div>
      </div>
    </div>
  );
}
