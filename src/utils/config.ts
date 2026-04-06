import { companyConfig } from '../config/company.config';

export interface SystemConfig {
  name: string;
  description: string;
  websiteUrl: string;
  logoUrl: string;
  faviconUrl: string;
  address: string;
  phone: string;
  email: string;
  servicesUrl: string;
  social: {
    linkedinUrl: string;
    instagramUrl: string;
    githubUrl: string;
    youtubeUrl: string;
    linkedinIconUrl: string;
    instagramIconUrl: string;
    githubIconUrl: string;
    youtubeIconUrl: string;
  };
}

export async function getSystemConfig(): Promise<SystemConfig> {
  const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080';
  
  try {
    const response = await fetch(`${API_URL}/system-config`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('No se pudo obtener la configuración del sistema');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('⚠️ Error conectando con la API para configuración. Usando fallback estático.');
    
    // Devolver esquema compatible basado en companyConfig
    return {
      name: companyConfig.name,
      description: companyConfig.description,
      websiteUrl: companyConfig.websiteUrl,
      logoUrl: companyConfig.logoUrl,
      faviconUrl: companyConfig.logoUrl, // Fallback al logo si no hay favicon específico
      address: companyConfig.address,
      phone: companyConfig.phone,
      email: companyConfig.email,
      servicesUrl: companyConfig.servicesUrl,
      social: { ...companyConfig.social }
    } as SystemConfig;
  }
}
