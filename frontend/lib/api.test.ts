import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch for API tests
const mockFetch = vi.fn()
global.fetch = mockFetch

// Import after mocking
import { nestAPI, NestAPIClient } from './api'

describe('NestAPI', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    nestAPI.configure('http://localhost:8000')
  })

  describe('health()', () => {
    it('should return health status from backend', async () => {
      const mockHealth = { status: 'ok', governance: 'active', mode: 'sovereign' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHealth),
      })

      const result = await nestAPI.health()

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/health')
      expect(result).toEqual(mockHealth)
    })

    it('should throw on health check failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(nestAPI.health()).rejects.toThrow('Health check failed: 500')
    })
  })

  describe('getTelemetry()', () => {
    it('should fetch telemetry data from correct endpoint', async () => {
      const mockTelemetry = {
        uptime_seconds: 3600.0,
        cpu_usage_percent: 25.5,
        ram_usage_mb: 512,
        governance_mode: 'sovereign',
        active_agents: ['onyx', 'ignis', 'hydra'],
        latency_ms: 45,
        kernel_status: 'online',
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTelemetry),
      })

      const result = await nestAPI.getTelemetry()

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/system/telemetry')
      expect(result.active_agents).toContain('hydra')
      expect(result.cpu_usage_percent).toBe(25.5)
    })
  })

  describe('submitMission()', () => {
    it('should submit mission with correct payload', async () => {
      const mockResponse = { 
        status: 'APPROVED', 
        mission: 'test',
        artifact: null,
        verdict: null,
        message: null,
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      await nestAPI.submitMission('Create a function', { article50: false })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/missions',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mission: 'Create a function', context: { article50: false } }),
        })
      )
    })

    it('should include context in mission request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'PROCESSING' }),
      })

      await nestAPI.submitMission('Emergency task', { article50: true, priority: 'high' })

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.context.article50).toBe(true)
      expect(callBody.mission).toBe('Emergency task')
    })
  })

  describe('searchChronicle()', () => {
    it('should search with query parameter', async () => {
      const mockResult = { 
        query: 'test query',
        count: 1,
        results: [{ id: 'case-1', case_type: 'precedent', question: 'Test case' }],
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      })

      const result = await nestAPI.searchChronicle('test query')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/chronicle/search?q=test%20query'
      )
      expect(result.count).toBe(1)
    })
  })

  describe('getCase()', () => {
    it('should fetch specific case by ID', async () => {
      const mockCase = {
        id: 'case-123',
        case_type: 'appeal',
        question: 'Appeal case',
        ruling: 'approved',
        timestamp: '2024-01-01T00:00:00Z',
        appeal_count: 0,
        votes: [
          { agent: 'onyx', verdict: 'AUTHORIZE', reasoning: 'Looks good', confidence: 0.9, governance_mode_active: true, hydra_findings_cited: false },
        ],
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCase),
      })

      const result = await nestAPI.getCase('case-123')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/chronicle/case/case-123'
      )
      expect(result.votes).toHaveLength(1)
    })
  })

  describe('submitAppeal()', () => {
    it('should submit appeal with required fields', async () => {
      const appealResponse = {
        appeal_id: 'appeal-456',
        original_case_id: 'case-123',
        status: 'OVERTURNED',
        original_ruling: 'refused',
        new_ruling: 'approved',
        appeal_depth: 1,
        liability_multiplier: 1.5,
        chronicle_citations: [],
        message: 'Appeal granted',
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(appealResponse),
      })

      const result = await nestAPI.submitAppeal({
        case_id: 'case-123',
        expanded_context: { reason: 'new evidence' },
        constraint_changes: {},
        appellant_reason: 'New evidence available',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/appeals',
        expect.objectContaining({
          method: 'POST',
        })
      )
      expect(result.status).toBe('OVERTURNED')
    })
  })

  describe('getCaseAppeals()', () => {
    it('should fetch appeals for a specific case', async () => {
      const mockAppeals = {
        case_id: 'case-123',
        appeal_count: 2,
        appeals: [
          { id: 'appeal-1', ruling: 'upheld' },
          { id: 'appeal-2', ruling: 'overturned' },
        ],
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAppeals),
      })

      const result = await nestAPI.getCaseAppeals('case-123')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/chronicle/case/case-123/appeals'
      )
      expect(result.appeal_count).toBe(2)
    })
  })

  describe('createSenateConnection()', () => {
    it('should create WebSocket connection with correct URL', () => {
      const onMessage = vi.fn()
      const ws = nestAPI.createSenateConnection(onMessage)

      expect(ws).toBeInstanceOf(WebSocket)
      expect(ws.url).toBe('ws://localhost:8000/ws/senate')
    })
  })

  describe('configure()', () => {
    it('should update base URL', async () => {
      nestAPI.configure('https://custom-api.example.com/')
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      })

      await nestAPI.health()

      expect(mockFetch).toHaveBeenCalledWith('https://custom-api.example.com/health')
      
      // Reset
      nestAPI.configure('http://localhost:8000')
    })

    it('should strip trailing slash', async () => {
      nestAPI.configure('http://test.com/')
      expect(nestAPI.isConfigured()).toBe(true)
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      })

      await nestAPI.health()
      
      expect(mockFetch).toHaveBeenCalledWith('http://test.com/health')
      
      // Reset
      nestAPI.configure('http://localhost:8000')
    })
  })

  describe('backward compatibility aliases', () => {
    it('checkHealth should alias health', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      })

      await nestAPI.checkHealth()

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/health')
    })
  })
})

