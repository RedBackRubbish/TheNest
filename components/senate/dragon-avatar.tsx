"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Shield, Flame, GitBranch, Cpu, Database, Compass, Check, X, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import type { DragonName, VoteValue } from "@/lib/types"
import { DRAGONS } from "@/lib/types"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield,
  flame: Flame,
  "git-branch": GitBranch,
  cpu: Cpu,
  database: Database,
  compass: Compass,
}

interface DragonAvatarProps {
  name: DragonName
  vote: VoteValue
  isActive?: boolean
  showDetails?: boolean
  size?: "sm" | "md" | "lg"
  delay?: number
}

export function DragonAvatar({
  name,
  vote,
  isActive = false,
  showDetails = true,
  size = "md",
  delay = 0,
}: DragonAvatarProps) {
  const dragon = DRAGONS[name]
  const Icon = ICONS[dragon.icon]
  
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  }
  
  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10",
  }
  
  const voteColors = {
    APPROVE: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/50",
    NULL: "from-red-500/20 to-red-500/5 border-red-500/50",
    PENDING: "from-zinc-500/10 to-transparent border-zinc-700/50",
    ABSTAIN: "from-amber-500/10 to-transparent border-amber-500/30",
  }
  
  const voteGlows = {
    APPROVE: "shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)]",
    NULL: "shadow-[0_0_30px_-5px_rgba(239,68,68,0.5)]",
    PENDING: "",
    ABSTAIN: "shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "flex flex-col items-center gap-3",
        isActive && "z-10"
      )}
    >
      {/* Avatar Ring */}
      <motion.div
        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        {/* Outer glow ring */}
        <motion.div
          className={cn(
            "absolute -inset-1 rounded-full blur-md transition-all duration-700",
            vote === "APPROVE" && "bg-emerald-500/30",
            vote === "NULL" && "bg-red-500/40",
            vote === "PENDING" && isActive && "bg-primary/20",
            vote === "ABSTAIN" && "bg-amber-500/20"
          )}
          animate={isActive ? { opacity: [0.5, 0.8, 0.5] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Main avatar container */}
        <div
          className={cn(
            "relative rounded-full bg-gradient-to-b p-[2px] transition-all duration-500",
            voteColors[vote],
            voteGlows[vote],
            sizeClasses[size]
          )}
          style={{
            boxShadow: isActive ? `0 0 40px -10px ${dragon.color}` : undefined,
          }}
        >
          <div className={cn(
            "w-full h-full rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center relative overflow-hidden"
          )}>
            {/* Background pulse */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: dragon.color }}
              animate={isActive ? { opacity: [0.05, 0.15, 0.05] } : { opacity: 0.05 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Icon */}
            <Icon 
              className={cn(
                iconSizes[size],
                "relative z-10 transition-colors duration-300",
                vote === "APPROVE" && "text-emerald-400",
                vote === "NULL" && "text-red-400",
                vote === "PENDING" && "text-muted-foreground",
                vote === "ABSTAIN" && "text-amber-400"
              )}
              style={{ color: vote === "PENDING" && isActive ? dragon.color : undefined }}
            />
            
            {/* Vote indicator overlay */}
            <AnimatePresence>
              {vote !== "PENDING" && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={cn(
                    "absolute bottom-0 right-0 rounded-full p-1",
                    vote === "APPROVE" && "bg-emerald-500",
                    vote === "NULL" && "bg-red-500",
                    vote === "ABSTAIN" && "bg-amber-500"
                  )}
                >
                  {vote === "APPROVE" && <Check className="w-3 h-3 text-white" />}
                  {vote === "NULL" && <X className="w-3 h-3 text-white" />}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Loading spinner for active pending */}
            {vote === "PENDING" && isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-card/50 rounded-full"
              >
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: dragon.color }} />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Details */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay * 0.1 + 0.2 }}
          className="text-center space-y-0.5"
        >
          <p 
            className={cn(
              "font-semibold text-sm tracking-wide transition-colors duration-300",
              vote === "APPROVE" && "text-emerald-400",
              vote === "NULL" && "text-red-400",
              vote === "PENDING" && (isActive ? "text-foreground" : "text-muted-foreground"),
              vote === "ABSTAIN" && "text-amber-400"
            )}
            style={{ color: vote === "PENDING" && isActive ? dragon.color : undefined }}
          >
            {dragon.name}
          </p>
          <p className="text-xs text-muted-foreground/70">{dragon.title}</p>
        </motion.div>
      )}
    </motion.div>
  )
}
