import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Settings } from './settings'
import { nestAPI } from '@/lib/api'

// Mock the API
vi.mock('@/lib/api', () => ({
  nestAPI: {
    getTelemetry: vi.fn(),
    configure: vi.fn(),
  },
}))

const mockTelemetry = {
  uptime_seconds: 86400.5,
  cpu_usage_percent: 35.5,
  ram_usage_mb: 512,
  governance_mode: 'STRICT_SOVEREIGN',
  active_agents: ['onyx', 'ignis', 'hydra'],
  latency_ms: 45,
  kernel_status: 'ONLINE',
}

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(nestAPI.getTelemetry as ReturnType<typeof vi.fn>).mockResolvedValue(mockTelemetry)
  })

  it('should render diagnostics header', async () => {
    render(<Settings />)
    
    expect(screen.getByText('SYSTEM DIAGNOSTICS')).toBeInTheDocument()
  })

  it('should load telemetry on mount', async () => {
    render(<Settings />)
    
    await waitFor(() => {
      expect(nestAPI.getTelemetry).toHaveBeenCalled()
    })
  })

  it('should display online status when connected', async () => {
    render(<Settings />)
    
    await waitFor(() => {
      // Multiple ONLINE elements appear - in header and status section
      const onlineElements = screen.getAllByText('ONLINE')
      expect(onlineElements.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('should display kernel status', async () => {
    render(<Settings />)
    
    await waitFor(() => {
      expect(screen.getByText('KERNEL STATUS')).toBeInTheDocument()
    })
  })

  it('should display governance mode', async () => {
    render(<Settings />)
    
    await waitFor(() => {
      expect(screen.getByText('STRICT')).toBeInTheDocument()
    })
  })

  it('should display latency', async () => {
    render(<Settings />)
    
    await waitFor(() => {
      expect(screen.getByText('45ms')).toBeInTheDocument()
    })
  })

  it('should display uptime formatted', async () => {
    render(<Settings />)
    
    await waitFor(() => {
      // 86400 seconds = 24:00:00
      expect(screen.getByText('24:00:00')).toBeInTheDocument()
    })
  })

  it('should display active agents', async () => {
    render(<Settings />)
    
    await waitFor(() => {
      // Agent names are lowercase in the component
      expect(screen.getByText('onyx')).toBeInTheDocument()
      expect(screen.getByText('ignis')).toBeInTheDocument()
      expect(screen.getByText('hydra')).toBeInTheDocument()
    })
  })

  it('should display CPU usage', async () => {
    render(<Settings />)
    
    await waitFor(() => {
      expect(screen.getByText(/35/)).toBeInTheDocument()
    })
  })

  it('should display RAM usage', async () => {
    render(<Settings />)
    
    await waitFor(() => {
      expect(screen.getByText(/512/)).toBeInTheDocument()
    })
  })

  it('should have test connection button', async () => {
    render(<Settings />)
    
    await waitFor(() => {
      const testButton = screen.getByText('TEST')
      expect(testButton).toBeInTheDocument()
    })
  })

  it('should test connection when button clicked', async () => {
    render(<Settings />)
    
    await waitFor(() => {
      const onlineElements = screen.getAllByText('ONLINE')
      expect(onlineElements.length).toBeGreaterThanOrEqual(1)
    })

    // Clear the mock to track new calls
    vi.mocked(nestAPI.getTelemetry).mockClear()

    const testButton = screen.getByText('TEST')
    fireEvent.click(testButton)

    await waitFor(() => {
      expect(nestAPI.getTelemetry).toHaveBeenCalled()
    })
  })

  it('should show offline status on connection failure', async () => {
    ;(nestAPI.getTelemetry as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

    render(<Settings />)
    
    await waitFor(() => {
      const offlineElements = screen.getAllByText('OFFLINE')
      expect(offlineElements.length).toBeGreaterThanOrEqual(1)
    }, { timeout: 2000 })
  })

  it('should poll telemetry periodically', async () => {
    vi.useFakeTimers()
    
    const { unmount } = render(<Settings />)
    
    // Initial call
    expect(nestAPI.getTelemetry).toHaveBeenCalled()
    
    // Clear and check for new call after interval
    vi.mocked(nestAPI.getTelemetry).mockClear()
    
    // Advance time by 5 seconds (poll interval)
    await vi.advanceTimersByTimeAsync(5000)

    expect(nestAPI.getTelemetry).toHaveBeenCalled()

    unmount()
    vi.useRealTimers()
  })

  it('should display API endpoint input', () => {
    render(<Settings />)
    
    const input = screen.getByDisplayValue('http://localhost:8000')
    expect(input).toBeInTheDocument()
  })

  it('should configure API when testing connection', async () => {
    render(<Settings />)
    
    await waitFor(() => {
      const onlineElements = screen.getAllByText('ONLINE')
      expect(onlineElements.length).toBeGreaterThanOrEqual(1)
    }, { timeout: 2000 })

    const input = screen.getByDisplayValue('http://localhost:8000')
    fireEvent.change(input, { target: { value: 'http://newhost:9000' } })

    const testButton = screen.getByText('TEST')
    fireEvent.click(testButton)

    await waitFor(() => {
      expect(nestAPI.configure).toHaveBeenCalledWith('http://newhost:9000')
    }, { timeout: 2000 })
  })

  it('should render kernel status section', () => {
    render(<Settings />)
    
    expect(screen.getByText('KERNEL STATUS')).toBeInTheDocument()
  })
})
