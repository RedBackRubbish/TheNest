"use client"

import { useState, useRef, useEffect } from "react"
import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, Flame, GitBranch, Cpu, Database, Compass, 
  Check, X, Loader2, Send, Sparkles, CheckCircle2, 
  XCircle, AlertTriangle, Clock, Activity
} from "lucide-react"
// ============ UTILITIES ============
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// ============ BUTTON COMPONENT ============
function Button({ 
  children, 
  onClick, 
  disabled, 
  className 
}: { 
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        "transition-colors focus-visible:outline-none focus-visible:ring-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  )
}

// ============ TYPES ============
type DragonName = "ONYX" | "IGNIS" | "HYDRA" | "ETHER" | "TERRA" | "AEROS"
type VoteValue = "APPROVE" | "NULL" | "PENDING" | "ABSTAIN"
type VerdictStatus = "PENDING" | "DELIBERATING" | "APPROVED" | "REFUSED" | "UNGOVERNED"
type PhaseType = "INTENT_CHECK" | "FORGE" | "GAUNTLET" | "SELECTION" | "AUDIT" | "COMPLETE"

interface Dragon {
  name: DragonName
  title: string
  mandate: string
  color: string
  icon: string
}

interface AgentVote {
  agent: DragonName
  vote: VoteValue
  reasoning?: string
}

interface MissionState {
  id: string
  mission: string
  status: VerdictStatus
  phase: PhaseType
  votes: AgentVote[]
  artifact?: {
    code: string
    intermediateRepresentation: string
    signature: string
    language: string
  }
}

// ============ DATA ============
const DRAGONS: Record<DragonName, Dragon> = {
  ONYX: { name: "ONYX", title: "The Auditor", mandate: "Security & Policy", color: "hsl(280, 65%, 55%)", icon: "shield" },
  IGNIS: { name: "IGNIS", title: "The Engine", mandate: "Code Generation", color: "hsl(15, 85%, 55%)", icon: "flame" },
  HYDRA: { name: "HYDRA", title: "The Adversary", mandate: "Testing & QA", color: "hsl(200, 85%, 50%)", icon: "git-branch" },
  ETHER: { name: "ETHER", title: "The Bridge", mandate: "Hardware Interface", color: "hsl(185, 75%, 45%)", icon: "cpu" },
  TERRA: { name: "TERRA", title: "The Archive", mandate: "Data Integrity", color: "hsl(145, 65%, 42%)", icon: "database" },
  AEROS: { name: "AEROS", title: "The Navigator", mandate: "External Interface", color: "hsl(220, 70%, 60%)", icon: "compass" },
}

const DRAGON_ORDER: DragonName[] = ["ONYX", "IGNIS", "HYDRA", "ETHER", "TERRA", "AEROS"]
const PHASES: PhaseType[] = ["INTENT_CHECK", "FORGE", "GAUNTLET", "SELECTION", "AUDIT", "COMPLETE"]

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  shield: Shield,
  flame: Flame,
  "git-branch": GitBranch,
  cpu: Cpu,
  database: Database,
  compass: Compass,
}

