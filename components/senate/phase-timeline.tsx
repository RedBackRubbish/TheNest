"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

import { Shield, Flame, GitBranch, Target, Lock, Check } from "lucide-react"
import type { MissionState } from "@/lib/types"

const PHASES = [
  { key: "INTENT_CHECK", label: "Intent", icon: Shield, description: "Security clearance" },
  { key: "FORGE", label: "Forge", icon: Flame, description: "Code generation" },
  { key: "GAUNTLET", label: "Gauntlet", icon: GitBranch, description: "Adversarial testing" },
  { key: "SELECTION", label: "Select", icon: Target, description: "Final selection" },
  { key: "AUDIT", label: "Audit", icon: Lock, description: "Security audit" },
  { key: "COMPLETE", label: "Complete", icon: Check, description: "Verdict issued" },
] as const

interface PhaseTimelineProps {
  mission: MissionState | null
  className?: string
}

export function PhaseTimeline({ mission, className }: PhaseTimelineProps) {
  const getCurrentPhaseIndex = () => {
    if (!mission) return -1
    return PHASES.findIndex(p => p.key === mission.phase)
  }
  
  const currentIndex = getCurrentPhaseIndex()
  const isComplete = mission?.status === "APPROVED" || mission?.status === "REFUSED"
  const isRefused = mission?.status === "REFUSED"
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Deliberation Pipeline
        </span>
      </div>
      
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />
        
        {/* Progress line */}
        <motion.div
          className={cn(
            "absolute left-[15px] top-4 w-px",
            isRefused ? "bg-gradient-to-b from-emerald-500 via-red-500 to-red-500" : "bg-gradient-to-b from-primary to-accent"
          )}
          initial={{ height: 0 }}
          animate={{ 
            height: currentIndex >= 0 
              ? `${Math.min((currentIndex / (PHASES.length - 1)) * 100, 100)}%` 
              : "0%" 
          }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Phase items */}
        <div className="space-y-1">
          {PHASES.map((phase, index) => {
            const Icon = phase.icon
            const isPast = currentIndex > index
            const isCurrent = currentIndex === index && !isComplete
            const isFuture = currentIndex < index
            const isRefusedAt = isRefused && currentIndex === index
            
            return (
              <motion.div
                key={phase.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative flex items-center gap-3 p-2 rounded-lg transition-colors duration-300",
                  isCurrent && "bg-primary/5",
                  isPast && "opacity-60"
                )}
              >
                {/* Node */}
                <div className="relative z-10">
                  <motion.div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300",
                      isPast && !isRefusedAt && "bg-emerald-500/20 border-emerald-500/50",
                      isCurrent && !isRefusedAt && "bg-primary/20 border-primary/50",
                      isFuture && "bg-muted border-border",
                      isRefusedAt && "bg-red-500/20 border-red-500/50"
                    )}
                    animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Icon 
                      className={cn(
                        "w-4 h-4 transition-colors duration-300",
                        isPast && !isRefusedAt && "text-emerald-400",
                        isCurrent && !isRefusedAt && "text-primary",
                        isFuture && "text-muted-foreground",
                        isRefusedAt && "text-red-400"
                      )} 
                    />
                  </motion.div>
                  
                  {/* Pulse ring for current phase */}
                  {isCurrent && !isRefusedAt && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    isPast && !isRefusedAt && "text-emerald-400/80",
                    isCurrent && !isRefusedAt && "text-foreground",
                    isFuture && "text-muted-foreground",
                    isRefusedAt && "text-red-400"
                  )}>
                    {phase.label}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {isRefusedAt ? "Halted" : phase.description}
                  </p>
                </div>
                
                {/* Status indicator */}
                {isPast && !isRefusedAt && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
