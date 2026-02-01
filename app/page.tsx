"use client"

import { useState } from "react"

type DragonName = "ONYX" | "IGNIS" | "HYDRA" | "ETHER" | "TERRA" | "AEROS"

interface Dragon {
  name: DragonName
  role: string
  color: string
  description: string
}

const DRAGONS: Dragon[] = [
  { name: "ONYX", role: "Constitutional Guardian", color: "#6366f1", description: "Ensures mission aligns with core principles" },
  { name: "IGNIS", role: "Technical Validator", color: "#ef4444", description: "Validates technical feasibility and security" },
  { name: "HYDRA", role: "Edge Case Analyzer", color: "#22c55e", description: "Explores failure modes and edge cases" },
  { name: "ETHER", role: "Safety Arbiter", color: "#06b6d4", description: "Ensures physical and operational safety" },
  { name: "TERRA", role: "Resource Guardian", color: "#f59e0b", description: "Manages resource allocation and limits" },
  { name: "AEROS", role: "Integration Overseer", color: "#8b5cf6", description: "Coordinates cross-system dependencies" },
]

type VoteStatus = "pending" | "approved" | "rejected"

interface AgentVote {
  agent: DragonName
  status: VoteStatus
  reasoning?: string
}

export default function HomePage() {
  const [mission, setMission] = useState("")
  const [isDeliberating, setIsDeliberating] = useState(false)
  const [votes, setVotes] = useState<AgentVote[]>([])
  const [currentPhase, setCurrentPhase] = useState<string | null>(null)
  const [verdict, setVerdict] = useState<"approved" | "rejected" | null>(null)

  const handleSubmit = async () => {
    if (!mission.trim()) return
    
    setIsDeliberating(true)
    setVotes([])
    setVerdict(null)
    setCurrentPhase("Intent Check")

    // Simulate deliberation
    for (let i = 0; i < DRAGONS.length; i++) {
      await new Promise(r => setTimeout(r, 800))
      const dragon = DRAGONS[i]
      const approved = Math.random() > 0.2
      setVotes(prev => [...prev, {
        agent: dragon.name,
        status: approved ? "approved" : "rejected",
        reasoning: approved ? "Mission parameters acceptable" : "Constraints violated"
      }])
      
      if (i === 1) setCurrentPhase("Forge")
      if (i === 3) setCurrentPhase("Gauntlet")
      if (i === 5) setCurrentPhase("Selection")
    }

    await new Promise(r => setTimeout(r, 500))
    const approvedCount = votes.filter(v => v.status === "approved").length
    setVerdict(approvedCount >= 4 ? "approved" : "rejected")
    setCurrentPhase("Complete")
    setIsDeliberating(false)
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)",
      color: "#e2e8f0",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Header */}
      <header style={{
        padding: "24px 48px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #c9a227 0%, #daa520 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px"
          }}>
            N
          </div>
          <span style={{ fontSize: "24px", fontWeight: "bold", letterSpacing: "-0.02em" }}>
            THE NEST
          </span>
        </div>
        <span style={{ color: "#64748b", fontSize: "14px" }}>
          Sovereign AI Governance System
        </span>
      </header>

      <main style={{ padding: "48px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Mission Input */}
        <section style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "32px",
          marginBottom: "48px"
        }}>
          <h2 style={{ 
            fontSize: "20px", 
            fontWeight: "600", 
            marginBottom: "16px",
            color: "#c9a227"
          }}>
            Submit Mission for Deliberation
          </h2>
          <textarea
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder="Describe your mission... The Senate of Dragons will deliberate."
            disabled={isDeliberating}
            style={{
              width: "100%",
              minHeight: "120px",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "16px",
              color: "#e2e8f0",
              fontSize: "16px",
              resize: "vertical",
              outline: "none",
              marginBottom: "16px"
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={isDeliberating || !mission.trim()}
            style={{
              background: isDeliberating ? "#374151" : "linear-gradient(135deg, #c9a227 0%, #daa520 100%)",
              color: isDeliberating ? "#9ca3af" : "#0a0a0f",
              border: "none",
              borderRadius: "12px",
              padding: "14px 32px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: isDeliberating ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            {isDeliberating ? "Deliberating..." : "Summon The Senate"}
          </button>
        </section>

        {/* Current Phase */}
        {currentPhase && (
          <div style={{
            textAlign: "center",
            marginBottom: "32px",
            padding: "16px",
            background: "rgba(201, 162, 39, 0.1)",
            borderRadius: "12px",
            border: "1px solid rgba(201, 162, 39, 0.3)"
          }}>
            <span style={{ color: "#c9a227", fontWeight: "600" }}>
              Current Phase: {currentPhase}
            </span>
          </div>
        )}

        {/* Senate Chamber */}
        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          marginBottom: "48px"
        }}>
          {DRAGONS.map((dragon) => {
            const vote = votes.find(v => v.agent === dragon.name)
            return (
              <div
                key={dragon.name}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${vote ? (vote.status === "approved" ? "#22c55e" : "#ef4444") : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "16px",
                  padding: "24px",
                  transition: "all 0.3s",
                  boxShadow: vote ? `0 0 30px ${vote.status === "approved" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` : "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: `linear-gradient(135deg, ${dragon.color}33 0%, ${dragon.color}11 100%)`,
                    border: `2px solid ${dragon.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    color: dragon.color
                  }}>
                    {dragon.name[0]}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: "700", fontSize: "18px", color: dragon.color }}>
                      {dragon.name}
                    </h3>
                    <p style={{ fontSize: "13px", color: "#64748b" }}>
                      {dragon.role}
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "16px" }}>
                  {dragon.description}
                </p>
                <div style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: vote 
                    ? (vote.status === "approved" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)")
                    : "rgba(255,255,255,0.03)",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: vote 
                    ? (vote.status === "approved" ? "#22c55e" : "#ef4444")
                    : "#64748b"
                }}>
                  {vote ? (vote.status === "approved" ? "APPROVED" : "REJECTED") : "Awaiting..."}
                </div>
              </div>
            )
          })}
        </section>

        {/* Verdict */}
        {verdict && (
          <section style={{
            background: verdict === "approved" 
              ? "linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.05) 100%)"
              : "linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)",
            border: `2px solid ${verdict === "approved" ? "#22c55e" : "#ef4444"}`,
            borderRadius: "20px",
            padding: "48px",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "64px",
              marginBottom: "16px"
            }}>
              {verdict === "approved" ? "✓" : "✗"}
            </div>
            <h2 style={{
              fontSize: "32px",
              fontWeight: "800",
              marginBottom: "8px",
              color: verdict === "approved" ? "#22c55e" : "#ef4444"
            }}>
              MISSION {verdict.toUpperCase()}
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "16px" }}>
              {verdict === "approved" 
                ? "The Senate has reached consensus. Your mission may proceed."
                : "The Senate has rejected this mission. Please revise and resubmit."}
            </p>
          </section>
        )}
      </main>
    </div>
  )
}
