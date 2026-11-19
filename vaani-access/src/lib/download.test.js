// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { downloadChecklist } from './matcher.js'
import { fallbackSchemes } from './fallbackSchemes.js'

describe('downloadChecklist', () => {
  it('generates a checklist .txt download named by slug', () => {
    URL.createObjectURL = vi.fn(() => 'blob:fake')
    URL.revokeObjectURL = vi.fn()
    const seen = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      seen.push([this.download, this.href])
    })
    downloadChecklist(fallbackSchemes[0])
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    const blob = URL.createObjectURL.mock.calls[0][0]
    expect(blob.type).toContain('text/plain')
    expect(seen).toHaveLength(1)
    expect(seen[0][0]).toBe('checklist-pm-kisan.txt')
    expect(seen[0][1]).toBe('blob:fake')
  })

  it('includes eligibility, documents, steps and official link', async () => {
    URL.createObjectURL = vi.fn((b) => b)
    URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    downloadChecklist(fallbackSchemes[3])
    const blob = URL.createObjectURL.mock.calls[0][0]
    const text = await blob.text()
    expect(text).toContain('नेशनल स्कॉलरशिप')
    expect(text).toContain('पात्रता:')
    expect(text).toContain('कागज़:')
    expect(text).toContain('3 आसान कदम:')
    expect(text).toContain('https://scholarships.gov.in/')
  })
})