// ============ DRAGON AVATAR ============
function DragonAvatar({ name, vote, isActive, delay = 0 }: {
  name: DragonName
  vote: VoteValue
  isActive?: boolean
  delay?: number
}) {
  const dragon = DRAGONS[name]
  const Icon = ICONS[dragon.icon]
  
  const voteColors = {
    APPROVE: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/50",
    NULL: "from-red-500/20 to-red-500/5 border-red-500/50",
    PENDING: "from-zinc-500/10 to-transparent border-zinc-700/50",
    ABSTAIN: "from-amber-500/10 to-transparent border-amber-500/30",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className={cn("flex flex-col items-center gap-3", isActive && "z-10")}
    >
      <motion.div
        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative"
      >
        <motion.div
          className={cn(
            "absolute -inset-1 rounded-full blur-md transition-all duration-700",
            vote === "APPROVE" && "bg-emerald-500/30",
            vote === "NULL" && "bg-red-500/40",
            vote === "PENDING" && isActive && "bg-primary/20"
          )}
          animate={isActive ? { opacity: [0.5, 0.8, 0.5] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <div
          className={cn(
            "relative w-16 h-16 rounded-full bg-gradient-to-b p-[2px] transition-all duration-500",
            voteColors[vote]
          )}
          style={{ boxShadow: isActive ? `0 0 40px -10px ${dragon.color}` : undefined }}
        >
          <div className="w-full h-full rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: dragon.color }}
              animate={isActive ? { opacity: [0.05, 0.15, 0.05] } : { opacity: 0.05 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            <Icon 
              className={cn(
                "w-7 h-7 relative z-10 transition-colors duration-300",
                vote === "APPROVE" && "text-emerald-400",
                vote === "NULL" && "text-red-400",
                vote === "PENDING" && "text-muted-foreground"
              )}
              style={{ color: vote === "PENDING" && isActive ? dragon.color : undefined }}
            />
            
            <AnimatePresence>
              {vote !== "PENDING" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "absolute bottom-0 right-0 rounded-full p-1",
                    vote === "APPROVE" && "bg-emerald-500",
                    vote === "NULL" && "bg-red-500"
                  )}
                >
                  {vote === "APPROVE" && <Check className="w-3 h-3 text-white" />}
                  {vote === "NULL" && <X className="w-3 h-3 text-white" />}
                </motion.div>
              )}
            </AnimatePresence>
            
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
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-0.5">
        <p 
          className={cn(
            "font-semibold text-sm tracking-wide transition-colors duration-300",
            vote === "APPROVE" && "text-emerald-400",
            vote === "NULL" && "text-red-400",
            vote === "PENDING" && (isActive ? "text-foreground" : "text-muted-foreground")
          )}
          style={{ color: vote === "PENDING" && isActive ? dragon.color : undefined }}
        >
          {dragon.name}
        </p>
        <p className="text-xs text-muted-foreground/70">{dragon.title}</p>
      </motion.div>
    </motion.div>
  )
}

// ============ SENATE CHAMBER ============
function SenateChamber({ mission }: { mission: MissionState | null }) {
  const getCurrentAgent = (): DragonName | null => {
    if (!mission || mission.status === "APPROVED" || mission.status === "REFUSED") return null
    const pending = mission.votes.find(v => v.vote === "PENDING")
    return pending?.agent || null
  }
  
  const currentAgent = getCurrentAgent()
  
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-64 h-64 rounded-full"
          style={{ background: `radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)` }}
          animate={{ scale: mission ? [1, 1.1, 1] : 1, opacity: mission ? [0.3, 0.5, 0.3] : 0.2 }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>
      
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
        <motion.div
          className="w-20 h-20 rounded-full border border-primary/20 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
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
      
      <div className="relative w-full h-[400px] flex items-center justify-center">
        {DRAGON_ORDER.map((name, index) => {
          const angle = (index * 60 - 90) * (Math.PI / 180)
          const radius = 150
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          const vote = mission?.votes.find(v => v.agent === name)?.vote || "PENDING"
          const isActive = currentAgent === name
          
          return (
            <motion.div
              key={name}
              className="absolute"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ x, y, opacity: 1 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <DragonAvatar name={name} vote={vote} isActive={isActive} delay={index} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ============ MISSION INPUT ============
function MissionInput({ onSubmit, isProcessing }: { onSubmit: (m: string) => void; isProcessing?: boolean }) {
  const [value, setValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
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
  
  return (
    <div className="relative">
      <motion.div
        className="absolute -inset-1 rounded-2xl opacity-0 blur-xl"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.1))" }}
        animate={{ opacity: isFocused ? 1 : 0 }}
      />
      
      <div className={cn(
        "relative rounded-xl border bg-card/50 backdrop-blur-xl transition-all duration-300",
        isFocused ? "border-primary/50 shadow-lg" : "border-border/50",
        isProcessing && "opacity-70 pointer-events-none"
      )}>
        <div className="px-4 pt-3 pb-1 border-b border-border/30 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mission Brief</span>
        </div>
        
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() }}}
          placeholder="Describe what you need built..."
          disabled={isProcessing}
          className="w-full min-h-[80px] max-h-[200px] px-4 py-3 bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none text-sm leading-relaxed"
          rows={1}
        />
        
        <div className="px-4 py-3 border-t border-border/30 flex items-center justify-end">
          <Button onClick={handleSubmit} disabled={!value.trim() || isProcessing} className="gap-2">
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Deliberating...</span></>
            ) : (
              <><Send className="w-4 h-4" /><span>Submit to Senate</span></>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ============ PHASE TIMELINE ============
function PhaseTimeline({ currentPhase }: { currentPhase: PhaseType }) {
  const phaseLabels: Record<PhaseType, string> = {
    INTENT_CHECK: "Intent Check",
    FORGE: "Forge",
    GAUNTLET: "Gauntlet",
    SELECTION: "Selection",
    AUDIT: "Audit",
    COMPLETE: "Complete",
  }
  
  const currentIndex = PHASES.indexOf(currentPhase)
  
  return (
    <div className="space-y-2">
      {PHASES.map((phase, i) => {
        const isComplete = i < currentIndex
        const isCurrent = i === currentIndex
        
        return (
          <motion.div
            key={phase}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300",
              isCurrent && "bg-primary/10 border border-primary/30",
              isComplete && "opacity-60"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full transition-all",
              isComplete && "bg-emerald-500",
              isCurrent && "bg-primary animate-pulse",
              !isComplete && !isCurrent && "bg-muted-foreground/30"
            )} />
            <span className={cn(
              "text-sm font-medium",
              isCurrent && "text-primary",
              isComplete && "text-muted-foreground line-through"
            )}>
              {phaseLabels[phase]}
            </span>
            {isCurrent && <Loader2 className="w-3 h-3 animate-spin text-primary ml-auto" />}
            {isComplete && <Check className="w-3 h-3 text-emerald-500 ml-auto" />}
          </motion.div>
        )
      })}
    </div>
  )
}

// ============ VERDICT DISPLAY ============
function VerdictDisplay({ mission }: { mission: MissionState }) {
  const getStatusConfig = () => {
    switch (mission.status) {
      case "APPROVED":
        return { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "AUTHORIZED" }
      case "REFUSED":
        return { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", label: "NULL VERDICT" }
      case "UNGOVERNED":
        return { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "UNGOVERNED" }
      default:
        return { icon: Clock, color: "text-muted-foreground", bg: "bg-muted/10", border: "border-border", label: "DELIBERATING" }
    }
  }
  
  const config = getStatusConfig()
  const StatusIcon = config.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("rounded-xl border p-6", config.bg, config.border)}
    >
      <div className="flex items-center gap-4 mb-4">
        <StatusIcon className={cn("w-10 h-10", config.color)} />
        <div>
          <h3 className={cn("text-2xl font-bold tracking-wide", config.color)}>{config.label}</h3>
          <p className="text-sm text-muted-foreground">Senate Verdict</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Final vote: {mission.votes.filter(v => v.vote === "APPROVE").length} approve, {mission.votes.filter(v => v.vote === "NULL").length} null</span>
        </div>
        
        {mission.artifact && (
          <div className="mt-4 p-4 rounded-lg bg-card/50 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Generated Artifact</span>
              <span className="text-xs font-mono text-primary">{mission.artifact.language}</span>
            </div>
            <pre className="text-xs text-foreground/80 overflow-x-auto max-h-32">
              <code>{mission.artifact.code.slice(0, 500)}...</code>
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ============ HEADER ============
function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">N</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide">THE NEST</h1>
            <p className="text-xs text-muted-foreground">Sovereign AI Governance</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Senate Online</span>
          </div>
        </div>
      </div>
    </header>
  )
}

// ============ MAIN PAGE ============
export default function HomePage() {
  const [mission, setMission] = useState<MissionState | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  
  const simulateDeliberation = async (missionText: string) => {
    setIsSimulating(true)
    
    const newMission: MissionState = {
      id: Date.now().toString(),
      mission: missionText,
      status: "DELIBERATING",
      phase: "INTENT_CHECK",
      votes: DRAGON_ORDER.map(agent => ({ agent, vote: "PENDING" as VoteValue })),
    }
    setMission(newMission)
    
    for (let i = 0; i < DRAGON_ORDER.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const vote: VoteValue = Math.random() > 0.15 ? "APPROVE" : "NULL"
      
      setMission(prev => {
        if (!prev) return null
        const newVotes = [...prev.votes]
        newVotes[i] = { ...newVotes[i], vote }
        const phaseIndex = Math.min(Math.floor((i + 1) / 2), PHASES.length - 2)
        return { ...prev, votes: newVotes, phase: PHASES[phaseIndex] }
      })
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setMission(prev => {
      if (!prev) return null
      const nullVotes = prev.votes.filter(v => v.vote === "NULL").length
      const status: VerdictStatus = nullVotes >= 2 ? "REFUSED" : "APPROVED"
      
      return {
        ...prev,
        status,
        phase: "COMPLETE",
        artifact: status === "APPROVED" ? {
          code: `// Generated by The Nest Senate\n// Mission: ${missionText}\n\nexport function execute() {\n  console.log("Mission executed");\n}`,
          intermediateRepresentation: "LOAD params\nVALIDATE\nEXECUTE\nRETURN",
          signature: "sha256:" + Math.random().toString(36).substring(2, 18),
          language: "TypeScript",
        } : undefined,
      }
    })
    
    setIsSimulating(false)
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-balance">
              Command the <span className="text-primary">Dragon Senate</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-balance">
              Submit your mission brief to the council of sovereign AI agents for deliberation.
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-[1fr,300px] gap-8">
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                {!mission ? (
                  <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <MissionInput onSubmit={simulateDeliberation} isProcessing={isSimulating} />
                  </motion.div>
                ) : mission.status === "APPROVED" || mission.status === "REFUSED" ? (
                  <motion.div key="verdict" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <VerdictDisplay mission={mission} />
                    <Button onClick={() => setMission(null)} variant="outline" className="w-full">
                      Submit New Mission
                    </Button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Senate Chamber</h3>
                </div>
                <SenateChamber mission={mission} />
              </motion.div>
            </div>
            
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Deliberation Phase</h3>
                </div>
                <PhaseTimeline currentPhase={mission?.phase || "INTENT_CHECK"} />
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
