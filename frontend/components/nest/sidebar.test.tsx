import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from './sidebar'

describe('Sidebar', () => {
  const defaultProps = {
    activeView: 'command',
    onViewChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render system online status', () => {
    render(<Sidebar {...defaultProps} />)
    
    expect(screen.getByText('SYSTEM ONLINE')).toBeInTheDocument()
  })

  it('should render all navigation items', () => {
    render(<Sidebar {...defaultProps} />)
    
    expect(screen.getByText('COMMAND')).toBeInTheDocument()
    expect(screen.getByText('CHRONICLE')).toBeInTheDocument()
    expect(screen.getByText('LAWS')).toBeInTheDocument()
    expect(screen.getByText('SYSTEM')).toBeInTheDocument()
  })

  it('should render keyboard shortcuts', () => {
    render(<Sidebar {...defaultProps} />)
    
    expect(screen.getByText('⌘1')).toBeInTheDocument()
    expect(screen.getByText('⌘2')).toBeInTheDocument()
    expect(screen.getByText('⌘3')).toBeInTheDocument()
    expect(screen.getByText('⌘4')).toBeInTheDocument()
  })

  it('should highlight active navigation item', () => {
    render(<Sidebar {...defaultProps} activeView="chronicle" />)
    
    const chronicleButton = screen.getByText('CHRONICLE').closest('button')
    expect(chronicleButton).toHaveClass('bg-white/5')
  })

  it('should call onViewChange when navigation item is clicked', () => {
    const onViewChange = vi.fn()
    render(<Sidebar {...defaultProps} onViewChange={onViewChange} />)
    
    fireEvent.click(screen.getByText('CHRONICLE'))
    
    expect(onViewChange).toHaveBeenCalledWith('chronicle')
  })

  it('should render agent status indicators', () => {
    render(<Sidebar {...defaultProps} />)
    
    expect(screen.getByText('ONYX')).toBeInTheDocument()
    expect(screen.getByText('IGNIS')).toBeInTheDocument()
    expect(screen.getByText('HYDRA')).toBeInTheDocument()
  })

  it('should display build version', () => {
    render(<Sidebar {...defaultProps} />)
    
    expect(screen.getByText('BUILD')).toBeInTheDocument()
    expect(screen.getByText('5.2.0')).toBeInTheDocument()
  })

  it('should display environment status', () => {
    render(<Sidebar {...defaultProps} />)
    
    expect(screen.getByText('ENV')).toBeInTheDocument()
    expect(screen.getByText('SOVEREIGN')).toBeInTheDocument()
  })

  it('should handle all view transitions', () => {
    const onViewChange = vi.fn()
    render(<Sidebar {...defaultProps} onViewChange={onViewChange} />)
    
    fireEvent.click(screen.getByText('COMMAND'))
    expect(onViewChange).toHaveBeenCalledWith('command')

    fireEvent.click(screen.getByText('CHRONICLE'))
    expect(onViewChange).toHaveBeenCalledWith('chronicle')

    fireEvent.click(screen.getByText('LAWS'))
    expect(onViewChange).toHaveBeenCalledWith('constitution')

    fireEvent.click(screen.getByText('SYSTEM'))
    expect(onViewChange).toHaveBeenCalledWith('settings')
  })
})
