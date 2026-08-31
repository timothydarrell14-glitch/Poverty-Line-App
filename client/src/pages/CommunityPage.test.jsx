import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import CommunityPage from './CommunityPage'

describe('CommunityPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders channels and community hub header', async () => {
    const mockCommunities = [
      {
        community_id: 1,
        name: 'General Support',
        category: 'General Support',
        description: 'Safe space for mutual support',
      },
      {
        community_id: 2,
        name: 'Housing Advice',
        category: 'Housing Advice',
        description: 'Tenant rights and assistance',
      },
    ]

    const mockPosts = [
      {
        post_id: 101,
        community_id: 1,
        user_id: 2,
        content: 'Community pantry is open!',
        created_at: '2026-08-25T10:00:00Z',
        user: { first_name: 'Elena', last_name: 'R.', avatar_url: '' },
      },
    ]

    globalThis.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/communities') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ communities: mockCommunities }),
        })
      }
      if (url.includes('/api/communities/1/posts')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ posts: mockPosts }),
        })
      }
      if (url.includes('/api/communities/1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCommunities[0]),
        })
      }
      return Promise.reject(new Error('not found'))
    })

    render(
      <BrowserRouter>
        <CommunityPage />
      </BrowserRouter>
    )

    // Check sidebar channels header
    expect(screen.getByText(/COMMUNITY CHANNELS/i)).toBeInTheDocument()

    // Wait for channel name to load
    await waitFor(() => {
      expect(screen.getByText('General Support')).toBeInTheDocument()
    })

    // Check message content
    await waitFor(() => {
      expect(screen.getByText('Community pantry is open!')).toBeInTheDocument()
    })
  })
})
