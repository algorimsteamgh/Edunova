import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import { RequireAuth, RequireRole } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetails from './pages/CourseDetails';
import CoursePlayer from './pages/CoursePlayer';
import Roadmaps from './pages/Roadmaps';
import RoadmapView from './pages/RoadmapView';
import TopicLearningView from './pages/TopicLearningView';
import LessonViewer from './pages/LessonViewer';
import MyLearning from './pages/MyLearning';
import ProgressDetails from './pages/ProgressDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoadmapManagement from './pages/AdminRoadmapManagement';
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
            {/* Public Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Root Route: strictly protected Home page. If authenticated, renders Home page; if unauthenticated, RequireAuth redirects to /login */}
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />

            {/* Protected Courses & Dashboard */}
            <Route
              path="/courses"
              element={
                <RequireAuth>
                  <CourseCatalog />
                </RequireAuth>
              }
            />
            <Route
              path="/courses/:id"
              element={
                <RequireAuth>
                  <CourseDetails />
                </RequireAuth>
              }
            />
            {/* Roadmaps & Career Paths (roadmap.sh style) */}
            <Route
              path="/roadmaps"
              element={
                <RequireAuth>
                  <Roadmaps />
                </RequireAuth>
              }
            />
            <Route
              path="/roadmaps/:idOrSlug"
              element={
                <RequireAuth>
                  <RoadmapView />
                </RequireAuth>
              }
            />
            <Route
              path="/roadmaps/:roadmapId/topics/:topicId"
              element={
                <RequireAuth>
                  <TopicLearningView />
                </RequireAuth>
              }
            />
            <Route
              path="/roadmaps/topics/:topicId"
              element={
                <RequireAuth>
                  <TopicLearningView />
                </RequireAuth>
              }
            />

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

            {/* Admin Portal (Protected for Admin role) */}
            <Route
              path="/admin"
              element={
                <RequireRole role="admin">
                  <AdminDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/admin/roadmaps"
              element={
                <RequireRole role="admin">
                  <AdminRoadmapManagement />
                </RequireRole>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <RequireRole role="admin">
                  <CourseManagement />
                </RequireRole>
              }
            />
            <Route
              path="/admin/lessons"
              element={
                <RequireRole role="admin">
                  <LessonManagement />
                </RequireRole>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RequireRole role="admin">
                  <UserList />
                </RequireRole>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <RequireRole role="admin">
                  <Reports />
                </RequireRole>
              }
            />

            {/* Errors */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
