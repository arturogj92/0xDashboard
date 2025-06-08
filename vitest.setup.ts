
import React from 'react'
import { configure } from '@testing-library/react'
import { beforeAll, afterAll } from 'vitest'

// Make React available globally for components using the automatic runtime
(globalThis as any).React = React

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