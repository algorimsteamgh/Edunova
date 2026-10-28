import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import { RequireAuth, RequireRole } from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetails from './pages/CourseDetails';
import CoursePlayer from './pages/CoursePlayer';
import LessonViewer from './pages/LessonViewer';
import MyLearning from './pages/MyLearning';
import ProgressDetails from './pages/ProgressDetails';
import AdminDashboard from './pages/AdminDashboard';
import CourseManagement from './pages/CourseManagement';
import LessonManagement from './pages/LessonManagement';
import UserList from './pages/UserList';
import Reports from './pages/Reports';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Public and Catalog */}
            <Route path="/" element={<Navigate to="/courses" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/roadmaps" element={<Navigate to="/courses" replace />} />
            <Route path="/roadmaps/*" element={<Navigate to="/courses" replace />} />

            {/* Authenticated Student Learning Routes */}
            <Route
              path="/courses/:id/learn"
              element={
                <RequireAuth>
                  <CoursePlayer />
                </RequireAuth>
              }
            />
            <Route
              path="/lessons/:id"
              element={
                <RequireAuth>
                  <LessonViewer />
                </RequireAuth>
              }
            />
            <Route
              path="/my-learning"
              element={
                <RequireAuth>
                  <MyLearning />
                </RequireAuth>
              }
            />
            <Route
              path="/enrollments/:id"
              element={
                <RequireAuth>
                  <ProgressDetails />
                </RequireAuth>
              }
            />

            {/* Admin Dashboard is hidden: redirect /admin to courses */}
            <Route path="/admin" element={<Navigate to="/courses" replace />} />
            <Route path="/admin/*" element={<Navigate to="/courses" replace />} />

            {/* Errors */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
