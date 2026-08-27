import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
  it('renders the application', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Timothy Darrell' }),
    ).toBeInTheDocument()
  })

  it('renders the programs page at the sidebar programs route', () => {
    render(
      <MemoryRouter initialEntries={['/admin/programs']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Program Overview' }),
    ).toBeInTheDocument()
  })

  it.each([
    ['/admin/chats', 'Chats', 'Messages'],
    ['/admin/deliveries', 'Deliveries', 'Deliveries'],
  ])('shows and opens the %s preview', (route, feature, previewHeading) => {
    render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: `${feature} are coming soon` }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'See preview' }))

    expect(
      screen.getByRole('heading', { name: previewHeading }),
    ).toBeInTheDocument()
  })

  it('switches the active chat conversation', () => {
    render(
      <MemoryRouter initialEntries={['/admin/chats']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'See preview' }))
    const mercyConversation = screen.getByRole('button', { name: /Mercy Corps/ })
    fireEvent.click(mercyConversation)

    expect(mercyConversation).toHaveAttribute('aria-pressed', 'true')
  })
})
