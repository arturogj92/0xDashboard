import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import BackgroundGradientSelector from '../../components/editor/BackgroundGradientSelector'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('BackgroundGradientSelector', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('changes colors on input', () => {
    const onChange = vi.fn()
    const { getAllByRole } = render(
      <BackgroundGradientSelector value={{ color1: '#000', color2: '#fff' }} onChange={onChange} onSave={vi.fn()} />
    )

    const inputs = getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: '#111111' } })

    expect(onChange).toHaveBeenCalledWith({ color1: '#111111', color2: '#fff' })
  })
})
