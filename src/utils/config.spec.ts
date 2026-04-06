import { vi, describe, it, expect, beforeEach } from 'vitest'
import { getSystemConfig } from './config'
import { companyConfig } from '../config/company.config'

describe('Config Utils (Landing)', () => {
  beforeEach(() => {
    // Mock global fetch
    vi.stubGlobal('fetch', vi.fn())
    vi.clearAllMocks()
    
    // Mock import.meta.env
    // En vitest, podemos usar vi.stubEnv si es necesario, 
    // pero config.ts usa import.meta.env.PUBLIC_API_URL
  })

  it('debe obtener configuración desde la API correctamente', async () => {
    const mockData = {
      name: 'API Config',
      description: 'Desc from API',
      websiteUrl: 'https://api.test',
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.ico',
      address: 'Calle API 123',
      phone: '+569000000',
      email: 'api@test.com',
      servicesUrl: '/services',
      social: { ...companyConfig.social }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    })

    const result = await getSystemConfig()

    expect(fetch).toHaveBeenCalled()
    expect(result.name).toBe('API Config')
    expect(result.email).toBe('api@test.com')
  })

  it('debe usar fallback estático si la API responde con error', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ;(fetch as any).mockResolvedValue({
      ok: false
    })

    const result = await getSystemConfig()

    expect(result.name).toBe(companyConfig.name)
    expect(result.email).toBe(companyConfig.email)
  })

  it('debe usar fallback estático si hay error de red', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ;(fetch as any).mockRejectedValue(new Error('Network Error'))

    const result = await getSystemConfig()

    expect(result.name).toBe(companyConfig.name)
    expect(result.social).toEqual(companyConfig.social)
  })
})
