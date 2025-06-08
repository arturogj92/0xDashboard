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

  it('calls onChange and onSave when toggling options', async () => {
    const onChange = vi.fn()
    const onSave = vi.fn()
    const { getAllByRole } = render(
      <AvatarDisplaySelector value={{ showAvatar: true }} onChange={onChange} onSave={onSave} />
    )

    const options = getAllByRole('button')
    fireEvent.click(options[1])

    expect(onChange).toHaveBeenCalledWith({ showAvatar: false })

    vi.advanceTimersByTime(600)
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ showAvatar: false })
    })
  })
})
