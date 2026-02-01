"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface MissionInputProps {
  onSubmit: (mission: string) => void
  isProcessing?: boolean
  className?: string
}

export function MissionInput({ onSubmit, isProcessing, className }: MissionInputProps) {
  const [value, setValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [value])
  
  const handleSubmit = () => {
    if (!value.trim() || isProcessing) return
    onSubmit(value.trim())
    setValue("")
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }
  
  const placeholderExamples = [
    "Build a flight controller for a quadcopter drone",
    "Create a real-time analytics dashboard",
    "Design a secure authentication system",
    "Implement a distributed task queue",
  ]
  
  return (
    <div className={cn("relative", className)}>
      {/* Ambient glow */}
      <motion.div
        className="absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.1))",
        }}
        animate={{ opacity: isFocused ? 1 : 0 }}
      />
      
      {/* Main container */}
      <motion.div
        className={cn(
          "relative rounded-xl border bg-card/50 backdrop-blur-xl transition-all duration-300",
          isFocused ? "border-primary/50 shadow-lg shadow-primary/5" : "border-border/50",
          isProcessing && "opacity-70 pointer-events-none"
        )}
      >
        {/* Label */}
        <div className="px-4 pt-3 pb-1 border-b border-border/30 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Mission Brief
          </span>
        </div>
        
        {/* Input area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you need built..."
            disabled={isProcessing}
            className={cn(
              "w-full min-h-[80px] max-h-[200px] px-4 py-3 bg-transparent",
              "text-foreground placeholder:text-muted-foreground/50",
              "resize-none focus:outline-none",
              "font-sans text-sm leading-relaxed"
            )}
            rows={1}
          />
          
          {/* Character count */}
          <AnimatePresence>
            {value.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-2 left-4 text-xs text-muted-foreground/50"
              >
                {value.length} chars
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Actions */}
        <div className="px-4 py-3 border-t border-border/30 flex items-center justify-between">
          {/* Example prompts */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-muted-foreground/50">Try:</span>
            <div className="flex gap-1 overflow-hidden">
              {placeholderExamples.slice(0, 2).map((example, i) => (
                <button
                  key={i}
                  onClick={() => setValue(example)}
                  className="text-xs px-2 py-1 rounded-md bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors truncate max-w-[150px]"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || isProcessing}
            className={cn(
              "gap-2 transition-all duration-300",
              value.trim() && !isProcessing && "glow-gold"
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deliberating...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit to Senate</span>
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
