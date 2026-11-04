import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edunova_token') || localStorage.getItem('learnsphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('edunova_token');
        localStorage.removeItem('learnsphere_token');
        localStorage.removeItem('edunova_user');
        localStorage.removeItem('learnsphere_user');
      }
      const data = error.response.data;
      const message = data.detail || data.message || 'An error occurred';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(new Error('Network error. Please check your connection.'));
  }
);

// Auth Endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Course Endpoints
export const courseApi = {
  list: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  getCategories: () => api.get('/courses/categories'),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.patch(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Lesson Endpoints
export const lessonApi = {
  listByCourse: (courseId) => api.get(`/courses/${courseId}/lessons`),
  getById: (id) => api.get(`/lessons/${id}`),
  create: (courseId, data) => api.post(`/courses/${courseId}/lessons`, data),
  update: (id, data) => api.patch(`/lessons/${id}`, data),
  delete: (id) => api.delete(`/lessons/${id}`),
};

// Enrollment Endpoints
export const enrollmentApi = {
  enroll: (courseId) => api.post(`/courses/${courseId}/enroll`),
  getMyEnrollments: () => api.get('/me/enrollments'),
  getById: (id) => api.get(`/me/enrollments/${id}`),
};

// Progress Endpoints
export const progressApi = {
  updateProgress: (enrollmentId, lessonId, isCompleted) =>
    api.put(`/enrollments/${enrollmentId}/lessons/${lessonId}/progress`, { isCompleted }),
  getProgress: (enrollmentId) => api.get(`/enrollments/${enrollmentId}/progress`),
};

// Roadmaps Endpoints (roadmap.sh style)
export const roadmapApi = {
  list: (params) => api.get('/roadmaps', { params }),
  getByIdOrSlug: (idOrSlug) => api.get(`/roadmaps/${idOrSlug}`),
  getTopicDetails: (topicId) => api.get(`/roadmaps/topics/${topicId}`),
  getRoadmapTopicDetails: (roadmapId, topicId) => api.get(`/roadmaps/${roadmapId}/topics/${topicId}`),
  enroll: (id) => api.post(`/roadmaps/${id}/enroll`),
  updateTopicProgress: (topicId, status) => api.post(`/roadmaps/topics/${topicId}/progress`, { status }),
  updateVideoProgress: (topicId) => api.post(`/roadmaps/topics/${topicId}/video-progress`),
  getMyRoadmaps: () => api.get('/roadmaps/my/enrolled'),
  getStudentDashboard: () => api.get('/roadmaps/student/dashboard'),
  searchGlobal: (params) => api.get('/roadmaps/search/global', { params }),

  // Admin Roadmap Content Management
  adminCreateRoadmap: (data) => api.post('/roadmaps/admin/create', data),
  adminUpdateRoadmap: (id, data) => api.put(`/roadmaps/admin/${id}`, data),
  adminDeleteRoadmap: (id) => api.delete(`/roadmaps/admin/${id}`),
  adminCreateModule: (roadmapId, data) => api.post(`/roadmaps/admin/${roadmapId}/modules`, data),
  adminUpdateModule: (id, data) => api.put(`/roadmaps/admin/modules/${id}`, data),
  adminDeleteModule: (id) => api.delete(`/roadmaps/admin/modules/${id}`),
  adminCreateTopic: (roadmapId, data) => api.post(`/roadmaps/admin/${roadmapId}/topics`, data),
  adminUpdateTopic: (id, data) => api.put(`/roadmaps/admin/topics/${id}`, data),
  adminDeleteTopic: (id) => api.delete(`/roadmaps/admin/topics/${id}`),
  adminGetMissingResources: () => api.get('/roadmaps/admin/missing-resources'),
};

// Quizzes & Assessments Endpoints
export const quizApi = {
  getByLesson: (lessonId) => api.get(`/lessons/${lessonId}/quiz`),
  submit: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers }),
};

// Bookmarks Endpoints
export const bookmarkApi = {
  toggle: (lessonId, notes = '') => api.post(`/lessons/${lessonId}/bookmark`, { notes }),
  getMyBookmarks: () => api.get('/my/bookmarks'),
};

// Admin Endpoints
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  listUsers: (params) => api.get('/admin/users', { params }),
  getEnrollmentsReport: (params) => api.get('/admin/reports/enrollments', { params }),
  getCompletionsReport: (params) => api.get('/admin/reports/completions', { params }),
  getProgressReport: (enrollmentId) => api.get(`/admin/reports/progress/${enrollmentId}`),
  getHealthSummary: () => api.get('/admin/health/summary'),
  downloadEnrollmentsCsv: () => '/api/v1/admin/reports/enrollments/csv',
  downloadCompletionsCsv: () => '/api/v1/admin/reports/completions/csv',
};

export default api;
