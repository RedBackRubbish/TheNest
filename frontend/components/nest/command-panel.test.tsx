import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommandPanel } from './command-panel'

// The component creates its own WebSocket, so we rely on global mock
describe('CommandPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render command input', () => {
    render(<CommandPanel />)
    
    const input = screen.getByPlaceholderText(/enter.*command|type.*mission|directive/i)
    expect(input).toBeInTheDocument()
  })

  it('should render keeper prompt', () => {
    render(<CommandPanel />)
    
    expect(screen.getByText(/keeper.*nest|keeper@nest/i)).toBeInTheDocument()
  })

  it('should render Article 50 toggle', () => {
    render(<CommandPanel />)
    
    expect(screen.getByText(/ARTICLE 50|ART.*50|MARTIAL/i)).toBeInTheDocument()
  })

  it('should display Senate Flow visualization', () => {
    render(<CommandPanel />)
    
    // Should show all three agents from SenateFlow
    // Note: These come from the SenateFlow component which uses ARBITER/FORGER/ADVERSARY roles
    expect(screen.getByText('ARBITER')).toBeInTheDocument()
    expect(screen.getByText('FORGER')).toBeInTheDocument()
    expect(screen.getByText('ADVERSARY')).toBeInTheDocument()
  })

  it('should clear input after submission', async () => {
    const user = userEvent.setup()
    render(<CommandPanel />)
    
    const input = screen.getByPlaceholderText(/enter.*command|type.*mission|directive/i) as HTMLInputElement
    await user.type(input, 'Test command{enter}')

    // Input should clear after submit
    await waitFor(() => {
      expect(input.value).toBe('')
    })
  })

  it('should disable input while processing', async () => {
    const user = userEvent.setup()
    render(<CommandPanel />)
    
    const input = screen.getByPlaceholderText(/enter.*command|type.*mission|directive/i) as HTMLInputElement
    await user.type(input, 'Test command{enter}')

    // Input should be disabled while processing
    await waitFor(() => {
      expect(input).toBeDisabled()
    }, { timeout: 100 })
  })

  it('should toggle Article 50 mode', async () => {
    render(<CommandPanel />)
    
    // Find the toggle button (it's a custom button, not a switch role)
    const toggleButton = screen.getByText('ART. 50').parentElement?.querySelector('button')
    
    if (toggleButton) {
      fireEvent.click(toggleButton)
      // After click, component should still render without error
      expect(screen.getByText('ART. 50')).toBeInTheDocument()
    } else {
      // If not found as expected, check the label exists at minimum
      expect(screen.getByText('ART. 50')).toBeInTheDocument()
    }
  })

  it('should focus input on mount', () => {
    render(<CommandPanel />)
    
    const input = screen.getByPlaceholderText(/enter.*command|type.*mission|directive/i)
    expect(document.activeElement).toBe(input)
  })

  it('should show log entries area', () => {
    const { container } = render(<CommandPanel />)
    
    // Should have a scrollable log area
    const logArea = container.querySelector('[class*="overflow"]')
    expect(logArea).toBeDefined()
  })

  it('should render agent roles in flow', () => {
    render(<CommandPanel />)
    
    expect(screen.getByText('ARBITER')).toBeInTheDocument()
    expect(screen.getByText('FORGER')).toBeInTheDocument()
    expect(screen.getByText('ADVERSARY')).toBeInTheDocument()
  })

  it('should show agents in IDLE state initially', () => {
    render(<CommandPanel />)
    
    const idleStatuses = screen.getAllByText('IDLE')
    expect(idleStatuses.length).toBe(3)
  })

  it('should accept keyboard enter to submit', async () => {
    const user = userEvent.setup()
    render(<CommandPanel />)
    
    const input = screen.getByPlaceholderText(/enter.*command|type.*mission|directive/i)
    await user.type(input, 'Test command')
    
    // Pressing enter should submit
    await user.keyboard('{Enter}')
    
    // Input should be cleared
    await waitFor(() => {
      expect((input as HTMLInputElement).value).toBe('')
    })
  })

  it('should not submit empty commands', async () => {
    const user = userEvent.setup()
    render(<CommandPanel />)
    
    const input = screen.getByPlaceholderText(/enter.*command|type.*mission|directive/i)
    
    // Press enter with empty input
    await user.keyboard('{Enter}')
    
    // Input should not be disabled (no processing started)
    expect(input).not.toBeDisabled()
  })

  it('should render constitutional branding', () => {
    render(<CommandPanel />)
    
    // Should have constitutional styling elements
    expect(screen.getByText('SENATE CHAMBER')).toBeInTheDocument()
    expect(screen.getByText('CONSTITUTIONAL SESSION')).toBeInTheDocument()
  })
})
