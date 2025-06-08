import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import LinkImageStyleSelector from '../../components/editor/LinkImageStyleSelector'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('LinkImageStyleSelector', () => {
  it('calls onChange when selecting a style', () => {
    const onChange = vi.fn()
    const { getAllByRole } = render(
      <LinkImageStyleSelector value={{ style: 'rectangle' }} onChange={onChange} />
    )
    fireEvent.click(getAllByRole('button')[0])
    expect(onChange).toHaveBeenCalledWith({ style: 'rectangle' })
  })
})
