"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { DragonAvatar } from "./dragon-avatar"
import { DRAGONS, type MissionState, type DragonName } from "@/lib/types"

const DRAGON_ORDER: DragonName[] = ["ONYX", "IGNIS", "HYDRA", "ETHER", "TERRA", "AEROS"]

interface SenateChamberProps {
  mission: MissionState | null
  className?: string
}

export function SenateChamber({ mission, className }: SenateChamberProps) {
  const getCurrentAgent = (): DragonName | null => {
    if (!mission || mission.status === "APPROVED" || mission.status === "REFUSED") {
      return null
    }
    
    // Find first agent still pending
    const pending = mission.votes.find(v => v.vote === "PENDING")
    return pending?.agent || null
  }
  
  const currentAgent = getCurrentAgent()
  
  return (
    <div className={cn("relative", className)}>
      {/* Background radial effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-64 h-64 rounded-full"
          style={{
            background: `radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)`,
          }}
          animate={{
            scale: mission ? [1, 1.1, 1] : 1,
            opacity: mission ? [0.3, 0.5, 0.3] : 0.2,
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* The Elder's Sigil (Center) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
        <motion.div
          className="w-20 h-20 rounded-full border border-primary/20 flex items-center justify-center"
          animate={{
            rotate: 360,
            borderColor: mission?.status === "APPROVED" 
              ? "rgba(16, 185, 129, 0.3)" 
              : mission?.status === "REFUSED"
                ? "rgba(239, 68, 68, 0.3)"
                : "rgba(var(--primary), 0.2)",
          }}
          transition={{ rotate: { duration: 60, repeat: Infinity, ease: "linear" } }}
        >
          <motion.div
            className="w-12 h-12 rounded-full border border-primary/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center">
              <span className="text-xs font-mono text-primary/60 tracking-widest">ELDER</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Dragon Council - Circular Arrangement */}
      <div className="relative w-full h-[400px] flex items-center justify-center">
        {DRAGON_ORDER.map((name, index) => {
          const angle = (index * 60 - 90) * (Math.PI / 180) // Start from top
          const radius = 150 // Distance from center
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          
          const vote = mission?.votes.find(v => v.agent === name)?.vote || "PENDING"
          const isActive = currentAgent === name
          
          return (
            <motion.div
              key={name}
              className="absolute"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ 
                x, 
                y, 
                opacity: 1,
              }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.1,
                ease: [0.23, 1, 0.32, 1]
              }}
            >
              <DragonAvatar
                name={name}
                vote={vote}
                isActive={isActive}
                delay={index}
              />
            </motion.div>
          )
        })}
      </div>
      
      {/* Connection lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.1)" />
            <stop offset="50%" stopColor="hsl(var(--primary) / 0.3)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.1)" />
          </linearGradient>
        </defs>
        
        {DRAGON_ORDER.map((name, index) => {
          const angle = (index * 60 - 90) * (Math.PI / 180)
          const x = Math.cos(angle) * 150 + 200
          const y = Math.sin(angle) * 150 + 200
          
          return (
            <motion.line
              key={name}
              x1="200"
              y1="200"
              x2={x}
              y2={y}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
            />
          )
        })}
      </svg>
    </div>
  )
}
