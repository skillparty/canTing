import axios from 'axios';
import toast from 'react-hot-toast';

// Configuración base de axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró, intentar refrescarlo
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken
          });

          if (response.data.success) {
            const { token, refreshToken: newRefreshToken } = response.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', newRefreshToken);

            // Reintentar la request original
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Manejar otros errores
    if (error.response?.status >= 500) {
      toast.error('Error interno del servidor. Intenta de nuevo más tarde.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('La solicitud tardó demasiado. Verifica tu conexión.');
    } else if (!error.response) {
      toast.error('Error de conexión. Verifica tu conexión a internet.');
    }

    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  verifyToken: () => api.get('/auth/verify'),
  refreshToken: (data) => api.post('/auth/refresh-token', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Servicios de restaurantes
export const restaurantAPI = {
  getCurrent: () => api.get('/restaurants/current'),
  getById: (id) => api.get(`/restaurants/${id}`),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  updateLogo: (id, formData) => api.post(`/restaurants/${id}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHours: (id) => api.get(`/restaurants/${id}/hours`),
  updateHours: (id, hours) => api.put(`/restaurants/${id}/hours`, { opening_hours: hours }),
  getStatus: (id) => api.get(`/restaurants/${id}/status`),
  getStats: (id) => api.get(`/restaurants/${id}/stats`),
};

// Servicios de categorías
export const categoryAPI = {
  getAll: (includeItems = false) => api.get(`/categories?include_items=${includeItems}`),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  reorder: (categories) => api.post('/categories/reorder', { categories }),
  getPublic: (restaurantId) => api.get(`/categories/public/${restaurantId}`),
};

// Servicios de elementos del menú
export const menuItemAPI = {
  getAll: (params = {}) => api.get('/menu-items', { params }),
  getById: (id) => api.get(`/menu-items/${id}`),
  create: (formData) => api.post('/menu-items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/menu-items/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/menu-items/${id}`),
  toggleAvailability: (id) => api.patch(`/menu-items/${id}/toggle-availability`),
  updateImage: (id, formData) => api.post(`/menu-items/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getByCategory: (categoryId) => api.get(`/menu-items/category/${categoryId}`),
  getStats: () => api.get('/menu-items/stats'),
  getPublic: (restaurantId) => api.get(`/menu-items/public/${restaurantId}`),
  searchPublic: (restaurantId, query) => api.get(`/menu-items/public/${restaurantId}/search?q=${query}`),
};

// Servicios de pedidos
export const orderAPI = {
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders/public', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  updatePaymentStatus: (id, paymentStatus) => api.patch(`/orders/${id}/payment-status`, { payment_status: paymentStatus }),
  getPending: () => api.get('/orders/pending'),
  getStats: (params = {}) => api.get('/orders/stats', { params }),
  getDailySummary: () => api.get('/orders/daily-summary'),
  search: (query) => api.get(`/orders/search?q=${query}`),
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
};

// Servicios de pagos
export const paymentAPI = {
  getAll: (params = {}) => api.get('/payments', { params }),
  getByOrder: (orderId) => api.get(`/payments/order/${orderId}`),
  generateQR: (orderId) => api.post('/payments/generate-qr', { order_id: orderId }),
  uploadQR: (formData) => api.post('/payments/upload-qr', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, status) => api.patch(`/payments/${id}/status`, { status }),
  confirm: (id, data) => api.post(`/payments/${id}/confirm`, data),
  reject: (id, reason) => api.post(`/payments/${id}/reject`, { reason }),
  getStats: (params = {}) => api.get('/payments/stats', { params }),
  regenerateQR: (id) => api.post(`/payments/${id}/regenerate-qr`),
};

// Función helper para manejar errores de API
export const handleAPIError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error.message;
  } else if (error.message) {
    return error.message;
  } else {
    return 'Error desconocido';
  }
};

// Función helper para crear FormData
export const createFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  
  return formData;
};

export default api;