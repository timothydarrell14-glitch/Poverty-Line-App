import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
  it('renders the Get Help page with main sections', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(screen.getByRole('heading', { name: /Talk to Someone/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Job Opportunities/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Community Forum/i })).toBeInTheDocument()
  })
})