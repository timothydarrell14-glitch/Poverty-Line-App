import { render, screen } from '@testing-library/react'
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
})
