import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SenateFlow } from './senate-flow'

describe('SenateFlow', () => {
  const defaultProps = {
    onyxStatus: 'IDLE' as const,
    ignisStatus: 'IDLE' as const,
    hydraStatus: 'IDLE' as const,
  }

  it('should render all three agents', () => {
    render(<SenateFlow {...defaultProps} />)
    
    expect(screen.getByText('ONYX')).toBeInTheDocument()
    expect(screen.getByText('IGNIS')).toBeInTheDocument()
    expect(screen.getByText('HYDRA')).toBeInTheDocument()
  })

  it('should render agent roles', () => {
    render(<SenateFlow {...defaultProps} />)
    
    expect(screen.getByText('ARBITER')).toBeInTheDocument()
    expect(screen.getByText('FORGER')).toBeInTheDocument()
    expect(screen.getByText('ADVERSARY')).toBeInTheDocument()
  })

  it('should show IDLE status by default', () => {
    render(<SenateFlow {...defaultProps} />)
    
    // All agents should show IDLE initially
    const idleStatuses = screen.getAllByText('IDLE')
    expect(idleStatuses.length).toBe(3)
  })

  it('should show ACTIVE status for active agent', () => {
    render(<SenateFlow {...defaultProps} ignisStatus="ACTIVE" />)
    
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })

  it('should show COMPLETE status for completed agents', () => {
    render(
      <SenateFlow
        onyxStatus="COMPLETE"
        ignisStatus="COMPLETE"
        hydraStatus="IDLE"
      />
    )
    
    const completeStatuses = screen.getAllByText('COMPLETE')
    expect(completeStatuses.length).toBe(2)
  })

  it('should show VETO status when agent vetoes', () => {
    render(
      <SenateFlow
        onyxStatus="VETO"
        ignisStatus="IDLE"
        hydraStatus="IDLE"
      />
    )
    
    expect(screen.getByText('VETO')).toBeInTheDocument()
  })

  it('should display Hydra findings count as badge', () => {
    render(
      <SenateFlow
        {...defaultProps}
        hydraStatus="COMPLETE"
        hydraFindings={3}
      />
    )
    
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should show OVERRIDE status when hydraOverride is true', () => {
    render(
      <SenateFlow
        {...defaultProps}
        hydraStatus="COMPLETE"
        hydraOverride={true}
      />
    )
    
    expect(screen.getByText('OVERRIDE')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <SenateFlow {...defaultProps} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should render flow connectors between agents', () => {
    const { container } = render(<SenateFlow {...defaultProps} />)
    
    // Check for SVG connectors (arrows between agents)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('should handle all status combinations', () => {
    const statuses = ['IDLE', 'ACTIVE', 'COMPLETE', 'VETO', 'OVERRIDE'] as const

    statuses.forEach(status => {
      const { unmount } = render(
        <SenateFlow
          onyxStatus={status}
          ignisStatus="IDLE"
          hydraStatus="IDLE"
        />
      )
      
      expect(screen.getByText('ONYX')).toBeInTheDocument()
      unmount()
    })
  })
})
