import { describe, it, expect } from 'vitest'
import { cn, getShortenedUrl } from '../lib/utils'

describe('getShortenedUrl', () => {
  it('returns empty string for falsy input', () => {
    expect(getShortenedUrl('')).toBe('')
  })

  it('removes protocol and www', () => {
    expect(getShortenedUrl('https://www.example.com/path')).toBe('example.com/path')
  })

  it('truncates long URLs', () => {
    const input = 'https://www.example.com/this/is/a/very/long/path/that/exceeds/25'
    expect(getShortenedUrl(input)).toBe('example.com/this/is/a/...')
  })
})

describe('cn', () => {
  it('concatenates classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('deduplicates tailwind classes', () => {
    // twMerge should merge duplicates like "px-2" and "px-4" -> "px-4"
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
