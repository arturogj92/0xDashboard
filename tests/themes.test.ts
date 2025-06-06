import { describe, it, expect } from 'vitest'
import { themes, getThemeById, getDefaultTheme, generateThemeCSS } from '../lib/themes'

// Basic tests for theme utilities

describe('theme utilities', () => {
  it('returns a theme by id', () => {
    const theme = getThemeById('dark')
    expect(theme).toBeDefined()
    expect(theme?.id).toBe('dark')
  })

  it('returns undefined for unknown id', () => {
    expect(getThemeById('non-existent')).toBeUndefined()
  })

  it('getDefaultTheme returns the first theme', () => {
    expect(getDefaultTheme()).toBe(themes[0])
  })

  it('generateThemeCSS outputs CSS variables', () => {
    const css = generateThemeCSS(themes[0])
    expect(css).toContain('--theme-font-family')
    expect(css).toContain(themes[0].typography.fontFamily)
  })
})
