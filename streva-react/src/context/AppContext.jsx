import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext(null);

const API = 'http://127.0.0.1:8000/api';

// Helper: authenticated fetch
async function apiFetch(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Token ${token}`;
  // Don't set Content-Type for FormData
  if (options.body instanceof FormData) delete headers['Content-Type'];
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || JSON.stringify(err) || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function AppProvider({ children }) {
  // ─── Auth state ───────────────────────────────────────────────────
  const [token, setToken] = useState(() => localStorage.getItem('streva_token') || null);
  const [user, setUser] = useState(null);

  // ─── App state ────────────────────────────────────────────────────
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [badges, setBadges] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [learningPath, setLearningPath] = useState(() => {
    try { return JSON.parse(localStorage.getItem('streva_path') || '[]'); } catch { return []; }
  });
  const [toastMsg, setToastMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const api = useCallback((path, options = {}) => apiFetch(path, options, token), [token]);

  // ─── Toast ────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  // ─── Navigation ───────────────────────────────────────────────────
  const navigate = useCallback((page, courseId = null) => {
    setCurrentPage(page);
    if (courseId !== null) setSelectedCourseId(courseId);
  }, []);

  // ─── Load initial data when token is set ─────────────────────────
  useEffect(() => {
    if (!token) return;
    const loadAll = async () => {
      try {
        const [me, coursesData, enrollsData, badgesData, filesData] = await Promise.all([
          api('/me/'),
          api('/courses/'),
          api('/enrollments/'),
          api('/badges/'),
          api('/files/'),
        ]);
        setUser(me);
        // Merge courses with enrollment data
        const enrollMap = {};
        (enrollsData.results || enrollsData).forEach(e => { enrollMap[e.course] = e; });
        const merged = (coursesData.results || coursesData).map(c => ({
          ...c,
          cat: c.cat || 'network',
          desc: c.description,
          progress: enrollMap[c.id]?.progress || 0,
          status: enrollMap[c.id]?.status || 'not-started',
          students: c.students_count,
          materials: c.materials_count,
          enrollment_id: enrollMap[c.id]?.id || null,
        }));
        setCourses(merged);
        setEnrollments(enrollsData.results || enrollsData);
        setBadges(badgesData.results || badgesData);
        setUploadedFiles(filesData.results || filesData);
      } catch (e) {
        console.error('Load error', e);
      }
    };
    loadAll();
  }, [token, api]);

  // ─── Auth ─────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    const data = await apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem('streva_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await apiFetch('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    localStorage.setItem('streva_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await api('/auth/logout/', { method: 'POST' }); } catch (_) {}
    localStorage.removeItem('streva_token');
    setToken(null);
    setUser(null);
    setCourses([]);
    setEnrollments([]);
  }, [api]);

  const updateUser = useCallback((data) => setUser(prev => ({ ...prev, ...data })), []);

  // ─── Courses ──────────────────────────────────────────────────────
  const addCourse = useCallback(async (courseData) => {
    // Fetch categories to resolve key -> id, but don't fail course creation if this errors
    let categoryId = null;
    try {
      const catRes = await api('/categories/');
      const cats = catRes.results || catRes;
      const cat = cats.find(c => c.key === courseData.cat);
      categoryId = cat?.id || null;
    } catch (_) { /* categories endpoint optional */ }
    const payload = {
      title: courseData.title,
      description: courseData.desc || courseData.description || '',
      instructor: courseData.instructor || '',
      level: courseData.level || 'Beginner',
      duration: courseData.duration || '1h',
      ...(categoryId ? { category: categoryId } : {}),
    };
    const created = await api('/courses/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const newCourse = {
      ...created,
      cat: created.category_detail?.key || courseData.cat || 'network',
      desc: created.description,
      progress: 0,
      status: 'not-started',
      students: 0,
      materials: 0,
      enrollment_id: null,
    };
    setCourses(prev => [newCourse, ...prev]);
    return newCourse;
  }, [api]);

  const updateCourse = useCallback((id, data) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteCourse = useCallback(async (id) => {
    await api(`/courses/${id}/`, { method: 'DELETE' });
    setCourses(prev => prev.filter(c => c.id !== id));
  }, [api]);

  // ─── Enrollment ───────────────────────────────────────────────────
  const enrollInCourse = useCallback(async (courseId) => {
    const existing = enrollments.find(e => e.course === courseId);
    if (existing) return existing;
    const enroll = await api('/enrollments/', {
      method: 'POST',
      body: JSON.stringify({ course: courseId }),
    });
    setEnrollments(prev => [...prev, enroll]);
    setCourses(prev => prev.map(c => c.id === courseId
      ? { ...c, status: 'in-progress', progress: 0, enrollment_id: enroll.id }
      : c
    ));
    return enroll;
  }, [api, enrollments]);

  const updateProgress = useCallback(async (enrollmentId, progress) => {
    const updated = await api(`/enrollments/${enrollmentId}/update_progress/`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    });
    setEnrollments(prev => prev.map(e => e.id === enrollmentId ? updated : e));
    setCourses(prev => prev.map(c => c.enrollment_id === enrollmentId
      ? { ...c, progress: updated.progress, status: updated.status }
      : c
    ));
    return updated;
  }, [api]);

  const markContentDone = useCallback(async (enrollmentId, contentId) => {
    const updated = await api(`/enrollments/${enrollmentId}/mark_content/`, {
      method: 'PATCH',
      body: JSON.stringify({ content_id: contentId }),
    });
    setEnrollments(prev => prev.map(e => e.id === enrollmentId ? updated : e));
    setCourses(prev => prev.map(c => c.enrollment_id === enrollmentId
      ? { ...c, progress: updated.progress, status: updated.status }
      : c
    ));
    return updated;
  }, [api]);

  // ─── Chapters ─────────────────────────────────────────────────────
  const getChapters = useCallback(async (courseId) => {
    const data = await api(`/chapters/?course=${courseId}`);
    return data.results || data;
  }, [api]);

  const addChapter = useCallback(async (courseId, chapterData) => {
    const created = await api('/chapters/', {
      method: 'POST',
      body: JSON.stringify({ course: courseId, ...chapterData }),
    });
    return created;
  }, [api]);

  const updateChapter = useCallback(async (chapterId, data) => {
    return api(`/chapters/${chapterId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }, [api]);

  const deleteChapter = useCallback(async (chapterId) => {
    await api(`/chapters/${chapterId}/`, { method: 'DELETE' });
  }, [api]);

  // ─── Chapter Content ──────────────────────────────────────────────
  const getChapterContent = useCallback(async (chapterId) => {
    const data = await api(`/chapter-content/?chapter=${chapterId}`);
    return data.results || data;
  }, [api]);

  const addContent = useCallback(async (chapterId, contentData) => {
    const isFile = contentData.file instanceof File;
    let body;
    if (isFile) {
      body = new FormData();
      body.append('chapter', chapterId);
      body.append('title', contentData.title);
      body.append('content_type', contentData.content_type);
      body.append('file', contentData.file);
      body.append('order', contentData.order || 0);
    } else {
      body = JSON.stringify({ chapter: chapterId, ...contentData });
    }
    return api('/chapter-content/', {
      method: 'POST',
      headers: isFile ? {} : { 'Content-Type': 'application/json' },
      body,
    });
  }, [api]);

  const deleteContent = useCallback(async (contentId) => {
    await api(`/chapter-content/${contentId}/`, { method: 'DELETE' });
  }, [api]);

  // ─── Quizzes ──────────────────────────────────────────────────────
  const getQuizzes = useCallback(async (courseId, chapterId = null) => {
    let url = `/quizzes/?course=${courseId}`;
    if (chapterId) url += `&chapter=${chapterId}`;
    const data = await api(url);
    return data.results || data;
  }, [api]);

  const addQuiz = useCallback(async (quizData) => {
    return api('/quizzes/', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }, [api]);

  const updateQuiz = useCallback(async (quizId, data) => {
    return api(`/quizzes/${quizId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }, [api]);

  const deleteQuiz = useCallback(async (quizId) => {
    await api(`/quizzes/${quizId}/`, { method: 'DELETE' });
  }, [api]);

  const submitQuizAnswer = useCallback(async (quizId, chosenAnswer) => {
    return api('/quiz/attempt/', {
      method: 'POST',
      body: JSON.stringify({ quiz: quizId, chosen_answer: chosenAnswer }),
    });
  }, [api]);

  const getCourseFullContent = useCallback(async (courseId) => {
    return api(`/courses/${courseId}/full_content/`);
  }, [api]);

  // ─── Learning Path ────────────────────────────────────────────────
  const addToPath = useCallback((course) => {
    setLearningPath(prev => {
      if (prev.find(c => c.id === course.id)) return prev;
      const updated = [...prev, course];
      localStorage.setItem('streva_path', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromPath = useCallback((courseId) => {
    setLearningPath(prev => {
      const updated = prev.filter(c => c.id !== courseId);
      localStorage.setItem('streva_path', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updatePathItem = useCallback((courseId, data) => {
    setLearningPath(prev => {
      const updated = prev.map(c => c.id === courseId ? { ...c, ...data } : c);
      localStorage.setItem('streva_path', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ─── Files ────────────────────────────────────────────────────────
  const addFile = useCallback((file) => setUploadedFiles(prev => [file, ...prev]), []);
  const removeFile = useCallback((id) => setUploadedFiles(prev => prev.filter(f => f.id !== id)), []);

  const value = {
    // auth
    token, user, updateUser, login, register, logout,
    // app state
    courses, addCourse, updateCourse, deleteCourse,
    enrollments, enrollInCourse, updateProgress, markContentDone,
    badges,
    currentPage, navigate,
    selectedCourseId, setSelectedCourseId,
    uploadedFiles, addFile, removeFile,
    toastMsg, showToast,
    loading, setLoading,
    // chapter & content
    getChapters, addChapter, updateChapter, deleteChapter,
    getChapterContent, addContent, deleteContent,
    // quizzes
    getQuizzes, addQuiz, updateQuiz, deleteQuiz, submitQuizAnswer,
    // full course content
    getCourseFullContent,
    // learning path
    learningPath, addToPath, removeFromPath, updatePathItem,
    // raw api helper
    api,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
