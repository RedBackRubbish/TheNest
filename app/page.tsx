"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, Flame, GitBranch, Cpu, Database, Compass, 
  Check, X, Loader2, Send, Sparkles, CheckCircle2, 
  XCircle, AlertTriangle, Clock
} from "lucide-react"

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

type DragonName = "ONYX" | "IGNIS" | "HYDRA" | "ETHER" | "TERRA" | "AEROS"
type VoteValue = "APPROVE" | "NULL" | "PENDING" | "ABSTAIN"
type VerdictStatus = "PENDING" | "DELIBERATING" | "APPROVED" | "REFUSED" | "UNGOVERNED"
type PhaseType = "INTENT_CHECK" | "FORGE" | "GAUNTLET" | "SELECTION" | "AUDIT" | "COMPLETE"

interface Dragon {
  name: DragonName
  title: string
  mandate: string
  color: string
  iconType: "shield" | "flame" | "git-branch" | "cpu" | "database" | "compass"
}

interface AgentVote {
  agent: DragonName
  vote: VoteValue
}

interface MissionState {
  id: string
  mission: string
  status: VerdictStatus
  phase: PhaseType
  votes: AgentVote[]
  artifact?: {
    code: string
    language: string
  }
}

const DRAGONS: Record<DragonName, Dragon> = {
  ONYX: { name: "ONYX", title: "The Auditor", mandate: "Security", color: "#a855f7", iconType: "shield" },
  IGNIS: { name: "IGNIS", title: "The Engine", mandate: "Generation", color: "#f97316", iconType: "flame" },
  HYDRA: { name: "HYDRA", title: "The Adversary", mandate: "Testing", color: "#3b82f6", iconType: "git-branch" },
  ETHER: { name: "ETHER", title: "The Bridge", mandate: "Hardware", color: "#06b6d4", iconType: "cpu" },
  TERRA: { name: "TERRA", title: "The Archive", mandate: "Data", color: "#22c55e", iconType: "database" },
  AEROS: { name: "AEROS", title: "The Navigator", mandate: "Interface", color: "#6366f1", iconType: "compass" },
}

const DRAGON_ORDER: DragonName[] = ["ONYX", "IGNIS", "HYDRA", "ETHER", "TERRA", "AEROS"]
const PHASES: PhaseType[] = ["INTENT_CHECK", "FORGE", "GAUNTLET", "SELECTION", "AUDIT", "COMPLETE"]

function DragonIcon({ type, className, style }: { type: string; className?: string; style?: React.CSSProperties }) {
  const icons: Record<string, typeof Shield> = {
    shield: Shield,
    flame: Flame,
    "git-branch": GitBranch,
    cpu: Cpu,
    database: Database,
    compass: Compass,
  }
  const Icon = icons[type] || Shield
  return <Icon className={className} style={style} />
}

