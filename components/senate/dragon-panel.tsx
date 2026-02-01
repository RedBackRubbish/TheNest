"use client"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { X, Shield, Flame, GitBranch, Cpu, Database, Compass, ChevronRight } from "lucide-react"
import { DRAGONS, type DragonName, type VoteValue } from "@/lib/types"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield,
  flame: Flame,
  "git-branch": GitBranch,
  cpu: Cpu,
  database: Database,
  compass: Compass,
}

interface DragonPanelProps {
  selectedDragon: DragonName | null
  vote?: VoteValue
  onClose: () => void
  className?: string
}

export function DragonPanel({ selectedDragon, vote, onClose, className }: DragonPanelProps) {
  if (!selectedDragon) return null
  
  const dragon = DRAGONS[selectedDragon]
  const Icon = ICONS[dragon.icon]
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          "rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden",
          className
        )}
      >
        {/* Header with dramatic gradient */}
        <div 
          className="relative p-6 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${dragon.color}15 0%, transparent 60%)`,
          }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 grid-pattern opacity-10" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-background/50 text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* Dragon identity */}
          <div className="relative flex items-start gap-4">
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ 
                backgroundColor: `${dragon.color}20`,
                border: `1px solid ${dragon.color}40`,
                boxShadow: `0 0 30px -5px ${dragon.color}40`,
              }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Icon className="w-8 h-8" style={{ color: dragon.color }} />
            </motion.div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold" style={{ color: dragon.color }}>
                  {dragon.name}
                </h2>
                {vote && vote !== "PENDING" && (
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    vote === "APPROVE" && "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
                    vote === "NULL" && "bg-red-500/20 text-red-400 border border-red-500/30",
                    vote === "ABSTAIN" && "bg-amber-500/20 text-amber-400 border border-amber-500/30",
                  )}>
                    {vote}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{dragon.title}</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Mandate */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Mandate
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              {dragon.mandate}
            </p>
          </div>
          
          {/* Domain */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Domain
            </h3>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: dragon.color }}
              />
              <span className="text-sm text-foreground">{dragon.domain}</span>
            </div>
          </div>
          
          {/* Key Constraints */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Key Constraints
            </h3>
            <div className="space-y-2">
              {getDragonConstraints(selectedDragon).map((constraint, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-xs text-muted-foreground">{constraint}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Vote Power */}
          <div className="p-3 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Vote Power</span>
              <span className="text-xs font-medium" style={{ color: dragon.color }}>
                {getVotePower(selectedDragon)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: dragon.color }}
                initial={{ width: 0 }}
                animate={{ width: getVotePowerPercent(selectedDragon) }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function getDragonConstraints(name: DragonName): string[] {
  const constraints: Record<DragonName, string[]> = {
    ONYX: [
      "The Kill-Chain: Verify software logic doesn't override hardware safety",
      "Null Verdict: May issue Stop Work Order for ethics violations",
      "Security audit required for all external interfaces",
    ],
    IGNIS: [
      "Rosetta Constraint: All code must have human-readable IR",
      "No Black Boxes: Unreadable code is treated as malicious",
      "Performance optimization within safety bounds",
    ],
    HYDRA: [
      "Sabotage Protocol: Inject Anti-Oracle noise for variance",
      "Metamorphic testing across distribution shifts",
      "Force divergent failures to maintain creative variance",
    ],
    ETHER: [
      "Hard-Kill Domains: Cannot bypass hardware safety relays",
      "Blast Radius: Calculate worst case kinetic scenario",
      "Physical jurisdiction limited by hardware constraints",
    ],
    TERRA: [
      "Temporal Validity: All data has defined lifecycle",
      "Liability Scoping: Jurisdictional metadata required",
      "ACID-compliant persistence only",
    ],
    AEROS: [
      "Supply Chain Verification: Validate all imports",
      "Bill of Materials: Track maintainer reputation",
      "Community standards for tie-breaking votes",
    ],
  }
  return constraints[name]
}

function getVotePower(name: DragonName): string {
  if (name === "ONYX" || name === "ETHER") return "ABSOLUTE (Safety Veto)"
  return "SOFT (Debatable)"
}

function getVotePowerPercent(name: DragonName): string {
  if (name === "ONYX" || name === "ETHER") return "100%"
  return "60%"
}
