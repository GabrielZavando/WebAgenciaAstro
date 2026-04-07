import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// Forzar hoisting manual y nombres que empiecen con 'mock' para Vitest
const mockOnIdTokenChangedFn = vi.fn()

vi.mock('firebase/auth', async (importActual) => {
  const actual = await importActual<typeof import('firebase/auth')>()
  return {
    ...actual,
    onIdTokenChanged: (auth: any, cb: any) => {
      mockOnIdTokenChangedFn(auth, cb)
      return vi.fn() // Unsubscribe function
    },
    getAuth: vi.fn(() => ({ name: 'mock-auth' })),
  }
})

vi.mock('../lib/firebase/client', () => ({
  auth: { name: 'mock-auth' },
}))

describe('Auth Store (Nanostores)', () => {
  let userAtom: any
  let loadingAtom: any

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    const mod = await import('./authStore')
    userAtom = mod.$user
    loadingAtom = mod.$loading
    
    userAtom.set(null)
    loadingAtom.set(true)
  })

  it('debe registrar el listener de Firebase', () => {
    expect(mockOnIdTokenChangedFn).toHaveBeenCalled()
  })

  it('debe manejar el login correctamente', async () => {
    // Si se llamó, el segundo argumento es el callback
    const callback = mockOnIdTokenChangedFn.mock.calls[0][1]
    
    await callback({
      uid: '123',
      email: 'test@test.com',
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: { role: 'admin' } })
    })

    expect(userAtom.get()?.uid).toBe('123')
    expect(userAtom.get()?.role).toBe('admin')
  })
})
