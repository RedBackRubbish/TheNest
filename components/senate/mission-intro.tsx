"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MissionIntroProps {
  mission: string
  onComplete: () => void
  className?: string
}

export function MissionIntro({ mission, onComplete, className }: MissionIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => {
        setTimeout(onComplete, 2000)
      }}
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center",
        "bg-background/95 backdrop-blur-xl",
        className
      )}
    >
      {/* Radial glow */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div 
          className="w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 60%)",
          }}
        />
      </motion.div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      {/* Content */}
      <div className="relative text-center px-8">
        {/* Pre-title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6"
        >
          <span className="text-xs font-medium text-primary uppercase tracking-[0.3em]">
            Initiating Deliberation
          </span>
        </motion.div>
        
        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-8 max-w-3xl text-balance"
        >
          {mission}
        </motion.h1>
        
        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="w-64 mx-auto"
        >
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full"
              initial={{ width: "0%", x: "-100%" }}
              animate={{ width: "100%", x: "0%" }}
              transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
            />
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-xs text-muted-foreground mt-3"
          >
            Convening the Senate...
          </motion.p>
        </motion.div>
        
        {/* Dragon sigils appearing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          {["ONYX", "IGNIS", "HYDRA", "ETHER", "TERRA", "AEROS"].map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 + i * 0.1, duration: 0.3 }}
              className="w-2 h-2 rounded-full bg-primary/50"
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
