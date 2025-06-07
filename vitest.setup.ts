import { configure } from '@testing-library/react'
import { beforeAll, afterAll } from 'vitest'

// Disable act() warnings in test environment
configure({ 
  asyncUtilTimeout: 10000,
  testIdAttribute: 'data-testid'
})

// Mock console.error to suppress act() warnings
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('act(...)') || args[0].includes('Warning: An update to'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})