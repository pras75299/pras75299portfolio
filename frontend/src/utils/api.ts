// API configuration for different environments
const getApiBaseUrl = () => {
  // Check if we're in production using import.meta.env (Vite's environment variable)
  if (import.meta.env.PROD) {
    // Try different possible backend URLs
    const possibleUrls = [
      'https://pras75299portfolio.vercel.app/',  // Your Vercel backend
    ];
    
    // For now, return the first URL, but you should update this with your actual backend URL
    return possibleUrls[0];
  }
  
  // Development - use proxy
  return '';
};

const API_BASE_URL = getApiBaseUrl();

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
