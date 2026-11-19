import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

function mockFetchOnce(body, { ok = true, status = 200 } = {}) {
  globalThis.fetch = vi.fn(async () => ({
    ok,
    status,
    json: async () => body,
  }))
}

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('VITE_INSFORGE_URL', 'http://test.local')
  vi.stubEnv('VITE_INSFORGE_ANON_KEY', 'test-anon-key')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('fetchSchemes', () => {
  it('requests active schemes ordered by creation', async () => {
    mockFetchOnce([{ id: '1' }])
    const mod = await import('./insforge.js')
    expect(await mod.fetchSchemes()).toEqual([{ id: '1' }])
    const [url, opts] = globalThis.fetch.mock.calls[0]
    expect(url).toContain('/api/database/records/schemes')
    expect(url).toContain('active=eq.true')
    expect(opts.headers.Authorization).toBe('Bearer test-anon-key')
  })

  it('throws a readable error when the backend fails', async () => {
    mockFetchOnce({ message: 'boom' }, { ok: false, status: 500 })
    const mod = await import('./insforge.js')
    await expect(mod.fetchSchemes()).rejects.toThrow('boom')
  })

  it('throws when InsForge is not configured', async () => {
    vi.stubEnv('VITE_INSFORGE_URL', '')
    const mod = await import('./insforge.js')
    await expect(mod.fetchSchemes()).rejects.toThrow('not configured')
  })
})

describe('getScheme', () => {
  it('returns the single matching row', async () => {
    mockFetchOnce([{ id: 'abc' }])
    const mod = await import('./insforge.js')
    expect(await mod.getScheme('abc')).toEqual({ id: 'abc' })
    expect(globalThis.fetch.mock.calls[0][0]).toContain('id=eq.abc')
  })

  it('returns null when nothing matches', async () => {
    mockFetchOnce([])
    const mod = await import('./insforge.js')
    expect(await mod.getScheme('nope')).toBeNull()
  })
})

describe('checkHealth', () => {
  it('reports ok when the backend answers', async () => {
    mockFetchOnce([{ id: '1' }])
    const mod = await import('./insforge.js')
    expect(await mod.checkHealth()).toEqual({ ok: true, message: 'Connected' })
  })

  it('reports failure with the backend message', async () => {
    mockFetchOnce({ message: 'down' }, { ok: false, status: 503 })
    const mod = await import('./insforge.js')
    const res = await mod.checkHealth()
    expect(res.ok).toBe(false)
    expect(res.message).toBe('down')
  })

  it('reports unconfigured without calling the network', async () => {
    vi.stubEnv('VITE_INSFORGE_ANON_KEY', '')
    mockFetchOnce([])
    const mod = await import('./insforge.js')
    const res = await mod.checkHealth()
    expect(res).toEqual({ ok: false, message: 'InsForge keys missing' })
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})
