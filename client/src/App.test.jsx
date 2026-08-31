import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('Admin routes', () => {
  beforeEach(() => {
    localStorage.clear()
    globalThis.fetch = vi.fn((url) => Promise.resolve({ ok: true, json: async () => url.includes('/me') ? { user: { id: 1, name: 'Timothy Darrell', email: 'admin@example.test', role: 'admin' } } : { programs: [], users: [] } }))
  })

  it('denies unauthenticated visitors', () => {
    globalThis.fetch = vi.fn()
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Admin access required' })).toBeInTheDocument()
  })

  it('renders the dashboard for an administrator', async () => {
    localStorage.setItem('accessToken', 'test-token')
    render(<MemoryRouter initialEntries={['/admin']}><App /></MemoryRouter>)
    expect(await screen.findByRole('heading', { name: 'Timothy Darrell' })).toBeInTheDocument()
  })

  it('renders the programs page', async () => {
    localStorage.setItem('accessToken', 'test-token')
    render(
      <MemoryRouter initialEntries={['/admin/programs']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Program Overview' })).toBeInTheDocument()
  })

  it.each([
    ['/admin/chats', 'Messages'],
    ['/admin/deliveries', 'Deliveries'],
  ])('renders %s', async (route, heading) => {
    localStorage.setItem('accessToken', 'test-token')
    render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
  })

  it('switches the active chat conversation', async () => {
    localStorage.setItem('accessToken', 'test-token')
    render(
      <MemoryRouter initialEntries={['/admin/chats']}>
        <App />
      </MemoryRouter>,
    )

    const mercyConversation = await screen.findByRole('button', { name: /Mercy Corps/ })
    fireEvent.click(mercyConversation)

    expect(mercyConversation).toHaveAttribute('aria-pressed', 'true')
  })
})
