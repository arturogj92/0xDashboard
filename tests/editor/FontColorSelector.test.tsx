import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import FontColorSelector from '../../components/editor/FontColorSelector'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('FontColorSelector', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('updates primary color and saves', async () => {
    const onChange = vi.fn()
    const onSave = vi.fn()
    const { getAllByRole } = render(
      <FontColorSelector value={{ primary: '#000000', secondary: '#ffffff' }} onChange={onChange} onSave={onSave} />
    )

    const inputs = getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '#123456' } })

    expect(onChange).toHaveBeenCalledWith({ primary: '#123456', secondary: '#ffffff' })

    vi.advanceTimersByTime(1200)
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ primary: '#123456', secondary: '#ffffff' })
    })
  })
})
