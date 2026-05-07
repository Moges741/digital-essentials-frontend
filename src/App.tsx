import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/guards/ProtectedRoute';
import RoleGuard      from './components/guards/RoleGuard';
import HomePage           from './pages/home/HomePage';
import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';
import CoursesPage        from './pages/courses/CoursesPage';
import CourseDetailPage   from './pages/courses/CourseDetailPage';
import CreateCoursePage   from './pages/courses/CreateCoursePage';
import LessonPage         from './pages/lessons/LessonPage';
import LearnerDashboard   from './pages/dashboard/LearnerDashboard';
import MentorDashboard    from './pages/dashboard/MentorDashboard';
import AdminDashboard     from './pages/dashboard/AdminDashboard';
import ProgressPage       from './pages/progress/ProgressPage';
import CertificatesPage   from './pages/certificates/CertificatesPage';
import ExercisePage       from './pages/exercises/ExercisePage';
import ChatPage           from './pages/chat/ChatPage';
import NotFoundPage       from './pages/NotFoundPage';

const App = () => {
  return (
    <Routes>

      {/* ── Public Routes ──────────────────────────── */}
      <Route path="/"        element={<HomePage />} />
      <Route path="/login"   element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:course_id" element={<CourseDetailPage />} />

      {/* ── Protected Routes (must be logged in) ───── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/chat" element={<ChatPage />} />

        {/* Learner routes */}
        <Route element={<RoleGuard allowedRoles={['learner']} />}>
          <Route path="/dashboard"              element={<LearnerDashboard />} />
          <Route path="/dashboard/progress"     element={<ProgressPage />} />
          <Route path="/dashboard/certificates" element={<CertificatesPage />} />
          <Route path="/courses/:course_id/lessons/:lesson_id" element={<LessonPage />} />
          <Route path="/courses/:course_id/exercises/:exercise_id" element={<ExercisePage />} />
        </Route>

        {/* Mentor routes */}
        <Route element={<RoleGuard allowedRoles={['mentor', 'administrator']} />}>
          <Route path="/mentor"                element={<MentorDashboard />} />
          <Route path="/mentor/courses/create" element={<CreateCoursePage />} />
        </Route>

        <Route element={<RoleGuard allowedRoles={['administrator']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* ── Fallback ────────────────────────────────── */}
      <Route path="/404"  element={<NotFoundPage />} />
      <Route path="*"     element={<Navigate to="/404" replace />} />

    </Routes>
  );
};

export default App;