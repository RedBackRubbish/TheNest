"use client";

import { cn } from "@/lib/utils";

export type AgentStatus = "IDLE" | "ACTIVE" | "COMPLETE" | "VETO" | "OVERRIDE";

export interface SenateFlowProps {
  onyxStatus: AgentStatus;
  ignisStatus: AgentStatus;
  hydraStatus: AgentStatus;
  hydraFindings?: number;
  hydraOverride?: boolean;
  className?: string;
}

/**
 * SenateFlow — Constitutional Deliberation Visualization
 * 
 * Shows the 3-stage governance pipeline:
 * ONYX (Pre-Check) → IGNIS (Forge) → HYDRA (Red Team) → ONYX (Final)
 * 
 * Inspired by mission control systems and constitutional court chambers.
 */
export function SenateFlow({
  onyxStatus,
  ignisStatus,
  hydraStatus,
  hydraFindings = 0,
  hydraOverride = false,
  className,
}: SenateFlowProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {/* ONYX Node */}
      <AgentNode
        name="ONYX"
        role="ARBITER"
        status={onyxStatus}
        color="onyx"
        icon={<OnyxIcon />}
      />

      {/* Connector 1 */}
      <FlowConnector 
        active={onyxStatus === "COMPLETE" || ignisStatus !== "IDLE"} 
        fromColor="onyx"
        toColor="ignis"
      />

      {/* IGNIS Node */}
      <AgentNode
        name="IGNIS"
        role="FORGER"
        status={ignisStatus}
        color="ignis"
        icon={<IgnisIcon />}
      />

      {/* Connector 2 */}
      <FlowConnector 
        active={ignisStatus === "COMPLETE" || hydraStatus !== "IDLE"} 
        fromColor="ignis"
        toColor="hydra"
      />

      {/* HYDRA Node */}
      <AgentNode
        name="HYDRA"
        role="ADVERSARY"
        status={hydraStatus}
        color="hydra"
        icon={<HydraIcon />}
        badge={hydraFindings > 0 ? hydraFindings : undefined}
        override={hydraOverride}
      />
    </div>
  );
}

interface AgentNodeProps {
  name: string;
  role: string;
  status: AgentStatus;
  color: "onyx" | "ignis" | "hydra";
  icon: React.ReactNode;
  badge?: number;
  override?: boolean;
}

function AgentNode({ name, role, status, color, icon, badge, override }: AgentNodeProps) {
  const isActive = status === "ACTIVE";
  const isComplete = status === "COMPLETE";
  const isVeto = status === "VETO";
  const isOverride = status === "OVERRIDE" || override;

  const colorMap = {
    onyx: {
      border: "border-blue-500/50",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      dot: "bg-blue-500",
    },
    ignis: {
      border: "border-amber-500/50",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      dot: "bg-amber-500",
    },
    hydra: {
      border: "border-red-500/50",
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
      bg: "bg-red-500/10",
      text: "text-red-400",
      dot: "bg-red-500",
    },
  };

  const colors = colorMap[color];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-300",
        "bg-[#0a0a0d] min-w-[80px]",
        isActive && [colors.border, colors.glow, colors.bg],
        isComplete && "border-emerald-500/30 bg-emerald-500/5",
        isVeto && "border-red-500/50 bg-red-500/10",
        isOverride && "border-red-600/60 bg-red-600/15 animate-pulse",
        !isActive && !isComplete && !isVeto && !isOverride && "border-white/10"
      )}
    >
      {/* Badge for Hydra findings */}
      {badge !== undefined && badge > 0 && (
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">{badge}</span>
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all",
          isActive && colors.bg,
          isComplete && "bg-emerald-500/20",
          isVeto && "bg-red-500/20",
          isOverride && "bg-red-600/30",
          !isActive && !isComplete && !isVeto && !isOverride && "bg-white/5"
        )}
      >
        <div
          className={cn(
            "w-5 h-5",
            isActive && colors.text,
            isComplete && "text-emerald-400",
            isVeto && "text-red-400",
            isOverride && "text-red-500",
            !isActive && !isComplete && !isVeto && !isOverride && "text-zinc-600"
          )}
        >
          {icon}
        </div>
      </div>

      {/* Name */}
      <span
        className={cn(
          "font-mono text-[10px] font-semibold tracking-widest",
          isActive && colors.text,
          isComplete && "text-emerald-400",
          isVeto && "text-red-400",
          isOverride && "text-red-500",
          !isActive && !isComplete && !isVeto && !isOverride && "text-zinc-500"
        )}
      >
        {name}
      </span>

      {/* Role */}
      <span className="font-mono text-[8px] text-zinc-600 tracking-wider">{role}</span>

      {/* Status indicator */}
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-all",
            isActive && [colors.dot, "animate-pulse"],
            isComplete && "bg-emerald-500",
            isVeto && "bg-red-500",
            isOverride && "bg-red-600 animate-pulse",
            !isActive && !isComplete && !isVeto && !isOverride && "bg-zinc-700"
          )}
        />
        <span
          className={cn(
            "font-mono text-[8px] tracking-wider",
            isActive && colors.text,
            isComplete && "text-emerald-400/70",
            isVeto && "text-red-400/70",
            isOverride && "text-red-500/70",
            !isActive && !isComplete && !isVeto && !isOverride && "text-zinc-600"
          )}
        >
          {isOverride ? "OVERRIDE" : status}
        </span>
      </div>
    </div>
  );
}

