"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Header } from "@/components/layout"
import { AmbientBackground } from "@/components/ui"
import { SenateChamber, MissionInput, VerdictDisplay, PhaseTimeline } from "@/components/senate"
import { ArtifactViewer } from "@/components/artifact"
import { ChronicleBrowser } from "@/components/chronicle"
import type { MissionState, DragonName, AgentVote } from "@/lib/types"

// Simulated deliberation for demo (replace with real WebSocket)
const DRAGON_ORDER: DragonName[] = ["ONYX", "IGNIS", "HYDRA", "ETHER", "TERRA", "AEROS"]

export default function HomePage() {
  const [mission, setMission] = useState<MissionState | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showChronicle, setShowChronicle] = useState(false)
  
  // Simulated deliberation sequence
  const simulateDeliberation = async (missionText: string) => {
    setIsSimulating(true)
    
    // Initialize mission
    const initialVotes: AgentVote[] = DRAGON_ORDER.map(agent => ({
      agent,
      vote: "PENDING" as const,
    }))
    
    const newMission: MissionState = {
      id: crypto.randomUUID(),
      mission: missionText,
      status: "PENDING",
      phase: "INTENT_CHECK",
      votes: initialVotes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    
    setMission(newMission)
    
    // Simulate phase progression with dramatic timing
    const phases: Array<{ phase: MissionState["phase"], agent?: DragonName, delay: number }> = [
      { phase: "INTENT_CHECK", agent: "ONYX", delay: 1500 },
      { phase: "FORGE", agent: "IGNIS", delay: 2000 },
      { phase: "GAUNTLET", agent: "HYDRA", delay: 2500 },
      { phase: "SELECTION", agent: "ETHER", delay: 1500 },
      { phase: "AUDIT", agent: "TERRA", delay: 1500 },
      { phase: "COMPLETE", agent: "AEROS", delay: 1000 },
    ]
    
    for (const step of phases) {
      await new Promise(resolve => setTimeout(resolve, step.delay))
      
      setMission(prev => {
        if (!prev) return prev
        
        const newVotes = [...prev.votes]
        if (step.agent) {
          const idx = newVotes.findIndex(v => v.agent === step.agent)
          if (idx >= 0) {
            newVotes[idx] = { ...newVotes[idx], vote: "APPROVE" }
          }
        }
        
        return {
          ...prev,
          phase: step.phase,
          status: step.phase === "COMPLETE" ? "APPROVED" : "DELIBERATING",
          votes: newVotes,
          updatedAt: Date.now(),
          artifact: step.phase === "COMPLETE" ? {
            code: generateMockCode(missionText),
            intermediateRepresentation: generateMockIR(missionText),
            signature: `sha256:${crypto.randomUUID().replace(/-/g, "")}`,
            language: "typescript",
          } : prev.artifact,
        }
      })
    }
    
    setIsSimulating(false)
  }
  
  const handleSubmitMission = (missionText: string) => {
    simulateDeliberation(missionText)
  }
  
  const handleReset = () => {
    setMission(null)
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <AmbientBackground intensity="medium" />
      
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 radial-overlay" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
      </div>
      
      <Header onChronicleClick={() => setShowChronicle(true)} />
      
      {/* Chronicle Modal */}
      <AnimatePresence>
        {showChronicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowChronicle(false)}
            />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl"
            >
              <ChronicleBrowser onClose={() => setShowChronicle(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl mx-auto">
          {/* Hero Section - When no mission */}
          <AnimatePresence mode="wait">
            {!mission && (
              <motion.div
                key="hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">
                    Sovereign Grade Engineering
                  </span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-balance"
                >
                  <span className="text-foreground">Command the </span>
                  <span className="text-primary text-glow">Senate</span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty"
                >
                  Where six Dragon agents deliberate on your mission. 
                  Every line of code passes through governance before execution.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Left Panel - Timeline & Info */}
            <AnimatePresence>
              {mission && (
                <motion.aside
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="lg:col-span-3"
                >
                  <div className="sticky top-24 space-y-6">
                    <PhaseTimeline mission={mission} />
                    
                    {/* Reset Button */}
                    <button
                      onClick={handleReset}
                      className="w-full py-2 px-4 text-sm text-muted-foreground hover:text-foreground border border-border/50 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      New Mission
                    </button>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
            
            {/* Center - Senate Chamber */}
            <div className={mission ? "lg:col-span-6" : "lg:col-span-12"}>
              {/* Mission Input */}
              <MissionInput
                onSubmit={handleSubmitMission}
                isProcessing={isSimulating}
                className="mb-8 max-w-2xl mx-auto"
              />
              
              {/* Senate Visualization */}
              <AnimatePresence>
                {mission && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                  >
                    <SenateChamber mission={mission} className="mb-8" />
                    <VerdictDisplay mission={mission} className="max-w-xl mx-auto" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Right Panel - Artifact */}
            <AnimatePresence>
              {mission?.artifact && (
                <motion.aside
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="lg:col-span-3"
                >
                  <div className="sticky top-24">
                    <ArtifactViewer artifact={mission.artifact} />
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}

// Mock code generator for demo
function generateMockCode(mission: string): string {
  return `// THE NEST - Rosetta Artifact
// Mission: ${mission.slice(0, 50)}${mission.length > 50 ? "..." : ""}
// Generated: ${new Date().toISOString()}
// Governance: APPROVED

import { SafetyBoundary } from "@nest/core";

export class MissionController {
  private readonly safety: SafetyBoundary;
  
  constructor() {
    this.safety = new SafetyBoundary({
      maxVoltage: 24.0,
      thermalLimit: 85,
      watchdogTimeout: 1000,
    });
  }
  
  async execute(): Promise<void> {
    // Pre-flight safety check
    await this.safety.verify();
    
    // Main execution loop
    while (this.safety.isOperational()) {
      // Implementation here...
      await this.tick();
    }
  }
  
  private async tick(): Promise<void> {
    // Governed operation cycle
  }
}
`
}

function generateMockIR(mission: string): string {
  return `ROSETTA INTERMEDIATE REPRESENTATION
===================================
Mission: ${mission.slice(0, 40)}...

INTENT: Create mission controller with safety boundaries
CONSTRAINTS:
  - Max voltage: 24.0V (Hardware Limit)
  - Thermal limit: 85°C (Component Rating)
  - Watchdog: 1000ms (Safety Relay)

LOGIC FLOW:
  1. Initialize safety boundary
  2. Verify pre-flight conditions
  3. Enter governed execution loop
  4. Respect all hardware constraints

VERIFICATION: Binary matches IR (SHA256 verified)
GOVERNANCE: AUTHORIZED by Senate`
}
