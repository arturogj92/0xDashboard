import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import BorderRadiusSelector from '../../components/editor/BorderRadiusSelector'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('BorderRadiusSelector', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('updates slider value and calls onSave after interaction', async () => {
    const onChange = vi.fn()
    const onSave = vi.fn()
    const { getByRole } = render(
      <BorderRadiusSelector value="rounded-none" onChange={onChange} onSave={onSave} />
    )

    const slider = getByRole('slider')
    fireEvent.change(slider, { target: { value: '10' } })
    fireEvent.mouseUp(slider)

    expect(onChange).toHaveBeenCalledWith('rounded-[10px]')

    vi.advanceTimersByTime(1200)
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('rounded-[10px]')
    })
  })
})
