// Lightweight InsForge REST client (no SDK — same backend API, tiny bundle).
// API: GET {baseUrl}/api/database/records/<table>?<postgrest params>
// Auth: Authorization: Bearer <anonKey> (publishable key; RLS enforces read-only)

const baseUrl = (import.meta.env.VITE_INSFORGE_URL || '').replace(/\/$/, '')
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY

export const backendInfo = {
  baseUrl,
  configured: Boolean(baseUrl && anonKey),
}

async function rest(path) {
  if (!backendInfo.configured) throw new Error('InsForge not configured')
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${anonKey}`, Accept: 'application/json' },
  })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = (body && (body.message || body.error)) || `Request failed (${res.status})`
    throw new Error(msg)
  }
  return body || []
}

/** GET /api/schemes — list active schemes */
export async function fetchSchemes() {
  return rest('/api/database/records/schemes?select=*&active=eq.true&order=created_at.asc')
}

/** GET /api/schemes/{id} */
export async function getScheme(id) {
  const rows = await rest(
    `/api/database/records/schemes?select=*&id=eq.${encodeURIComponent(id)}&limit=1`
  )
  return (rows && rows[0]) || null
}

/** GET /api/health */
export async function checkHealth() {
  if (!backendInfo.configured) return { ok: false, message: 'InsForge keys missing' }
  try {
    await rest('/api/database/records/schemes?select=id&limit=1')
    return { ok: true, message: 'Connected' }
  } catch (e) {
    return { ok: false, message: e.message }
  }
}
