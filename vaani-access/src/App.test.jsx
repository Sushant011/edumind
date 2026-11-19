// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { fallbackSchemes } from './lib/fallbackSchemes.js'
import { fetchSchemes } from './lib/insforge.js'
import App from './App.jsx'

vi.mock('./lib/insforge.js', () => ({
  fetchSchemes: vi.fn(),
  getScheme: vi.fn(),
  checkHealth: vi.fn(),
  backendInfo: { baseUrl: 'http://test.local', configured: true },
}))

beforeEach(() => {
  vi.clearAllMocks()
  fetchSchemes.mockResolvedValue(fallbackSchemes)
})

afterEach(() => cleanup())

describe('App', () => {
  it('renders the hero heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /बोलो/ })).not.toBeNull()
  })

  it('loads and shows all 33 scheme cards', async () => {
    render(<App />)
    const cards = await screen.findAllByText('विवरण →', {}, { timeout: 3000 })
    expect(cards).toHaveLength(33)
  })

  it('filters schemes by category', async () => {
    render(<App />)
    await screen.findAllByText('विवरण →', {}, { timeout: 3000 })
    fireEvent.click(screen.getByRole('button', { name: 'किसान (4)' }))
    expect(screen.queryAllByText('विवरण →')).toHaveLength(4)
  })

  it('filters by the new ration category', async () => {
    render(<App />)
    await screen.findAllByText('विवरण →', {}, { timeout: 3000 })
    fireEvent.click(screen.getByRole('button', { name: 'राशन (2)' }))
    expect(screen.queryAllByText('विवरण →')).toHaveLength(2)
  })

  it('searches schemes by keyword', async () => {
    render(<App />)
    await screen.findAllByText('विवरण →', {}, { timeout: 3000 })
    fireEvent.change(screen.getByLabelText('योजना खोजें'), { target: { value: 'गैस' } })
    expect(screen.queryAllByText('विवरण →')).toHaveLength(2)
    expect(screen.getByText('प्रधानमंत्री उज्ज्वला योजना')).not.toBeNull()
    expect(screen.getByText('पीएम आवास योजना (ग्रामीण)')).not.toBeNull()
  })

  it('runs the full pipeline from a demo sentence', async () => {
    render(<App />)
    await screen.findAllByText('विवरण →', {}, { timeout: 3000 })
    fireEvent.click(screen.getByRole('button', { name: /Main college student hoon/ }))
    const whyBoxes = await screen.findAllByText('💡 यह योजना क्यों?', {}, { timeout: 4000 })
    expect(whyBoxes.length).toBeGreaterThanOrEqual(1)
    expect(await screen.findByText('🎯 विद्यार्थी', {}, { timeout: 4000 })).not.toBeNull()
  })

  it('falls back to the offline snapshot when the backend fails', async () => {
    fetchSchemes.mockRejectedValueOnce(new Error('down'))
    render(<App />)
    expect(await screen.findByText(/InsForge सर्वर से जुड़ नहीं पाया/, {}, { timeout: 3000 })).not.toBeNull()
    expect(await screen.findAllByText('विवरण →', {}, { timeout: 3000 })).toHaveLength(33)
  })

  it('opens scheme details in a dialog and closes on Escape', async () => {
    render(<App />)
    const buttons = await screen.findAllByText('विवरण →', {}, { timeout: 3000 })
    fireEvent.click(buttons[0])
    expect(await screen.findByRole('dialog', {}, { timeout: 3000 })).not.toBeNull()
    expect(screen.getByText('👣 आवेदन के कदम')).not.toBeNull()
    fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('traps Tab focus inside the dialog', async () => {
    render(<App />)
    const buttons = await screen.findAllByText('विवरण →', {}, { timeout: 3000 })
    fireEvent.click(buttons[0])
    const dialog = await screen.findByRole('dialog', {}, { timeout: 3000 })
    const items = dialog.querySelectorAll('a[href], button:not([disabled])')
    expect(items.length).toBeGreaterThan(1)
    items[items.length - 1].focus()
    fireEvent.keyDown(dialog, { key: 'Tab', code: 'Tab' })
    expect(document.activeElement).toBe(items[0])
    items[0].focus()
    fireEvent.keyDown(dialog, { key: 'Tab', code: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(items[items.length - 1])
  })

  it('toggles big-text mode and sound', async () => {
    render(<App />)
    await screen.findAllByText('विवरण →', {}, { timeout: 3000 })
    const bigBtn = screen.getByRole('button', { name: 'बड़े अक्षर मोड' })
    expect(document.body.classList.contains('big-text')).toBe(false)
    fireEvent.click(bigBtn)
    expect(document.body.classList.contains('big-text')).toBe(true)
    fireEvent.click(bigBtn)
    expect(document.body.classList.contains('big-text')).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'आवाज़ बंद करें' }))
    expect(screen.getByRole('button', { name: 'आवाज़ चालू करें' })).not.toBeNull()
  })

  it('shows recent questions for one-click re-run', async () => {
    render(<App />)
    await screen.findAllByText('विवरण →', {}, { timeout: 3000 })
    fireEvent.click(screen.getByRole('button', { name: /Main college student hoon/ }))
    expect(await screen.findByText('🕘 हाल के सवाल', {}, { timeout: 4000 })).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Main college student hoon, fees ke liye scholarship chahiye' }))
    const whyBoxes = await screen.findAllByText('💡 यह योजना क्यों?', {}, { timeout: 4000 })
    expect(whyBoxes.length).toBeGreaterThanOrEqual(1)
  })
})
