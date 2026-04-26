const getApiBaseUrl = () => {
  const isProduction =
    import.meta.env.PROD || import.meta.env.MODE === "production";

  if (isProduction) {
    return "https://pras75299portfolio.vercel.app";
  }

  return "";
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = {
  projects: `${API_BASE_URL}/api/projects`,
  skills: `${API_BASE_URL}/api/skills`,
  experiences: `${API_BASE_URL}/api/experiences`,
  chat: `${API_BASE_URL}/api/chat`,
};
