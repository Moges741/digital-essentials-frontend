import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Navbar           from './components/layout/Navbar';
import Footer           from './components/layout/Footer';
import DashboardLayout  from './components/layout/DashboardLayout';

// Guards
import ProtectedRoute   from './components/guards/ProtectedRoute';
import RoleGuard        from './components/guards/RoleGuard';

// Pages
import HomePage           from './pages/home/HomePage';
import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';
import CoursesPage        from './pages/courses/CoursesPage';
import CourseDetailPage   from './pages/courses/CourseDetailPage';
import CreateCoursePage   from './pages/courses/CreateCoursePage';
import LessonPage         from './pages/lessons/LessonPage';
import CreateLessonPage   from './pages/lessons/CreateLessonPage';
import LearnerDashboard   from './pages/dashboard/LearnerDashboard';
import MentorDashboard    from './pages/dashboard/MentorDashboard';
import AdminDashboard     from './pages/dashboard/AdminDashboard';
import ProgressPage       from './pages/progress/ProgressPage';
import CertificatesPage   from './pages/certificates/CertificatesPage';
import ExercisePage       from './pages/exercises/ExercisePage';
import ChatPage           from './pages/chat/ChatPage';
import NotFoundPage       from './pages/NotFoundPage';
import EmailVerificationPage from './pages/auth/EmailVerificationPage';

// ── Public Layout wrapper ─────────────────────────────────────
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 pt-16">
      {children}
    </main>
    <Footer />
  </div>
);

// ── Authenticated Layout wrapper ──────────────────────────────
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

const App = () => {
  return (
    <Routes>

      {/* ── Public Routes ──────────────────────────── */}
      <Route path="/" element={
        <PublicLayout><HomePage /></PublicLayout>
      } />
      <Route path="/login" element={
        <PublicLayout><LoginPage /></PublicLayout>
      } />
      <Route path="/register" element={
        <PublicLayout><RegisterPage /></PublicLayout>
      } />
      <Route path="/auth/google/callback" element={
        <PublicLayout><GoogleCallbackPage /></PublicLayout>
      } />
      <Route path="/courses" element={
        <PublicLayout><CoursesPage /></PublicLayout>
      } />
      <Route path="/courses/:course_id" element={
        <PublicLayout><CourseDetailPage /></PublicLayout>
      } />

      {/* ── Protected Routes ───────────────────────── */}
      <Route element={<ProtectedRoute />}>

        <Route path="/chat" element={
          <AuthLayout><ChatPage /></AuthLayout>
        } />

        {/* Learner */}
        <Route element={<RoleGuard allowedRoles={['learner']} />}>
          <Route path="/dashboard" element={
            <AuthLayout><LearnerDashboard /></AuthLayout>
          } />
          <Route path="/dashboard/progress" element={
            <AuthLayout><ProgressPage /></AuthLayout>
          } />
          <Route path="/dashboard/certificates" element={
            <AuthLayout><CertificatesPage /></AuthLayout>
          } />
          <Route path="/courses/:course_id/lessons/:lesson_id" element={
            <AuthLayout><LessonPage /></AuthLayout>
          } />
          <Route path="/courses/:course_id/exercises/:exercise_id" element={
            <AuthLayout><ExercisePage /></AuthLayout>
          } />
        </Route>

        {/* Mentor */}
        <Route element={<RoleGuard allowedRoles={['mentor', 'administrator']} />}>
          <Route path="/mentor" element={
            <AuthLayout><MentorDashboard /></AuthLayout>
          } />
          <Route path="/mentor/courses/create" element={
            <AuthLayout><CreateCoursePage /></AuthLayout>
          } />
          <Route path="/mentor/courses/:course_id/lessons/create" element={
            <AuthLayout><CreateLessonPage /></AuthLayout>
          } />
        </Route>

        {/* Admin */}
        <Route element={<RoleGuard allowedRoles={['administrator']} />}>
          <Route path="/admin" element={
            <AuthLayout><AdminDashboard /></AuthLayout>
          } />
        </Route>
        <Route path="/verify-email" element={
  <PublicLayout><EmailVerificationPage /></PublicLayout>
} />

      </Route>

      {/* ── Fallback ────────────────────────────────── */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />

    </Routes>
  );
};

export default App;