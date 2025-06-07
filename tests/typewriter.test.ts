import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTypewriter } from '../hooks/useTypewriter'

describe('useTypewriter', () => {
  it('initializes with empty text', () => {
    const { result } = renderHook(() => useTypewriter({ text: 'hello', speed: 50 }))

    expect(result.current.displayText).toBe('')
    expect(result.current.isComplete).toBe(false)
  })

  it('handles text prop correctly', () => {
    const { result, rerender } = renderHook(({ text }) => useTypewriter({ text, speed: 10 }), {
      initialProps: { text: 'hello' }
    })

    expect(result.current.displayText).toBe('')

    rerender({ text: 'world' })

    expect(result.current.displayText).toBe('')
    expect(result.current.isComplete).toBe(false)
  })
})
