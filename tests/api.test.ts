import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createAuthHeaders, getReel, getGlobalMediaStats } from '../lib/api'

describe('createAuthHeaders', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('returns headers with Authorization when token exists', () => {
    localStorage.setItem('token', 'abc')
    const headers = createAuthHeaders()
    expect(headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer abc'
    })
  })

  it('returns headers without Authorization when no token', () => {
    const headers = createAuthHeaders()
    expect(headers).toEqual({ 'Content-Type': 'application/json' })
  })

  it('handles localStorage errors gracefully', () => {
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('fail')
    })
    const headers = createAuthHeaders()
    expect(headers).toEqual({ 'Content-Type': 'application/json' })
  })
})

describe('API functions', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('getReel returns typed data for stories', async () => {
    const mockData = { success: true, data: { id: 1, media_type: 'story' } }
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockData)
    } as any)

    const res = await getReel(1)
    expect(res).toEqual(mockData)
    expect(fetch).toHaveBeenCalled()
  })

  it('getReel includes status code on failure', async () => {
    const mockData = { success: false, data: null }
    vi.spyOn(global, 'fetch').mockResolvedValue({
      status: 404,
      json: vi.fn().mockResolvedValue(mockData)
    } as any)

    const res = await getReel(1)
    expect(res).toEqual({ ...mockData, statusCode: 404 })
  })

  it('getGlobalMediaStats posts timezone and type', async () => {
    const mockRes = { success: true }
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue({ json: vi.fn().mockResolvedValue(mockRes) } as any)
    await getGlobalMediaStats('Europe/Madrid', 'reel')
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/media/stats/global'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ timezone: 'Europe/Madrid', media_type: 'reel' })
      })
    )
  })
})
