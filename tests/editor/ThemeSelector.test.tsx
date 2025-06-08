import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import ThemeSelector from '../../components/editor/ThemeSelector'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('ThemeSelector', () => {
  it('calls onThemeChange when clicking a theme', () => {
    const onThemeChange = vi.fn()
    const { getByRole, getAllByText } = render(
      <ThemeSelector onThemeChange={onThemeChange} />
    )

    // open modal
    fireEvent.click(getByRole('button'))

    fireEvent.click(getAllByText('Dark')[1])
    expect(onThemeChange).toHaveBeenCalled()
  })
})
