// API configuration for different environments
const getApiBaseUrl = () => {
  // Check if we're in production using import.meta.env (Vite's environment variable)
  if (import.meta.env.PROD) {
    // Use environment variable if set, otherwise default to same domain
    // For Vercel: Set VITE_API_BASE_URL in your Vercel project settings
    // If frontend and backend are on the same Vercel project, use empty string (same domain)
    // If they're separate, use the backend's full URL
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    
    if (apiUrl) {
      return apiUrl;
    }
    
    // Default: assume same domain (for monorepo deployments)
    // If backend is on a different domain, set VITE_API_BASE_URL in Vercel
    return '';
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
