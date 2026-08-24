import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the application', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Dignity Through Efficiency' })).toBeInTheDocument()
  })
})