describe('API Types', () => {
  it('should validate Vote structure', () => {
    const vote = {
      agent: 'onyx',
      verdict: 'AUTHORIZE' as const,
      reasoning: 'Valid approach',
      confidence: 0.95,
      governance_mode_active: true,
      hydra_findings_cited: false,
    }

    expect(vote.agent).toBe('onyx')
    expect(['AUTHORIZE', 'VETO', 'ABSTAIN']).toContain(vote.verdict)
    expect(vote.confidence).toBeGreaterThan(0)
  })

  it('should validate HydraFinding structure', () => {
    const finding = {
      pattern_matched: 'sudo_usage',
      excerpt: 'Line 42: sudo rm -rf /',
      severity: 'CRITICAL' as const,
    }

    expect(finding.severity).toBe('CRITICAL')
    expect(['CRITICAL', 'HIGH', 'MEDIUM']).toContain(finding.severity)
  })

  it('should validate SenateRecord structure', () => {
    const record = {
      state: 'authorized' as const,
      intent: 'Create helper function',
      ignis_proposal: 'function helper() {}',
      hydra_report: 'No violations found',
      hydra_findings: [],
      votes: [
        { agent: 'onyx', verdict: 'AUTHORIZE' as const, reasoning: 'OK', confidence: 0.9, governance_mode_active: true, hydra_findings_cited: false },
        { agent: 'ignis', verdict: 'AUTHORIZE' as const, reasoning: 'OK', confidence: 0.85, governance_mode_active: true, hydra_findings_cited: false },
        { agent: 'hydra', verdict: 'AUTHORIZE' as const, reasoning: 'No violations', confidence: 1.0, governance_mode_active: true, hydra_findings_cited: false },
      ],
      appealable: true,
      metadata: {},
    }

    expect(record.votes).toHaveLength(3)
    expect(record.state).toBe('authorized')
    expect(['pending', 'null_verdict', 'awaiting_appeal', 'authorized', 'ungoverned', 'hydra_override']).toContain(record.state)
  })

  it('should validate WSLogMessage variant', () => {
    const logMessage = {
      type: 'log' as const,
      timestamp: '2024-01-01T00:00:00Z',
      agent: 'onyx',
      status: 'processing',
      message: 'Processing request',
    }

    expect(logMessage.type).toBe('log')
  })

  it('should validate WSFinalVerdictMessage variant', () => {
    const verdictMessage = {
      type: 'final_verdict' as const,
      result: 'AUTHORIZED' as const,
      reason: 'All agents approved',
      appealable: true,
      hydra_override: false,
      unacknowledged_findings: 0,
      risk_acknowledged: false,
    }

    expect(verdictMessage.type).toBe('final_verdict')
    expect(['AUTHORIZED', 'VETOED', 'HYDRA_OVERRIDE', 'UNGOVERNED']).toContain(verdictMessage.result)
  })

  it('should validate WSStateChangeMessage variant', () => {
    const stateMsg = {
      type: 'state_change' as const,
      node: 'HYDRA' as const,
      status: 'ACTIVE' as const,
    }

    expect(stateMsg.type).toBe('state_change')
    expect(['ONYX', 'IGNIS', 'HYDRA']).toContain(stateMsg.node)
  })
})

