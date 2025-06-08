import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MobileEditorNavigation } from '../../components/editor/MobileEditorNavigation'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('MobileEditorNavigation', () => {
  it('invokes onSectionChange when item clicked', () => {
    const onSectionChange = vi.fn()
    const { getAllByRole } = render(
      <MobileEditorNavigation activeSection="style" onSectionChange={onSectionChange} />
    )
    fireEvent.click(getAllByRole('button')[1])
    expect(onSectionChange).toHaveBeenCalled()
  })
})
