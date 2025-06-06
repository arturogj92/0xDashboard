import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import LandingWizard from '../components/landing/LandingWizard'

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock })
}))

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return React.createElement('img', props)
  }
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      slugPlaceholder: 'username',
      namePlaceholder: 'My brand',
      descriptionPlaceholder: 'Small description',
      slugFree: 'Subdomain is available',
      continue: 'Continue',
      slugLabel: 'Page address',
      titleLabel: 'Name',
      descriptionLabel: 'Description',
      slugPreview: 'Your page will be at',
      stepConfigure: 'step1',
      stepLinks: 'step2',
      stepSocial: 'step3',
      stepStats: 'step4',
      nameHelper: '',
      descriptionHelper: '',
      introExplanation: ''
    }
    return map[key] || key
  }
}))

describe('LandingWizard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    pushMock.mockReset()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('checks slug availability on change', async () => {
    localStorage.setItem('token', 'token123')
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      json: vi.fn().mockResolvedValue({ available: true })
    } as any)

    render(<LandingWizard />)

    const slugInput = screen.getByPlaceholderText('username')
    fireEvent.change(slugInput, { target: { value: 'testslug' } })

    await act(() => {
      vi.advanceTimersByTime(401)
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/landings/slug-exists?slug=testslug'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token123'
        })
      })
    )
  })

  it('creates landing and navigates to editor', async () => {
    localStorage.setItem('token', 'abc')
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() =>
        Promise.resolve({ json: () => Promise.resolve({ available: true }) } as any)
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { id: 5 } })
        } as any)
      )

    render(<LandingWizard />)

    fireEvent.change(screen.getByPlaceholderText('My brand'), {
      target: { value: 'My Landing' }
    })
    fireEvent.change(screen.getByPlaceholderText('Small description'), {
      target: { value: 'Desc' }
    })
    fireEvent.change(screen.getByPlaceholderText('username'), {
      target: { value: 'myslug' }
    })

    await act(() => {
      vi.advanceTimersByTime(401)
    })

    await act(() => {
      fireEvent.click(screen.getByText('Continue'))
    })

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/api/landings'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'My Landing',
          description: 'Desc',
          slug: 'myslug'
        })
      })
    )
    expect(pushMock).toHaveBeenCalledWith('/editor/5')
  })
})
