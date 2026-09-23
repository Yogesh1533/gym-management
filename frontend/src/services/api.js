import axios from 'axios';

// Defaults to the same origin: in production Express serves the built app and the API
// together, and in development the CRA "proxy" setting forwards /api to localhost:5000.
const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally (token expired)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // A 401 from the login form itself just means wrong credentials — don't redirect
    const isAuthCall = err.config?.url?.startsWith('/auth/login') || err.config?.url?.startsWith('/auth/register');
    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── User ────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  generatePlan: (gymDays) => api.post('/users/generate-plan', { gymDays }),
  getFoods: () => api.get('/users/foods'),
  generateCustomPlan: (selectedFoodIds) => api.post('/users/generate-custom-plan', { selectedFoodIds }),
  logWeight: (weight, note) => api.post('/users/weight-log', { weight, note }),
  getWeightLogs: () => api.get('/users/weight-log'),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Members
  getMembers: () => api.get('/admin/members'),
  getMember: (id) => api.get(`/admin/members/${id}`),
  updateMember: (id, data) => api.put(`/admin/members/${id}`, data),
  deleteMember: (id) => api.delete(`/admin/members/${id}`),
  // Workout Plans
  getWorkoutPlans: () => api.get('/admin/workout-plans'),
  createWorkoutPlan: (data) => api.post('/admin/workout-plans', data),
  updateWorkoutPlan: (id, data) => api.put(`/admin/workout-plans/${id}`, data),
  deleteWorkoutPlan: (id) => api.delete(`/admin/workout-plans/${id}`),
  // Diet Plans
  getDietPlans: () => api.get('/admin/diet-plans'),
  createDietPlan: (data) => api.post('/admin/diet-plans', data),
  updateDietPlan: (id, data) => api.put(`/admin/diet-plans/${id}`, data),
  deleteDietPlan: (id) => api.delete(`/admin/diet-plans/${id}`),
  // Sessions
  getSessions: () => api.get('/admin/sessions'),
  createSession: (data) => api.post('/admin/sessions', data),
  updateSession: (id, data) => api.put(`/admin/sessions/${id}`, data),
  deleteSession: (id) => api.delete(`/admin/sessions/${id}`),
  // Bookings
  getAllBookings: () => api.get('/admin/bookings'),
  markAttended: (id) => api.put(`/admin/bookings/${id}/attend`),
  // Notifications
  sendNotification: (data) => api.post('/admin/notifications/send', data),
};

// ─── Sessions (member view) ───────────────────────────────────────────────────
export const sessionAPI = {
  getUpcoming: () => api.get('/sessions'),
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookingAPI = {
  book: (sessionId) => api.post('/bookings', { sessionId }),
  getMyBookings: () => api.get('/bookings/my'),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  getMyWaitlist: () => api.get('/bookings/waitlist'),
  leaveWaitlist: (id) => api.delete(`/bookings/waitlist/${id}`),
};

export const ratingAPI = {
  rate: (sessionId, rating, review) => api.post('/ratings', { sessionId, rating, review }),
  getMyRatings: () => api.get('/ratings/my'),
  getSessionRatings: (id) => api.get(`/ratings/session/${id}`),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const membershipAPI = {
  getPublicPlans: () => api.get('/memberships/public'),
  getMyMembership: () => api.get('/memberships/my'),
  getAllPlans: () => api.get('/memberships'),
  createPlan: (data) => api.post('/memberships', data),
  updatePlan: (id, data) => api.put(`/memberships/${id}`, data),
  deletePlan: (id) => api.delete(`/memberships/${id}`),
  assignPlan: (memberId, planId) => api.post('/memberships/assign', { memberId, planId }),
};

export default api;
