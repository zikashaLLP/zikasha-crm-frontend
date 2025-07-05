import axios from 'axios';

const api = axios.create({
  baseURL:  import.meta.env.API_BASE_URL || 'http://193.203.161.3:3536/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('zikasha_crm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
