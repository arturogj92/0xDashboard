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

  it('updates slider value on interaction', () => {
    const onChange = vi.fn()
    const { getByRole } = render(
      <BorderRadiusSelector value="rounded-none" onChange={onChange} onSave={vi.fn()} />
    )

    const slider = getByRole('slider')
    fireEvent.change(slider, { target: { value: '10' } })
    fireEvent.mouseUp(slider)

    expect(onChange).toHaveBeenCalledWith('rounded-[10px]')
  })
})
