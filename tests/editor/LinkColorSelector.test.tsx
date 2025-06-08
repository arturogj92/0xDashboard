import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import LinkColorSelector from '../../components/editor/LinkColorSelector'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('LinkColorSelector', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })
  it('updates background color', () => {
    const onChange = vi.fn()
    const onSave = vi.fn()
    const { getAllByRole } = render(
      <LinkColorSelector value={{ background:'#000000', text:'#ffffff' }} onChange={onChange} onSave={onSave} />
    )
    fireEvent.change(getAllByRole('textbox')[0], { target: { value: '#111111' } })
    expect(onChange).toHaveBeenCalledWith({ background:'#111111', text:'#ffffff', backgroundOpacity:1 })
  })
})
