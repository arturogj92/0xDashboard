import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypewriter } from '../hooks/useTypewriter'

describe('useTypewriter', () => {
  it('types the text over time with delay', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useTypewriter({ text: 'hi', speed: 50, delay: 100 }))

    expect(result.current.displayText).toBe('')
    expect(result.current.isComplete).toBe(false)

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.displayText).toBe('')

    act(() => {
      vi.advanceTimersByTime(50)
    })
    // still empty after first tick
    expect(result.current.displayText).toBe('')

    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current.displayText).toBe('h')

    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current.displayText).toBe('hi')
    expect(result.current.isComplete).toBe(false)

    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current.isComplete).toBe(true)
    vi.useRealTimers()
  })

  it('resets when text changes', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ text }) => useTypewriter({ text, speed: 10 }), {
      initialProps: { text: 'ok' }
    })

    act(() => {
      vi.runAllTimers()
    })
    expect(result.current.displayText).toBe('ok')

    rerender({ text: 'bye' })

    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(result.current.displayText).toBe('')

    act(() => {
      vi.runAllTimers()
    })
    expect(result.current.displayText).toBe('bye')
    expect(result.current.isComplete).toBe(true)
    vi.useRealTimers()
  })
})
