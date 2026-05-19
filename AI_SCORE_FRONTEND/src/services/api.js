import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Submit a text or URL scan.
 * @param {object} payload
 */
export const submitScan = async (payload) => {
  try {
    const response = await api.post('/api/scan', payload);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to submit scan.');
  }
};

/**
 * Fetch a single scan by id.
 * @param {string} id
 */
export const getScan = async (id) => {
  try {
    const response = await api.get(`/api/scan/${id}`);
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to load scan.');
  }
};

/**
 * Fetch scan history.
 * @param {object} params
 */
export const getHistory = async (params = {}) => {
  try {
    const response = await api.get('/api/history', { params });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to load history.');
  }
};

/**
 * Upload a file for analysis.
 * @param {File} file
 */
export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Unable to upload file.');
  }
};
