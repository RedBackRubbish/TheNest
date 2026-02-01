"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

import { Activity, Book, Settings, Zap } from "lucide-react"

interface HeaderProps {
  className?: string
  onChronicleClick?: () => void
}

export function Header({ className, onChronicleClick }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "border-b border-border/50 bg-background/80 backdrop-blur-xl",
        className
      )}
    >
      <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-primary font-bold text-lg">N</span>
            </motion.div>
            {/* Status indicator */}
            <motion.div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-foreground tracking-wide">THE NEST</h1>
            <p className="text-xs text-muted-foreground">Sovereign AI Governance</p>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="flex items-center gap-6">
          {/* System Status */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-muted-foreground">System</span>
              <span className="text-emerald-400 font-medium">OPERATIONAL</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">Mode</span>
              <span className="text-primary font-medium">GOVERNED</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onChronicleClick}
              className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Book className="w-5 h-5" />
              <span className="sr-only">Chronicle</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="sr-only">Settings</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