function DragonAvatar({ name, vote, isActive, delay = 0 }: {
  name: DragonName
  vote: VoteValue
  isActive?: boolean
  delay?: number
}) {
  const dragon = DRAGONS[name]
  
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
        {isActive && (
          <motion.div
            className="absolute -inset-2 rounded-full blur-md"
            style={{ backgroundColor: dragon.color, opacity: 0.3 }}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        <div
          className={cn(
            "relative w-16 h-16 rounded-full p-[2px] transition-all duration-500",
            vote === "APPROVE" && "bg-gradient-to-b from-emerald-500/50 to-emerald-500/20",
            vote === "NULL" && "bg-gradient-to-b from-red-500/50 to-red-500/20",
            vote === "PENDING" && "bg-gradient-to-b from-zinc-600/50 to-zinc-700/30"
          )}
          style={{ boxShadow: isActive ? `0 0 30px -5px ${dragon.color}` : undefined }}
        >
          <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center relative overflow-hidden">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: dragon.color, opacity: 0.1 }}
              animate={isActive ? { opacity: [0.05, 0.15, 0.05] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            <DragonIcon 
              type={dragon.iconType}
              className={cn(
                "w-7 h-7 relative z-10 transition-colors duration-300",
                vote === "APPROVE" && "text-emerald-400",
                vote === "NULL" && "text-red-400",
                vote === "PENDING" && "text-zinc-400"
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
                className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 rounded-full"
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
            vote === "PENDING" && (isActive ? "text-white" : "text-zinc-500")
          )}
          style={{ color: vote === "PENDING" && isActive ? dragon.color : undefined }}
        >
          {dragon.name}
        </p>
        <p className="text-xs text-zinc-500">{dragon.title}</p>
      </motion.div>
    </motion.div>
  )
}

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
          className="w-64 h-64 rounded-full bg-gradient-radial from-amber-500/10 to-transparent"
          animate={{ scale: mission ? [1, 1.1, 1] : 1, opacity: mission ? [0.3, 0.5, 0.3] : 0.2 }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>
      
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
        <motion.div
          className="w-20 h-20 rounded-full border border-amber-500/20 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="w-12 h-12 rounded-full border border-amber-500/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500/10 to-transparent flex items-center justify-center">
              <span className="text-xs font-mono text-amber-500/60 tracking-widest">ELDER</span>
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
        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/10 blur-xl"
        animate={{ opacity: isFocused ? 1 : 0 }}
      />
      
      <div className={cn(
        "relative rounded-xl border bg-zinc-900/80 backdrop-blur-xl transition-all duration-300",
        isFocused ? "border-amber-500/50 shadow-lg shadow-amber-500/10" : "border-zinc-800",
        isProcessing && "opacity-70 pointer-events-none"
      )}>
        <div className="px-4 pt-3 pb-1 border-b border-zinc-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Mission Brief</span>
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
          className="w-full min-h-[80px] max-h-[200px] px-4 py-3 bg-transparent text-white placeholder:text-zinc-600 resize-none focus:outline-none text-sm leading-relaxed"
          rows={1}
        />
        
        <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-end">
          <button 
            onClick={handleSubmit} 
            disabled={!value.trim() || isProcessing}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              "bg-amber-500 text-black hover:bg-amber-400",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Deliberating...</span></>
            ) : (
              <><Send className="w-4 h-4" /><span>Submit to Senate</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

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
              isCurrent && "bg-amber-500/10 border border-amber-500/30",
              isComplete && "opacity-60"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full transition-all",
              isComplete && "bg-emerald-500",
              isCurrent && "bg-amber-500 animate-pulse",
              !isComplete && !isCurrent && "bg-zinc-700"
            )} />
            <span className={cn(
              "text-sm font-medium",
              isCurrent && "text-amber-500",
              isComplete && "text-zinc-500 line-through",
              !isComplete && !isCurrent && "text-zinc-600"
            )}>
              {phaseLabels[phase]}
            </span>
            {isCurrent && <Loader2 className="w-3 h-3 animate-spin text-amber-500 ml-auto" />}
            {isComplete && <Check className="w-3 h-3 text-emerald-500 ml-auto" />}
          </motion.div>
        )
      })}
    </div>
  )
}

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
        return { icon: Clock, color: "text-zinc-400", bg: "bg-zinc-800/50", border: "border-zinc-700", label: "DELIBERATING" }
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
          <p className="text-sm text-zinc-500">Senate Verdict</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span>Final vote: {mission.votes.filter(v => v.vote === "APPROVE").length} approve, {mission.votes.filter(v => v.vote === "NULL").length} null</span>
        </div>
        
        {mission.artifact && (
          <div className="mt-4 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Generated Artifact</span>
              <span className="text-xs font-mono text-amber-500">{mission.artifact.language}</span>
            </div>
            <pre className="text-xs text-zinc-300 overflow-x-auto max-h-32">
              <code>{mission.artifact.code}</code>
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <span className="text-xs font-bold text-black">N</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white">THE NEST</h1>
            <p className="text-xs text-zinc-500">Sovereign AI Governance</p>
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
          language: "TypeScript",
        } : undefined,
      }
    })
    
    setIsSimulating(false)
  }
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent"
            >
              The Senate Awaits
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-400 max-w-xl mx-auto"
            >
              Submit your mission to the sovereign AI council. Six dragons will deliberate and render their verdict.
            </motion.p>
          </div>
          
          <div className="grid lg:grid-cols-[1fr,300px] gap-8">
            <div className="space-y-8">
              <SenateChamber mission={mission} />
              
              {!mission && <MissionInput onSubmit={simulateDeliberation} isProcessing={isSimulating} />}
              
              <AnimatePresence>
                {mission && (mission.status === "APPROVED" || mission.status === "REFUSED") && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <VerdictDisplay mission={mission} />
                    
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      onClick={() => { setMission(null); setIsSimulating(false) }}
                      className="mt-4 w-full py-3 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors text-sm"
                    >
                      Submit New Mission
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="space-y-6">
              {mission && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50"
                >
                  <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Deliberation Phase</h3>
                  <PhaseTimeline currentPhase={mission.phase} />
                </motion.div>
              )}
              
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
                <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">The Council</h3>
                <div className="space-y-3">
                  {DRAGON_ORDER.map((name) => {
                    const dragon = DRAGONS[name]
                    const vote = mission?.votes.find(v => v.agent === name)?.vote
                    return (
                      <div key={name} className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dragon.color }} />
                        <span className="text-zinc-300 flex-1">{dragon.name}</span>
                        {vote === "APPROVE" && <Check className="w-4 h-4 text-emerald-500" />}
                        {vote === "NULL" && <X className="w-4 h-4 text-red-500" />}
                        {vote === "PENDING" && mission && <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
