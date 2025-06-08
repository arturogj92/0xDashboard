import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import AvatarDisplaySelector from '../../components/editor/AvatarDisplaySelector'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('AvatarDisplaySelector', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls onChange when toggling options', () => {
    const onChange = vi.fn()
    const { getByText } = render(
      <AvatarDisplaySelector value={{ showAvatar: true }} onChange={onChange} onSave={vi.fn()} />
    )

    fireEvent.click(getByText('nameOnly.title'))

    expect(onChange).toHaveBeenCalledWith({ showAvatar: false })
  })
})
