"use client"

import { useCallback, useRef, useState } from "react"
import type { MissionState, WSEvent, AgentVote, VerdictStatus, DragonName } from "@/lib/types"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/senate"

const DRAGON_ORDER: DragonName[] = ["ONYX", "IGNIS", "HYDRA", "ETHER", "TERRA", "AEROS"]

export function useSenateWS() {
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [mission, setMission] = useState<MissionState | null>(null)
  const [events, setEvents] = useState<WSEvent[]>([])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(WS_URL)
    
    ws.onopen = () => {
      setConnected(true)
    }
    
    ws.onclose = () => {
      setConnected(false)
      wsRef.current = null
    }
    
    ws.onerror = () => {
      setConnected(false)
    }
    
    ws.onmessage = (event) => {
      try {
        const data: WSEvent = JSON.parse(event.data)
        setEvents((prev) => [...prev, data])
        
        // Update mission state based on event
        setMission((prev) => {
          if (!prev) return prev
          
          let newStatus: VerdictStatus = prev.status
          let newPhase = prev.phase
          const newVotes = [...prev.votes]
          
          switch (data.event) {
            case "RECEIVED":
              newStatus = "DELIBERATING"
              newPhase = "INTENT_CHECK"
              break
              
            case "PERMISSION_GRANTED":
              newPhase = "FORGE"
              // Mark ONYX as approved
              const onyxIdx = newVotes.findIndex(v => v.agent === "ONYX")
              if (onyxIdx >= 0) newVotes[onyxIdx].vote = "APPROVE"
              break
              
            case "PERMISSION_DENIED":
            case "MISSION_REFUSED":
              newStatus = "REFUSED"
              break
              
            case "IGNIS_FORGE_COMPLETE":
              newPhase = "GAUNTLET"
              const ignisIdx = newVotes.findIndex(v => v.agent === "IGNIS")
              if (ignisIdx >= 0) newVotes[ignisIdx].vote = "APPROVE"
              break
              
            case "HYDRA_TEST_COMPLETE":
              newPhase = "SELECTION"
              const hydraIdx = newVotes.findIndex(v => v.agent === "HYDRA")
              if (hydraIdx >= 0) newVotes[hydraIdx].vote = "APPROVE"
              break
              
            case "SELECTION_COMPLETE":
              newPhase = "AUDIT"
              break
              
            case "FINAL_VERDICT":
              newStatus = data.final_state?.status === "APPROVED" ? "APPROVED" : "REFUSED"
              newPhase = "COMPLETE"
              // Mark remaining agents as approved if mission passed
              if (data.final_state?.status === "APPROVED") {
                newVotes.forEach((v, i) => {
                  if (v.vote === "PENDING") newVotes[i].vote = "APPROVE"
                })
              }
              break
          }
          
          return {
            ...prev,
            status: newStatus,
            phase: newPhase,
            votes: newVotes,
            artifact: data.final_state?.artifact ? {
              code: data.final_state.artifact.code || "",
              intermediateRepresentation: data.intermediate_representation || data.final_state.artifact.intermediate_representation || "",
              signature: data.artifact_signature || data.final_state.artifact.signature || "",
              language: data.final_state.artifact.language || "typescript",
            } : prev.artifact,
            updatedAt: Date.now(),
          }
        })
      } catch (e) {
        console.error("Failed to parse WS message:", e)
      }
    }
    
    wsRef.current = ws
  }, [])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
    setConnected(false)
  }, [])

  const submitMission = useCallback((missionText: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connect()
      // Wait for connection then send
      setTimeout(() => {
        wsRef.current?.send(JSON.stringify({ mission: missionText }))
      }, 500)
    } else {
      wsRef.current.send(JSON.stringify({ mission: missionText }))
    }
    
    // Initialize mission state
    const initialVotes: AgentVote[] = DRAGON_ORDER.map(agent => ({
      agent,
      vote: "PENDING" as const,
    }))
    
    setMission({
      id: crypto.randomUUID(),
      mission: missionText,
      status: "PENDING",
      phase: "INTENT_CHECK",
      votes: initialVotes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    
    setEvents([])
  }, [connect])

  const reset = useCallback(() => {
    setMission(null)
    setEvents([])
  }, [])

  return {
    connected,
    mission,
    events,
    connect,
    disconnect,
    submitMission,
    reset,
  }
}
