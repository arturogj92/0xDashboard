import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createReel } from '../lib/api'

const data = { url: 'https://insta.com/r/123', description: 'desc', is_active: true, media_type: 'reel' }

describe('createReel draft behaviour', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    localStorage.setItem('token', 'tok')
  })

  it('sends is_draft false by default', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({ success: true }) })
    vi.spyOn(global, 'fetch').mockImplementation(fetchMock as any)

    await createReel(data)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/reels'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ ...data, is_draft: false })
      })
    )
  })

  it('sends is_draft true when draft flag passed', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({ success: true }) })
    vi.spyOn(global, 'fetch').mockImplementation(fetchMock as any)

    await createReel(data, true)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/reels'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ ...data, is_draft: true })
      })
    )
  })
})
