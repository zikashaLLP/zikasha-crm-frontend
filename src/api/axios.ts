import axios from 'axios';

const api = axios.create({
  baseURL:  import.meta.env.API_BASE_URL || 'https://realestatecrmapi.zikasha.com/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('zikasha_crm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
