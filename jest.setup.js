import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'loading',
  }),
  signOut: jest.fn(),
  signIn: jest.fn(),
  getSession: jest.fn(),
}))

// Global test setup
global.fetch = jest.fn()