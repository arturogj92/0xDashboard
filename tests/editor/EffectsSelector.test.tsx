import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import EffectsSelector from '../../components/editor/EffectsSelector'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('EffectsSelector', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('toggles badge option', () => {
    const onUpdate = vi.fn()
    const { getAllByRole } = render(
      <EffectsSelector currentConfig={{ showBadge: true, typewriterEffect: true }} onConfigUpdate={onUpdate} onConfigSave={vi.fn()} />
    )

    const checkboxes = getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    expect(onUpdate).toHaveBeenCalledWith({ effects: { showBadge: false, typewriterEffect: true } })
  })
})
