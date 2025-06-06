import { describe, it, expect, beforeEach, vi } from 'vitest'
import { uploadMedia, getMediaStatus, generateCaptions, getCaptionHistory } from '../lib/api'

const file = new File(['hi'], 'test.mp4', { type: 'video/mp4' })

describe('caption generator api', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('uploadMedia posts form data without content-type', async () => {
    localStorage.setItem('token', 'abc')
    const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({ success: true }) })
    vi.spyOn(global, 'fetch').mockImplementation(fetchMock as any)

    await uploadMedia(file)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/caption-generator/upload'),
      expect.objectContaining({ method: 'POST' })
    )
    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers['Authorization']).toBe('Bearer abc')
    expect(options.headers['Content-Type']).toBeUndefined()
    expect(options.body).toBeInstanceOf(FormData)
  })

  it('getMediaStatus fetches with auth headers', async () => {
    localStorage.setItem('token', 't123')
    const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({ success: true }) })
    vi.spyOn(global, 'fetch').mockImplementation(fetchMock as any)

    await getMediaStatus(5)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/caption-generator/5'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer t123' }) })
    )
  })

  it('generateCaptions posts options and platforms', async () => {
    localStorage.setItem('token', 't123')
    const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({ success: true }) })
    vi.spyOn(global, 'fetch').mockImplementation(fetchMock as any)

    const options = { includeEmojis: true, xEnabled: true }
    await generateCaptions(7, options)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/caption-generator/generate'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ mediaId: 7, options, platforms: ['instagram','youtube','x'] })
      })
    )
  })

  it('getCaptionHistory fetches with auth headers', async () => {
    localStorage.setItem('token', 'abc')
    const fetchMock = vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue({ success: true }) })
    vi.spyOn(global, 'fetch').mockImplementation(fetchMock as any)

    await getCaptionHistory()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/caption-generator/history'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer abc' }) })
    )
  })
})
