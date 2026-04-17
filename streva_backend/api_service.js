/**
 * streva-api.js
 * Drop this file into your React src/ folder.
 * Usage: import api from './streva-api';
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// ─── TOKEN HELPERS ────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('streva_token');
const setToken = (t) => localStorage.setItem('streva_token', t);
const clearToken = () => localStorage.removeItem('streva_token');

// ─── FETCH WRAPPER ────────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...options.headers,
  };

  // For FormData (file uploads), let the browser set Content-Type
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw Object.assign(new Error(err.detail || 'Request failed'), { status: res.status, data: err });
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

const get  = (path, params) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return request(`${path}${qs}`);
};
const post   = (path, body) => request(path, { method: 'POST',   body: body instanceof FormData ? body : JSON.stringify(body) });
const patch  = (path, body) => request(path, { method: 'PATCH',  body: JSON.stringify(body) });
const del    = (path)       => request(path, { method: 'DELETE' });

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const auth = {
  register: async (data) => {
    const res = await post('/auth/register/', data);
    setToken(res.token);
    return res;
  },
  login: async (username, password) => {
    const res = await post('/auth/login/', { username, password });
    setToken(res.token);
    return res;
  },
  logout: async () => {
    await post('/auth/logout/');
    clearToken();
  },
  isLoggedIn: () => Boolean(getToken()),
};

// ─── USER ─────────────────────────────────────────────────────────────────────
const user = {
  me:           ()     => get('/me/'),
  update:       (data) => patch('/me/', data),
  dashboard:    ()     => get('/dashboard/'),
};

// ─── COURSES ──────────────────────────────────────────────────────────────────
const courses = {
  list:          (params) => get('/courses/', params),      // { category, level, search }
  detail:        (id)     => get(`/courses/${id}/`),
  withEnroll:    (id)     => get(`/courses/${id}/with_enrollment/`),
  categories:    ()       => get('/categories/'),
};

// ─── ENROLLMENTS ──────────────────────────────────────────────────────────────
const enrollments = {
  mine:           ()         => get('/enrollments/'),
  enroll:         (courseId) => post('/enrollments/', { course: courseId }),
  updateProgress: (id, pct)  => patch(`/enrollments/${id}/update_progress/`, { progress: pct }),
  unenroll:       (id)       => del(`/enrollments/${id}/`),
};

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
const quizzes = {
  list:    (courseId) => get('/quizzes/', courseId ? { course: courseId } : undefined),
  attempt: (quizId, chosenAnswer) => post('/quiz/attempt/', { quiz: quizId, chosen_answer: chosenAnswer }),
  history: ()        => get('/quiz/history/'),
};

// ─── BADGES ───────────────────────────────────────────────────────────────────
const badges = {
  list: () => get('/badges/'),
};

// ─── FILES ────────────────────────────────────────────────────────────────────
const files = {
  list:   ()          => get('/files/'),
  upload: (formData)  => post('/files/', formData),   // FormData with 'file' field
  addUrl: (name, url) => post('/files/', JSON.stringify({ name, url })),
  remove: (id)        => del(`/files/${id}/`),
};

// ─── ACTIVITY ────────────────────────────────────────────────────────────────
const activity = {
  log:  (minutes) => post('/activity/', { minutes_studied: minutes }),
  list: ()        => get('/activity/'),
};

// ─── AI CHAT ─────────────────────────────────────────────────────────────────
const ai = {
  history: ()     => get('/ai/chat/'),
  send:    (text) => post('/ai/chat/', { text }),
};

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
const reviews = {
  byCourse: (courseId)        => get('/reviews/', { course: courseId }),
  add:      (courseId, rating, text) => post('/reviews/', { course: courseId, rating, text }),
};

const api = { auth, user, courses, enrollments, quizzes, badges, files, activity, ai, reviews };
export default api;
