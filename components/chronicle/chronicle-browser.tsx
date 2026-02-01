"use client"

import { useState, useMemo } from "react"

import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Search, Book, Scale, ChevronRight, X, AlertTriangle, Check, Ban } from "lucide-react"
import type { Precedent } from "@/lib/types"

// Mock precedents for demo
const MOCK_PRECEDENTS: Precedent[] = [
  {
    case_id: "CASE-2025-02-BETA",
    question: "Should ML models be allowed to make real-time trading decisions without human confirmation?",
    deliberation: [
      { agent: "IGNIS", argument: "Technically feasible with low-latency inference pipelines.", vote: "APPROVE" },
      { agent: "ONYX", argument: "Risk of flash crash amplification. Requires circuit breakers.", vote: "NULL" },
      { agent: "TERRA", argument: "Audit trail requirements mandate 24hr data retention.", vote: "APPROVE" },
      { agent: "HYDRA", argument: "Adversarial market conditions could exploit model weaknesses.", vote: "NULL" },
    ],
    verdict: {
      ruling: "NULL_VERDICT",
      principle_cited: "Human oversight required for high-frequency financial operations",
      dissenting_opinion: "IGNIS: Technical capability should not be constrained by hypothetical risks",
    },
    created_at: "2025-02-15T14:30:00Z",
  },
  {
    case_id: "CASE-2025-01-ALPHA",
    question: "Can autonomous drones operate in populated areas for delivery services?",
    deliberation: [
      { agent: "ETHER", argument: "Hardware constraints verified. Max altitude 120m, geofencing active.", vote: "APPROVE" },
      { agent: "ONYX", argument: "Liability framework established with insurance requirements.", vote: "APPROVE" },
      { agent: "AEROS", argument: "FAA Part 107 compliance verified. Visual line of sight waiver approved.", vote: "APPROVE" },
    ],
    verdict: {
      ruling: "AUTHORIZED",
      principle_cited: "Autonomous operation permitted with verified safety constraints and regulatory compliance",
    },
    created_at: "2025-01-28T09:15:00Z",
  },
  {
    case_id: "CASE-2024-12-GAMMA",
    question: "Employee sentiment analysis tool for HR wellness programs",
    deliberation: [
      { agent: "IGNIS", argument: "NLP sentiment scoring technically trivial.", vote: "APPROVE" },
      { agent: "ONYX", argument: "Function creep risk 95%. Violates 'Do No Harm' principle.", vote: "NULL" },
      { agent: "TERRA", argument: "Mental health data requires HIPAA-grade infrastructure.", vote: "NULL" },
      { agent: "HYDRA", argument: "Re-identification attack successful with k-anonymity bypass.", vote: "NULL" },
    ],
    verdict: {
      ruling: "NULL_VERDICT",
      principle_cited: "Privacy > Efficiency. Employee surveillance tools rejected on ethical grounds.",
      dissenting_opinion: "Mission later executed under Article 50 (UNGOVERNED) by keeper assumption of liability",
    },
    created_at: "2024-12-05T16:45:00Z",
  },
]

interface ChronicleBrowserProps {
  className?: string
  onClose?: () => void
}

export function ChronicleBrowser({ className, onClose }: ChronicleBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCase, setSelectedCase] = useState<Precedent | null>(null)
  
  const filteredPrecedents = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_PRECEDENTS
    const query = searchQuery.toLowerCase()
    return MOCK_PRECEDENTS.filter(p => 
      p.question.toLowerCase().includes(query) ||
      p.case_id.toLowerCase().includes(query) ||
      p.verdict.principle_cited.toLowerCase().includes(query)
    )
  }, [searchQuery])
  
  const getRulingIcon = (ruling: string) => {
    switch (ruling) {
      case "AUTHORIZED": return Check
      case "NULL_VERDICT": return Ban
      case "UNGOVERNED": return AlertTriangle
      default: return Scale
    }
  }
  
  const getRulingColor = (ruling: string) => {
    switch (ruling) {
      case "AUTHORIZED": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      case "NULL_VERDICT": return "text-red-400 bg-red-500/10 border-red-500/30"
      case "UNGOVERNED": return "text-amber-400 bg-amber-500/10 border-amber-500/30"
      default: return "text-muted-foreground bg-muted border-border"
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Book className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">The Chronicle</h2>
            <p className="text-xs text-muted-foreground">Case Law & Precedent</p>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Search */}
      <div className="p-4 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search case law..."
            className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex h-[500px]">
        {/* Case List */}
        <div className={cn(
          "border-r border-border/50 overflow-y-auto",
          selectedCase ? "w-1/2" : "w-full"
        )}>
          <div className="p-2 space-y-1">
            {filteredPrecedents.map((precedent) => {
              const RulingIcon = getRulingIcon(precedent.verdict.ruling)
              const isSelected = selectedCase?.case_id === precedent.case_id
              
              return (
                <motion.button
                  key={precedent.case_id}
                  onClick={() => setSelectedCase(precedent)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-colors",
                    isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary/50 border border-transparent"
                  )}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                      getRulingColor(precedent.verdict.ruling)
                    )}>
                      <RulingIcon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {precedent.case_id}
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2 mb-2">
                        {precedent.question}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {new Date(precedent.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                </motion.button>
              )
            })}
            
            {filteredPrecedents.length === 0 && (
              <div className="p-8 text-center">
                <Scale className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No cases found</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Case Detail */}
        <AnimatePresence>
          {selectedCase && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-1/2 overflow-y-auto p-4 space-y-4"
            >
              {/* Case Header */}
              <div>
                <span className="text-xs font-mono text-primary">{selectedCase.case_id}</span>
                <h3 className="text-sm font-semibold text-foreground mt-1">
                  {selectedCase.question}
                </h3>
              </div>
              
              {/* Verdict */}
              <div className={cn(
                "p-3 rounded-lg border",
                getRulingColor(selectedCase.verdict.ruling)
              )}>
                <div className="flex items-center gap-2 mb-2">
                  {(() => {
                    const Icon = getRulingIcon(selectedCase.verdict.ruling)
                    return <Icon className="w-4 h-4" />
                  })()}
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {selectedCase.verdict.ruling.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs opacity-80">
                  {selectedCase.verdict.principle_cited}
                </p>
              </div>
              
              {/* Deliberation */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Deliberation
                </h4>
                <div className="space-y-2">
                  {selectedCase.deliberation.map((item, i) => (
                    <div key={i} className="p-2 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground">{item.agent}</span>
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          item.vote === "APPROVE" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                        )}>
                          {item.vote}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.argument}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Dissent */}
              {selectedCase.verdict.dissenting_opinion && (
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                    Dissenting Opinion
                  </h4>
                  <p className="text-xs text-amber-400/80">
                    {selectedCase.verdict.dissenting_opinion}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
