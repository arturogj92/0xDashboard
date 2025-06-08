import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import TitleStyleSelector from '../../components/editor/TitleStyleSelector'

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }))

describe('TitleStyleSelector', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })
  it('updates style when selecting preset', () => {
    const onChange = vi.fn()
    const onSave = vi.fn()
    const { getByText } = render(
      <TitleStyleSelector value={{ fontSize:'text-sm', fontWeight:'normal', gradient:null }} onChange={onChange} onSave={onSave} />
    )
    fireEvent.click(getByText('Apple Blue'))
    expect(onChange).toHaveBeenCalled()
  })
})
