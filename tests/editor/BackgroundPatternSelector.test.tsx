import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import BackgroundPatternSelector from '../../components/editor/BackgroundPatternSelector'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('BackgroundPatternSelector', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })
  it('selects a pattern option', () => {
    const onChange = vi.fn()
    const onSave = vi.fn()
    const { getByRole, getAllByRole } = render(
      <BackgroundPatternSelector
        value={{ pattern: 'none', color: '#000', opacity: 1 }}
        onChange={onChange}
        onSave={onSave}
      />
    )

    // open selector
    fireEvent.click(getByRole('button'))
    fireEvent.click(getAllByRole('button')[1])
    vi.runAllTimers()

    expect(onChange).toHaveBeenCalled()
  })
})
