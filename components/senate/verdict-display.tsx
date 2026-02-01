"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, AlertTriangle, Clock, Gavel } from "lucide-react"

import { cn } from "@/lib/utils"
import type { MissionState } from "@/lib/types"

interface VerdictDisplayProps {
  mission: MissionState | null
  className?: string
}

const PHASE_LABELS = {
  INTENT_CHECK: "Intent Verification",
  FORGE: "Code Generation",
  GAUNTLET: "Adversarial Testing",
  SELECTION: "Final Selection",
  AUDIT: "Security Audit",
  COMPLETE: "Complete",
}

export function VerdictDisplay({ mission, className }: VerdictDisplayProps) {
  if (!mission) return null
  
  const getStatusConfig = () => {
    switch (mission.status) {
      case "APPROVED":
        return {
          icon: CheckCircle2,
          label: "AUTHORIZED",
          sublabel: "Mission Approved by Senate",
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
          glowClass: "shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]",
        }
      case "REFUSED":
      case "STOP_WORK_ORDER":
        return {
          icon: XCircle,
          label: "STOP WORK ORDER",
          sublabel: mission.nullVerdict?.contextSummary || "Mission Refused by Governance",
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          glowClass: "shadow-[0_0_40px_-10px_rgba(239,68,68,0.4)]",
        }
      case "UNGOVERNED":
        return {
          icon: AlertTriangle,
          label: "UNGOVERNED",
          sublabel: "Article 50 Invoked - Liability Assumed",
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          glowClass: "shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]",
        }
      case "DELIBERATING":
        return {
          icon: Gavel,
          label: "DELIBERATING",
          sublabel: PHASE_LABELS[mission.phase],
          color: "text-cyan-400",
          bgColor: "bg-cyan-500/10",
          borderColor: "border-cyan-500/30",
          glowClass: "",
        }
      default:
        return {
          icon: Clock,
          label: "PENDING",
          sublabel: "Awaiting Senate",
          color: "text-muted-foreground",
          bgColor: "bg-muted/50",
          borderColor: "border-border",
          glowClass: "",
        }
    }
  }
  
  const config = getStatusConfig()
  const Icon = config.icon
  
  const isComplete = mission.status === "APPROVED" || mission.status === "REFUSED" || mission.status === "UNGOVERNED"
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={mission.status}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className={cn("relative", className)}
      >
        {/* Main verdict card */}
        <div
          className={cn(
            "relative rounded-xl border p-6 transition-all duration-500",
            config.bgColor,
            config.borderColor,
            isComplete && config.glowClass
          )}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5 overflow-hidden rounded-xl">
            <div className="absolute inset-0 grid-pattern" />
          </div>
          
          <div className="relative flex items-start gap-4">
            {/* Icon with pulse */}
            <div className="relative">
              <motion.div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center",
                  config.bgColor,
                  "border",
                  config.borderColor
                )}
                animate={mission.status === "DELIBERATING" ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Icon className={cn("w-7 h-7", config.color)} />
              </motion.div>
              
              {/* Pulse ring for active states */}
              {mission.status === "DELIBERATING" && (
                <motion.div
                  className={cn("absolute inset-0 rounded-xl border-2", config.borderColor)}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className={cn("text-lg font-bold tracking-wide", config.color)}>
                  {config.label}
                </h3>
                {mission.status === "DELIBERATING" && (
                  <motion.span
                    className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    LIVE
                  </motion.span>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {config.sublabel}
              </p>
              
              {/* Mission text */}
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs text-muted-foreground/70 mb-1 uppercase tracking-wider">Mission</p>
                <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                  {mission.mission}
                </p>
              </div>
              
              {/* Phase progress */}
              {mission.status === "DELIBERATING" && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Phase Progress</span>
                    <span>{PHASE_LABELS[mission.phase]}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-primary rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ 
                        width: mission.phase === "INTENT_CHECK" ? "20%" 
                          : mission.phase === "FORGE" ? "40%"
                          : mission.phase === "GAUNTLET" ? "60%"
                          : mission.phase === "SELECTION" ? "80%"
                          : mission.phase === "AUDIT" ? "90%"
                          : "100%"
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
              
              {/* Null verdict details */}
              {mission.nullVerdict && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-xs text-red-400/70 mb-2 uppercase tracking-wider">Dissenting Agents</p>
                  <div className="flex flex-wrap gap-2">
                    {mission.nullVerdict.nullingAgents.map((agent) => (
                      <span
                        key={agent}
                        className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20"
                      >
                        {agent}
                      </span>
                    ))}
                  </div>
                  {mission.nullVerdict.appealable && (
                    <p className="text-xs text-amber-400/80 mt-3">
                      This verdict may be appealed via Writ of Expansion
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
