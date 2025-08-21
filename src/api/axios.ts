import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.API_BASE_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('zikasha_crm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const { response } = error;

    if (
      response &&
      response.status === 401 &&
      response.data?.error_code === 'jwt_token_expired'
    ) {
      const refreshToken = localStorage.getItem('zikasha_crm_refresh_token');
      if (refreshToken && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const res = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );
          const newToken = res.data?.accessToken;
          if (newToken) {
            localStorage.setItem('zikasha_crm_token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Optionally handle refresh failure (e.g., logout user)
          localStorage.removeItem("zikasha_crm_token");
          localStorage.removeItem("zikasha_crm_refresh_token");
          localStorage.removeItem("user");
          window.location.href = "/login"; // Redirect to login page
        }
      } else {
        localStorage.removeItem("zikasha_crm_token");
        localStorage.removeItem("zikasha_crm_refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login"; // Redirect to login page
      }
    }
    return Promise.reject(error);
  }
);

export default api;