interface FlowConnectorProps {
  active: boolean;
  fromColor: "onyx" | "ignis" | "hydra";
  toColor: "onyx" | "ignis" | "hydra";
}

function FlowConnector({ active, fromColor, toColor }: FlowConnectorProps) {
  const gradients = {
    "onyx-ignis": "from-blue-500 to-amber-500",
    "ignis-hydra": "from-amber-500 to-red-500",
    "hydra-onyx": "from-red-500 to-blue-500",
  };

  const gradient = gradients[`${fromColor}-${toColor}` as keyof typeof gradients] || "from-zinc-600 to-zinc-600";

  return (
    <div className="flex items-center gap-1">
      <div
        className={cn(
          "w-8 h-0.5 transition-all duration-500",
          active ? `bg-gradient-to-r ${gradient}` : "bg-zinc-800"
        )}
      />
      <div
        className={cn(
          "w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-transparent transition-all",
          active ? "border-l-zinc-400" : "border-l-zinc-800"
        )}
      />
    </div>
  );
}

// Icons - Custom SVG for each agent
function OnyxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IgnisIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2c0 4-4 6-4 10a4 4 0 108 0c0-4-4-6-4-10z" />
      <path d="M12 22v-4" />
    </svg>
  );
}

function HydraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 12V3" />
      <path d="M5 8l7 4 7-4" />
      <path d="M12 12l-7 4v5" />
      <path d="M12 12l7 4v5" />
      <circle cx="12" cy="3" r="2" />
      <circle cx="5" cy="21" r="2" />
      <circle cx="19" cy="21" r="2" />
    </svg>
  );
}

// Compact inline version for the header
export function SenateFlowCompact({
  onyxStatus,
  ignisStatus,
  hydraStatus,
}: {
  onyxStatus: AgentStatus;
  ignisStatus: AgentStatus;
  hydraStatus: AgentStatus;
}) {
  return (
    <div className="flex items-center gap-3">
      <AgentDot name="ONYX" status={onyxStatus} color="blue" />
      <span className="text-zinc-700">→</span>
      <AgentDot name="IGNIS" status={ignisStatus} color="amber" />
      <span className="text-zinc-700">→</span>
      <AgentDot name="HYDRA" status={hydraStatus} color="red" />
    </div>
  );
}

function AgentDot({
  name,
  status,
  color,
}: {
  name: string;
  status: AgentStatus;
  color: "blue" | "amber" | "red";
}) {
  const isActive = status === "ACTIVE";
  const isComplete = status === "COMPLETE";

  const colorClasses = {
    blue: isActive ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : isComplete ? "bg-emerald-500" : "bg-zinc-700",
    amber: isActive ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : isComplete ? "bg-emerald-500" : "bg-zinc-700",
    red: isActive ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : isComplete ? "bg-emerald-500" : "bg-zinc-700",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          "w-2 h-2 rounded-full transition-all",
          colorClasses[color],
          isActive && "animate-pulse"
        )}
      />
      <span
        className={cn(
          "font-mono text-[10px] tracking-wider",
          isActive ? "text-zinc-300" : "text-zinc-600"
        )}
      >
        {name}
      </span>
    </div>
  );
}

export default SenateFlow;
