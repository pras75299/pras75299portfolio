// API configuration for different environments
const getApiBaseUrl = () => {
  // Always use the production backend URL to avoid local Vite proxy ENOTFOUND issues
  // The backend on Vercel is configured to allow CORS for http://localhost:5173
  return 'https://pras75299portfolio.vercel.app';
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
