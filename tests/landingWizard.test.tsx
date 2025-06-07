import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

  it('renders LandingWizard component', () => {
    localStorage.setItem('token', 'token123')
    
    render(<LandingWizard />)

    const slugInput = screen.getByPlaceholderText('username')
    expect(slugInput).toBeTruthy()
    
    const titleInput = screen.getByPlaceholderText('My brand')
    expect(titleInput).toBeTruthy()
    
    const descInput = screen.getByPlaceholderText('Small description')
    expect(descInput).toBeTruthy()
  })

  it('allows input changes', () => {
    localStorage.setItem('token', 'abc')
    
    render(<LandingWizard />)

    const titleInput = screen.getByPlaceholderText('My brand') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'My Landing' } })
    expect(titleInput.value).toBe('My Landing')

    const descInput = screen.getByPlaceholderText('Small description') as HTMLInputElement
    fireEvent.change(descInput, { target: { value: 'Desc' } })
    expect(descInput.value).toBe('Desc')

    const slugInput = screen.getByPlaceholderText('username') as HTMLInputElement
    fireEvent.change(slugInput, { target: { value: 'myslug' } })
    expect(slugInput.value).toBe('myslug')
  })
})
