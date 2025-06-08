import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import FontFamilySelector from '../../components/editor/FontFamilySelector'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('FontFamilySelector', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('selects a different font', () => {
    const onChange = vi.fn()
    const { getAllByRole } = render(
      <FontFamilySelector value={{ family: 'Inter', url: '' }} onChange={onChange} onSave={vi.fn()} />
    )

    const buttons = getAllByRole('button')
    fireEvent.click(buttons[1])

    expect(onChange).toHaveBeenCalled()
  })
})
