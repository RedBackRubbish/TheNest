"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MissionConsoleProps {
  onMissionSubmit?: (mission: string) => void;
  className?: string;
}

type Phase = "idle" | "intent_check" | "forge" | "gauntlet" | "selection" | "verdict";

interface DeliberationEvent {
  phase: Phase;
  agent: string;
  message: string;
  timestamp: Date;
}

export function MissionConsole({ onMissionSubmit, className }: MissionConsoleProps) {
  const [mission, setMission] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>("idle");
  const [events, setEvents] = useState<DeliberationEvent[]>([]);

  const simulateDeliberation = async () => {
    setIsProcessing(true);
    setEvents([]);

    const phases: { phase: Phase; agent: string; message: string; delay: number }[] = [
      { phase: "intent_check", agent: "ONYX", message: "Analyzing mission intent...", delay: 800 },
      { phase: "intent_check", agent: "ONYX", message: "Intent classification: BENIGN", delay: 600 },
      { phase: "forge", agent: "IGNIS", message: "Entering the Crucible...", delay: 500 },
      { phase: "forge", agent: "IGNIS", message: "Generating SPEED variant...", delay: 700 },
      { phase: "forge", agent: "IGNIS", message: "Generating SAFETY variant...", delay: 700 },
      { phase: "forge", agent: "IGNIS", message: "Generating CLARITY variant...", delay: 700 },
      { phase: "forge", agent: "IGNIS", message: "3 candidates forged", delay: 400 },
      { phase: "gauntlet", agent: "HYDRA", message: "Initiating metamorphic testing...", delay: 600 },
      { phase: "gauntlet", agent: "HYDRA", message: "Chaos injection: COMPLETE", delay: 800 },
      { phase: "gauntlet", agent: "HYDRA", message: "Survivors: 2/3", delay: 500 },
      { phase: "selection", agent: "ONYX", message: "Evaluating champions...", delay: 600 },
      { phase: "selection", agent: "ONYX", message: "Selected: CLARITY variant", delay: 400 },
      { phase: "verdict", agent: "SENATE", message: "Final code audit...", delay: 700 },
      { phase: "verdict", agent: "SENATE", message: "VERDICT: APPROVED", delay: 500 },
    ];

    for (const phase of phases) {
      await new Promise((resolve) => setTimeout(resolve, phase.delay));
      setCurrentPhase(phase.phase);
      setEvents((prev) => [
        ...prev,
        {
          phase: phase.phase,
          agent: phase.agent,
          message: phase.message,
          timestamp: new Date(),
        },
      ]);
    }

    setIsProcessing(false);
    setCurrentPhase("idle");
  };

  const handleSubmit = () => {
    if (!mission.trim()) return;
    onMissionSubmit?.(mission);
    simulateDeliberation();
  };

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case "ONYX":
        return "text-onyx";
      case "IGNIS":
        return "text-ignis";
      case "HYDRA":
        return "text-hydra";
      case "SENATE":
        return "text-amber";
      default:
        return "text-foreground";
    }
  };

  const getPhaseLabel = (phase: Phase) => {
    switch (phase) {
      case "intent_check":
        return "INTENT CHECK";
      case "forge":
        return "THE FORGE";
      case "gauntlet":
        return "THE GAUNTLET";
      case "selection":
        return "SELECTION";
      case "verdict":
        return "VERDICT";
      default:
        return "IDLE";
    }
  };

  return (
    <div className={cn("rounded-lg border border-border bg-card/50", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              isProcessing ? "bg-ignis animate-pulse" : "bg-muted"
            )}
          />
          <span className="font-mono text-sm text-foreground">MISSION CONSOLE</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {isProcessing ? getPhaseLabel(currentPhase) : "READY"}
        </span>
      </div>

      {/* Input Area */}
      <div className="p-4">
        <Textarea
          value={mission}
          onChange={(e) => setMission(e.target.value)}
          placeholder="Enter mission directive..."
          className="min-h-[100px] resize-none bg-background/50 font-mono text-sm"
          disabled={isProcessing}
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {mission.length} characters
          </span>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || !mission.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isProcessing ? "Processing..." : "Submit to Senate"}
          </Button>
        </div>
      </div>

      {/* Deliberation Stream */}
      {events.length > 0 && (
        <div className="border-t border-border">
          <div className="px-4 py-2 border-b border-border bg-background/30">
            <span className="font-mono text-xs text-muted-foreground">
              DELIBERATION STREAM
            </span>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-4 space-y-2">
            {events.map((event, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded border border-border bg-background/30 p-2"
              >
                <span
                  className={cn(
                    "font-mono text-xs font-semibold shrink-0 w-16",
                    getAgentColor(event.agent)
                  )}
                >
                  [{event.agent}]
                </span>
                <span className="font-mono text-xs text-foreground/80">
                  {event.message}
                </span>
                <span className="ml-auto font-mono text-xs text-muted-foreground shrink-0">
                  {event.timestamp.toLocaleTimeString("en-US", { hour12: false })}
                </span>
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-center gap-2 px-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse delay-100" />
                <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse delay-200" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
