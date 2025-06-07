import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerUser, loginUser, loginWithGoogle, updatePreference } from '../lib/api'

const creds = { email: 'a@test.com', password: 'pass', username: 'user' }

describe('auth api', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('registerUser saves token on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true, data: { token: 'tok', user: {} } })
    })
    vi.spyOn(global, 'fetch').mockImplementation(fetchMock as any)

    const res = await registerUser(creds)
    expect(res).toEqual({ success: true, data: { token: 'tok', user: {} } })
    expect(localStorage.getItem('token')).toBe('tok')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/register'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('loginUser returns error on failed response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: vi.fn().mockResolvedValue({ success: false, message: 'bad' })
    } as any)

    const res = await loginUser({ email: 'a@test.com', password: 'x' })
    expect(res.success).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
    expect(res.message).toBe('bad')
  })

  it('loginWithGoogle stores token when successful', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true, data: { token: 'g123', user: {} } })
    })
    vi.spyOn(global, 'fetch').mockImplementation(fetchMock as any)

    const res = await loginWithGoogle('idtoken')
    expect(res.success).toBe(true)
    expect(localStorage.getItem('token')).toBe('g123')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/google/callback'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('updatePreference returns false on non-ok response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    vi.spyOn(global, 'fetch').mockImplementation(fetchMock as any)

    const res = await updatePreference('theme', 'dark')
    expect(res).toBe(false)
    expect(fetchMock).toHaveBeenCalled()
  })
})
