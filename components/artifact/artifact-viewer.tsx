"use client"

import { useState } from "react"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Code, FileText, Shield, Copy, Check, ChevronDown } from "lucide-react"

interface Artifact {
  code: string
  intermediateRepresentation: string
  signature: string
  language: string
}

interface ArtifactViewerProps {
  artifact: Artifact
  className?: string
}

export function ArtifactViewer({ artifact, className }: ArtifactViewerProps) {
  const [activeTab, setActiveTab] = useState<"code" | "ir">("code")
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(true)
  
  const handleCopy = async () => {
    const content = activeTab === "code" ? artifact.code : artifact.intermediateRepresentation
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden", className)}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Rosetta Artifact</h3>
            <p className="text-xs text-muted-foreground">Verified & Signed</p>
          </div>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground transition-colors"
        >
          <ChevronDown className={cn("w-4 h-4 transition-transform", !expanded && "rotate-180")} />
        </button>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Signature Badge */}
            <div className="px-4 py-2 bg-emerald-500/5 border-b border-emerald-500/10">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-mono truncate">
                  {artifact.signature}
                </span>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="px-4 py-2 border-b border-border/50 flex items-center gap-2">
              <button
                onClick={() => setActiveTab("code")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeTab === "code" 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <Code className="w-3.5 h-3.5" />
                Code
              </button>
              <button
                onClick={() => setActiveTab("ir")}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  activeTab === "ir"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                IR
              </button>
              
              <button
                onClick={handleCopy}
                className="ml-auto p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 max-h-[400px] overflow-auto">
              <AnimatePresence mode="wait">
                <motion.pre
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-mono text-muted-foreground whitespace-pre-wrap"
                >
                  <code>
                    {activeTab === "code" ? artifact.code : artifact.intermediateRepresentation}
                  </code>
                </motion.pre>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
