import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Constitution } from './constitution'

describe('Constitution', () => {
  it('should render governance framework header', () => {
    render(<Constitution />)
    
    expect(screen.getByText('GOVERNANCE FRAMEWORK')).toBeInTheDocument()
    expect(screen.getByText('IMMUTABLE')).toBeInTheDocument()
  })

  it('should render all 9 constitutional articles', () => {
    render(<Constitution />)
    
    // Article 1 - Primacy of Human Authority
    expect(screen.getByText('Primacy of Human Authority')).toBeInTheDocument()
    
    // Article 7 - Stare Decisis
    expect(screen.getByText('Stare Decisis (Binding Precedent)')).toBeInTheDocument()
    
    // Article 12 - Right to Appeal
    expect(screen.getByText('Right to Appeal')).toBeInTheDocument()
    
    // Article 17 - Hydra Binding Rule
    expect(screen.getByText('Hydra Binding Rule')).toBeInTheDocument()
    
    // Article 23 - NullVerdict Persistence
    expect(screen.getByText('NullVerdict Persistence')).toBeInTheDocument()
    
    // Article 31 - Ungoverned Namespace Quarantine
    expect(screen.getByText('Ungoverned Namespace Quarantine')).toBeInTheDocument()
    
    // Article 42 - Fail-Closed Governance
    expect(screen.getByText('Fail-Closed Governance')).toBeInTheDocument()
    
    // Article 50 - Martial Governance
    expect(screen.getByText(/Martial Governance/)).toBeInTheDocument()
    
    // Article 99 - Constitutional Immutability
    expect(screen.getByText('Constitutional Immutability')).toBeInTheDocument()
  })

  it('should display article classifications', () => {
    render(<Constitution />)
    
    expect(screen.getAllByText('CORE').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('SECURITY').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('PROCEDURE').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('EMERGENCY').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('META').length).toBeGreaterThanOrEqual(1)
  })

  it('should show enforcement status indicators', () => {
    render(<Constitution />)
    
    const mechanicalEnforcements = screen.getAllByText('MECHANICAL')
    expect(mechanicalEnforcements.length).toBeGreaterThan(0)
  })

  it('should display invariant badges', () => {
    render(<Constitution />)
    
    // Invariant names appear in both article badges and footer summary
    // Check that at least some invariants are present
    const chronicleInvariant = screen.queryAllByText('CHRONICLE_APPEND_ONLY')
    const hydraInvariant = screen.queryAllByText('HYDRA_CANNOT_BE_IGNORED')
    
    // Each invariant should appear at least once (could be 2 - in article and footer)
    expect(chronicleInvariant.length).toBeGreaterThanOrEqual(1)
    expect(hydraInvariant.length).toBeGreaterThanOrEqual(1)
  })

  it('should explain Chronicle write-protection', () => {
    render(<Constitution />)
    
    expect(screen.getByText(/append-only/i)).toBeInTheDocument()
  })

  it('should explain Hydra binding authority', () => {
    render(<Constitution />)
    
    expect(screen.getByText(/Hydra demonstrates a concrete exploit/i)).toBeInTheDocument()
  })

  it('should explain Article 50 emergency provisions', () => {
    render(<Constitution />)
    
    expect(screen.getByText(/Keeper may invoke emergency powers/i)).toBeInTheDocument()
  })

  it('should render article content', () => {
    render(<Constitution />)
    
    // Article 1 content
    expect(screen.getByText(/Keeper retains ultimate authority/i)).toBeInTheDocument()
    
    // Article 42 content
    expect(screen.getByText(/On error, refuse/i)).toBeInTheDocument()
  })

  it('should render with proper styling', () => {
    const { container } = render(<Constitution />)
    
    // Check for article containers with borders
    const articleElements = container.querySelectorAll('[class*="border"]')
    expect(articleElements.length).toBeGreaterThan(0)
  })

  it('should display classification icons', () => {
    render(<Constitution />)
    
    // Icons from classificationConfig
    expect(screen.getAllByText('⚖️').length).toBeGreaterThanOrEqual(1) // CORE
    expect(screen.getAllByText('🛡️').length).toBeGreaterThanOrEqual(1) // SECURITY
  })

  it('should show version number', () => {
    render(<Constitution />)
    
    expect(screen.getByText(/REV 2026/)).toBeInTheDocument()
  })
})
