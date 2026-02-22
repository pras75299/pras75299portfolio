// API configuration for different environments
const getApiBaseUrl = () => {
  const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

  if (isProduction) {
    // Backend URL - explicitly set for production
    return 'https://pras75299portfolio.vercel.app';
  }

  // Development - use proxy (Vite will proxy /api/* to localhost:8080)
  return '';
};

const API_BASE_URL = getApiBaseUrl();

// Log the API base URL for debugging
console.log('🔧 API Configuration:', {
  isProduction: import.meta.env.PROD,
  baseUrl: API_BASE_URL,
  environment: import.meta.env.MODE
});

export const apiClient = {
  projects: `${API_BASE_URL}/api/projects`,
  skills: `${API_BASE_URL}/api/skills`,
  experiences: `${API_BASE_URL}/api/experiences`,
  chat: `${API_BASE_URL}/api/chat`,
};

// Debug function to log API URLs
export const logApiUrls = () => {
  console.log('API URLs:', {
    environment: import.meta.env.PROD ? 'production' : 'development',
    baseUrl: API_BASE_URL,
    endpoints: apiClient
  });
};
