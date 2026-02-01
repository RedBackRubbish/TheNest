"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, Zap, Shield, AlertTriangle, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { TypewriterText } from "@/components/ui/text-effects";
import { GlowingBorder } from "@/components/ui/moving-border";

interface MissionInputProps {
  onSubmit: (mission: string) => void;
  isProcessing?: boolean;
}

const placeholderExamples = [
  "Build a secure REST API with rate limiting...",
  "Create an authentication service with JWT...",
  "Implement a real-time WebSocket handler...",
  "Design a database schema for e-commerce...",
  "Write unit tests for the payment module...",
];

export function MissionInput({ onSubmit, isProcessing = false }: MissionInputProps) {
  const [mission, setMission] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (mission.trim() && !isProcessing) {
      onSubmit(mission.trim());
      setMission("");
    }
  }, [mission, isProcessing, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-amber to-foreground bg-clip-text text-transparent">
          The Nest
        </h1>
        <p className="text-lg text-muted-foreground">
          Submit your mission to the{" "}
          <span className="text-amber font-medium">Senate</span>
        </p>
      </motion.div>

      {/* Main Input Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <GlowingBorder
          containerClassName={cn(
            "transition-all duration-500",
            isFocused && "shadow-[0_0_50px_-12px] shadow-amber/30"
          )}
          className="p-1"
          gradientColors={
            isFocused
              ? ["var(--color-onyx)", "var(--color-amber)", "var(--color-ignis)"]
              : ["var(--color-border)", "var(--color-border)", "var(--color-border)"]
          }
        >
          <div className="relative bg-card/80 backdrop-blur-xl rounded-xl overflow-hidden">
            {/* Animated Background Gradient */}
            <motion.div
              className="absolute inset-0 opacity-50"
              style={{
                background:
                  "radial-gradient(circle at 50% 0%, var(--color-amber) 0%, transparent 50%)",
              }}
              animate={{
                opacity: isFocused ? 0.2 : 0.05,
              }}
              transition={{ duration: 0.5 }}
            />

            {/* Input Area */}
            <div className="relative p-4">
              <div className="flex items-start gap-3">
                <motion.div
                  className="mt-1 p-2 rounded-lg bg-amber/10"
                  animate={{
                    boxShadow: isFocused
                      ? "0 0 20px var(--color-amber)"
                      : "none",
                  }}
                >
                  <Command className="w-5 h-5 text-amber" />
                </motion.div>

                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                    placeholder=""
                    rows={3}
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-base leading-relaxed"
                    disabled={isProcessing}
                  />

                  {/* Animated Placeholder */}
                  {!mission && !isFocused && (
                    <div className="absolute inset-0 pointer-events-none text-muted-foreground">
                      <TypewriterText
                        words={placeholderExamples}
                        className="text-base"
                        cursorClassName="text-amber"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer with actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-onyx" />
                    <span>Governed by ONYX</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-ignis" />
                    <span>Forged by IGNIS</span>
                  </span>
                </div>

                <motion.button
                  onClick={handleSubmit}
                  disabled={!mission.trim() || isProcessing}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all",
                    mission.trim() && !isProcessing
                      ? "bg-amber text-background hover:bg-amber/90 shadow-lg shadow-amber/25"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  )}
                  whileHover={mission.trim() ? { scale: 1.02 } : {}}
                  whileTap={mission.trim() ? { scale: 0.98 } : {}}
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Mission</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </GlowingBorder>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex flex-wrap justify-center gap-2"
      >
        {["API Endpoint", "Auth Service", "Database Schema", "Test Suite"].map((action, i) => (
          <motion.button
            key={action}
            onClick={() => setMission(`Create a ${action.toLowerCase()} for...`)}
            className="px-4 py-2 rounded-full text-xs font-medium bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all border border-border/50 hover:border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {action}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
