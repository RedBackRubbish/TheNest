// The Dragons - Institutional Agents of The Nest

export type DragonName = "ONYX" | "IGNIS" | "HYDRA" | "ETHER" | "TERRA" | "AEROS"

export interface Dragon {
  name: DragonName
  title: string
  mandate: string
  domain: string
  color: string
  glowClass: string
  icon: string
}

export const DRAGONS: Record<DragonName, Dragon> = {
  ONYX: {
    name: "ONYX",
    title: "The Auditor",
    mandate: "Security & Policy Enforcement",
    domain: "Safety Veto Power",
    color: "hsl(280, 65%, 55%)",
    glowClass: "glow-onyx",
    icon: "shield",
  },
  IGNIS: {
    name: "IGNIS",
    title: "The Engine",
    mandate: "Aggressive Optimization & Logic Synthesis",
    domain: "Code Generation",
    color: "hsl(15, 85%, 55%)",
    glowClass: "glow-ignis",
    icon: "flame",
  },
  HYDRA: {
    name: "HYDRA",
    title: "The Adversary",
    mandate: "Metamorphic Testing & Chaos Injection",
    domain: "Quality Assurance",
    color: "hsl(200, 85%, 50%)",
    glowClass: "glow-hydra",
    icon: "git-branch",
  },
  ETHER: {
    name: "ETHER",
    title: "The Bridge",
    mandate: "Physical World Actuation",
    domain: "Hardware Interface",
    color: "hsl(185, 75%, 45%)",
    glowClass: "glow-ether",
    icon: "cpu",
  },
  TERRA: {
    name: "TERRA",
    title: "The Archive",
    mandate: "State Persistence & Data Integrity",
    domain: "Data Management",
    color: "hsl(145, 65%, 42%)",
    glowClass: "glow-terra",
    icon: "database",
  },
  AEROS: {
    name: "AEROS",
    title: "The Navigator",
    mandate: "External Interface & Reality Checking",
    domain: "Supply Chain",
    color: "hsl(220, 70%, 60%)",
    glowClass: "glow-aeros",
    icon: "compass",
  },
}

export type VoteValue = "APPROVE" | "NULL" | "PENDING" | "ABSTAIN"

export interface AgentVote {
  agent: DragonName
  vote: VoteValue
  reasoning?: string
  timestamp?: number
}

export type VerdictStatus = 
  | "PENDING"
  | "DELIBERATING" 
  | "APPROVED" 
  | "REFUSED" 
  | "STOP_WORK_ORDER"
  | "UNGOVERNED"

export interface MissionState {
  id: string
  mission: string
  status: VerdictStatus
  phase: "INTENT_CHECK" | "FORGE" | "GAUNTLET" | "SELECTION" | "AUDIT" | "COMPLETE"
  votes: AgentVote[]
  artifact?: {
    code: string
    intermediateRepresentation: string
    signature: string
    language: string
  }
  nullVerdict?: {
    nullingAgents: DragonName[]
    reasonCodes: string[]
    contextSummary: string
    appealable: boolean
  }
  precedentsCited?: string[]
  createdAt: number
  updatedAt: number
}

export interface Precedent {
  case_id: string
  question: string
  deliberation: Array<{
    agent: string
    argument: string
    vote: string
  }>
  verdict: {
    ruling: "AUTHORIZED" | "NULL_VERDICT" | "UNGOVERNED"
    principle_cited: string
    dissenting_opinion?: string
  }
  created_at: string
}

// WebSocket event types
export type WSEventType = 
  | "RECEIVED"
  | "PERMISSION_CHECK"
  | "PERMISSION_GRANTED"
  | "PERMISSION_DENIED"
  | "IGNIS_FORGE_COMPLETE"
  | "HYDRA_TEST_COMPLETE"
  | "SELECTION_COMPLETE"
  | "MISSION_REFUSED"
  | "FINAL_VERDICT"

export interface WSEvent {
  event: WSEventType
  votes?: VoteValue[]
  verdict?: any
  artifact_signature?: string
  intermediate_representation?: string
  reason?: string
  final_state?: {
    mission: string
    status: string
    artifact?: any
    full_verdict?: any
  }
}
