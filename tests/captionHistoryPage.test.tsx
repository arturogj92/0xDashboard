import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
const getCaptionHistoryMock = vi.fn()
vi.mock('@/lib/api', () => ({
  getCaptionHistory: (...args: any) => getCaptionHistoryMock(...args)
}))

import CaptionHistoryPage from '../app/caption-generator/history/page'

vi.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: any) => <>{children}</>
}))

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => React.createElement('img', props)
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: (props: any) => <div {...props} />,
  ImageSkeleton: (props: any) => <div {...props} />
}))

describe('CaptionHistoryPage', () => {
  beforeEach(() => {
    getCaptionHistoryMock.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders twitter thread and copy all button when xText array', async () => {
    getCaptionHistoryMock.mockResolvedValue({
      success: true,
      data: [
        { id: 1, instagramText: '', youtubeText: '', xText: ['tweet1','tweet2'], createdAt: '2025-06-06T10:17:41.824Z' }
      ]
    })

    render(<CaptionHistoryPage />)

    await waitFor(() => expect(screen.getByText('tweet1')).toBeTruthy())
    expect(screen.getByText('tweet2')).toBeTruthy()
    expect(screen.getByText('copyAllButton')).toBeTruthy()
  })

  it('renders single tweet when xText is string', async () => {
    getCaptionHistoryMock.mockResolvedValue({
      success: true,
      data: [
        { id: 2, instagramText: '', youtubeText: '', xText: 'hello tweet', createdAt: '2025-06-06T10:17:41.824Z' }
      ]
    })

    render(<CaptionHistoryPage />)

    await waitFor(() => expect(screen.getByText('hello tweet')).toBeTruthy())
    expect(screen.queryByText('copyAllButton')).toBeNull()
  })
})
