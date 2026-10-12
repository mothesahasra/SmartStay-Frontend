import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 / token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          if (data.success && data.data) {
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            return api(originalRequest);
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth API ---
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// --- User API ---
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  changePassword: (data) => api.patch('/users/me/password', data),
  getAllUsers: (page = 0, size = 10) => api.get(`/users?page=${page}&size=${size}`),
  deactivateUser: (id) => api.delete(`/users/${id}`),
};

// --- Hotel API ---
export const hotelAPI = {
  getAll: (page = 0, size = 10) => api.get(`/hotels?page=${page}&size=${size}`),
  getById: (id) => api.get(`/hotels/${id}`),
  search: (keyword, page = 0, size = 10) => api.get(`/hotels/search?keyword=${keyword}&page=${page}&size=${size}`),
  getByCity: (city, page = 0, size = 10) => api.get(`/hotels/city/${city}?page=${page}&size=${size}`),
  getMyHotels: (page = 0, size = 10) => api.get(`/hotels/my-hotels?page=${page}&size=${size}`),
  create: (data) => api.post('/hotels', data),
  update: (id, data) => api.put(`/hotels/${id}`, data),
  delete: (id) => api.delete(`/hotels/${id}`),
};

// --- Room API ---
export const roomAPI = {
  getByHotel: (hotelId, page = 0, size = 10) => api.get(`/rooms/hotel/${hotelId}?page=${page}&size=${size}`),
  getById: (id) => api.get(`/rooms/${id}`),
  getAvailable: (hotelId, checkIn, checkOut, page = 0, size = 10) =>
    api.get(`/rooms/hotel/${hotelId}/available?checkIn=${checkIn}&checkOut=${checkOut}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

// --- Booking API ---
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getById: (id) => api.get(`/bookings/${id}`),
  getMyBookings: (page = 0, size = 10) => api.get(`/bookings/my-bookings?page=${page}&size=${size}`),
  getHotelBookings: (hotelId, page = 0, size = 10) => api.get(`/bookings/hotel/${hotelId}?page=${page}&size=${size}`),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  confirm: (id) => api.patch(`/bookings/${id}/confirm`),
  checkIn: (id) => api.patch(`/bookings/${id}/check-in`),
  checkOut: (id) => api.patch(`/bookings/${id}/check-out`),
};

// --- Payment API ---
export const paymentAPI = {
  process: (data) => api.post('/payments', data),
  getByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  getById: (id) => api.get(`/payments/${id}`),
  refund: (id) => api.post(`/payments/${id}/refund`),
};

// --- Review API ---
export const reviewAPI = {
  getHotelReviews: (hotelId, page = 0, size = 10) => api.get(`/reviews/hotel/${hotelId}?page=${page}&size=${size}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// --- Amenity API ---
export const amenityAPI = {
  getAll: () => api.get('/amenities'),
  getById: (id) => api.get(`/amenities/${id}`),
  create: (data) => api.post('/amenities', data),
  update: (id, data) => api.put(`/amenities/${id}`, data),
  delete: (id) => api.delete(`/amenities/${id}`),
};

export default api;
