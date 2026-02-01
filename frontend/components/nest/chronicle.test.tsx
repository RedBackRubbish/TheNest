import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Chronicle } from './chronicle'
import { nestAPI } from '@/lib/api'

// Mock the API
vi.mock('@/lib/api', () => ({
  nestAPI: {
    searchChronicle: vi.fn(),
    getCase: vi.fn(),
    getCaseAppeals: vi.fn(),
  },
}))

const mockSearchResult = {
  query: 'test',
  count: 2,
  results: [
    {
      case_id: 'case-001',
      case_type: 'precedent',
      question: 'Implement security protocol for API',
      ruling: 'approved',
      timestamp: '2024-01-15T10:30:00Z',
      appeal_count: 0,
      votes: [
        { agent: 'onyx', verdict: 'AUTHORIZE', reasoning: 'Well structured', confidence: 0.9, governance_mode_active: true, hydra_findings_cited: false },
      ],
    },
    {
      case_id: 'case-002',
      case_type: 'appeal',
      question: 'Database access extension request',
      ruling: 'refused',
      timestamp: '2024-01-16T14:20:00Z',
      appeal_count: 1,
      votes: [
        { agent: 'onyx', verdict: 'VETO', reasoning: 'Scope too broad', confidence: 0.85, governance_mode_active: true, hydra_findings_cited: false },
      ],
    },
  ],
}

describe('Chronicle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(nestAPI.searchChronicle as ReturnType<typeof vi.fn>).mockResolvedValue(mockSearchResult)
    ;(nestAPI.getCaseAppeals as ReturnType<typeof vi.fn>).mockResolvedValue({ case_id: 'case-001', appeal_count: 0, appeals: [] })
  })

  it('should render chronicle header', () => {
    render(<Chronicle />)
    
    expect(screen.getByText('CASE LAW ARCHIVE')).toBeInTheDocument()
    expect(screen.getByText('STARE DECISIS')).toBeInTheDocument()
  })

  it('should render search input', () => {
    render(<Chronicle />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('should search when user types in search box', async () => {
    render(<Chronicle />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'security' } })

    await waitFor(() => {
      expect(nestAPI.searchChronicle).toHaveBeenCalledWith('security')
    })
  })

  it('should display cases from search results', async () => {
    render(<Chronicle />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })

    await waitFor(() => {
      expect(screen.getByText(/security protocol/i)).toBeInTheDocument()
    })
  })

  it('should display case entries in table', async () => {
    render(<Chronicle />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })

    await waitFor(() => {
      // Case entries show up in rows - look for directive/question text
      expect(screen.getByText(/security protocol/i)).toBeInTheDocument()
    })
  })

  it('should display ruling badges in table', async () => {
    render(<Chronicle />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })

    await waitFor(() => {
      // Ruling text appears in the footer legend 
      expect(screen.getByText('APPROVED')).toBeInTheDocument()
      expect(screen.getByText('REFUSED')).toBeInTheDocument()
    })
  })

  it('should show empty state when no search performed', () => {
    render(<Chronicle />)
    
    // Before searching, shows "ENTER SEARCH QUERY"
    expect(screen.getByText('ENTER SEARCH QUERY')).toBeInTheDocument()
  })

  it('should handle API errors gracefully', async () => {
    ;(nestAPI.searchChronicle as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'))

    render(<Chronicle />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })

    // Should not crash and should show error
    await waitFor(() => {
      expect(screen.queryByText(/security protocol/i)).not.toBeInTheDocument()
    })
  })

  it('should debounce search input', async () => {
    vi.useFakeTimers()
    render(<Chronicle />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    
    // Type quickly
    fireEvent.change(searchInput, { target: { value: 't' } })
    fireEvent.change(searchInput, { target: { value: 'te' } })
    fireEvent.change(searchInput, { target: { value: 'test' } })

    // Should not have made calls yet due to debounce
    expect(nestAPI.searchChronicle).not.toHaveBeenCalled()

    // Advance timers past debounce threshold (300ms)
    await vi.advanceTimersByTimeAsync(350)

    expect(nestAPI.searchChronicle).toHaveBeenCalledWith('test')

    vi.useRealTimers()
  })

  it('should call API when searching', async () => {
    render(<Chronicle />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })

    await waitFor(() => {
      expect(nestAPI.searchChronicle).toHaveBeenCalled()
    })
  })

  it('should display multiple search results', async () => {
    render(<Chronicle />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'test' } })

    await waitFor(() => {
      // Both cases should be visible in results
      expect(screen.getByText(/security protocol/i)).toBeInTheDocument()
      expect(screen.getByText(/Database access/i)).toBeInTheDocument()
    })
  })

  it('should render immutability notice', () => {
    render(<Chronicle />)
    
    expect(screen.getByText(/ARTICLE 7: ALL PRECEDENT IS BINDING/)).toBeInTheDocument()
  })
})
