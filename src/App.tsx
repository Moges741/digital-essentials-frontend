// src/App.tsx
// Complete route definitions for the Digital Essentials Platform
// Public routes — no login needed
// Protected routes — must be authenticated
// Role routes — must have specific role

import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Navbar          from './components/layout/Navbar';
import Footer          from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import OfflineBanner   from './components/ui/OfflineBanner';

// Guards
import ProtectedRoute  from './components/guards/ProtectedRoute';
import RoleGuard       from './components/guards/RoleGuard';

// Public pages
import HomePage         from './pages/home/HomePage';
import LoginPage        from './pages/auth/LoginPage';
import RegisterPage     from './pages/auth/RegisterPage';
import VerifyEmailPage  from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from './pages/auth/ResetPasswordPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';
import CoursesPage      from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import NotFoundPage     from './pages/NotFoundPage';

// Learner pages
import LearnerDashboard  from './pages/dashboard/LearnerDashboard';
import LessonPage        from './pages/lessons/LessonPage';
import ProgressPage      from './pages/progress/ProgressPage';
import CertificatesPage  from './pages/certificates/CertificatesPage';
import ExercisePage      from './pages/exercises/ExercisePage';

// Mentor pages
import MentorDashboard  from './pages/dashboard/MentorDashboard';
import CreateCoursePage from './pages/courses/CreateCoursePage';
import CreateLessonPage from './pages/lessons/CreateLessonPage';
import EditLessonPage   from './pages/lessons/EditLessonPage';
import ExamBuilderPage from './pages/exam/ExamBuilderPage';
import FinalExamPage   from './pages/exam/FinalExamPage';
import ExamResultPage  from './pages/exam/ExamResultPage';
import ExamReviewPage    from './pages/exam/ExamReviewPage';
import ExamSubmissionPage from './pages/exam/ExamSubmissionPage';
// Admin pages
import AdminPanel from './pages/dashboard/AdminPanel';
import AdminUsers from './pages/dashboard/AdminUsers';
import AdminCertificates from './pages/dashboard/AdminCertificates.tsx';

// Shared pages
import ChatPage from './pages/chat/ChatPage';

// AuthLayout — no navbar, just sidebar layout
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <OfflineBanner />
    <DashboardLayout>{children}</DashboardLayout>
  </>
);

// PublicLayout — navbar + footer, no sidebar
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <OfflineBanner />
    <main className="flex-1 pt-16">
      {children}
    </main>
    <Footer />
  </div>
);
// ── App ───────────────────────────────────────────────────────
const App = () => {
  return (
    <Routes>

      {/* ── Public ─────────────────────────────────────── */}
      <Route path="/" element={
        <PublicLayout><HomePage /></PublicLayout>
      } />
      <Route path="/login" element={
        <PublicLayout><LoginPage /></PublicLayout>
      } />
      <Route path="/register" element={
        <PublicLayout><RegisterPage /></PublicLayout>
      } />
      <Route path="/verify-email" element={
        <PublicLayout><VerifyEmailPage /></PublicLayout>
      } />
      <Route path="/forgot-password" element={
        <PublicLayout><ForgotPasswordPage /></PublicLayout>
      } />
      <Route path="/reset-password" element={
        <PublicLayout><ResetPasswordPage /></PublicLayout>
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

      {/* ── Protected (must be logged in) ──────────────── */}
      <Route element={<ProtectedRoute />}>

        {/* Shared — any authenticated role */}
        <Route path="/chat" element={<ChatPage />} />

        {/* ── Learner ──────────────────────────────────── */}
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
          <Route
            path="/courses/:course_id/lessons/:lesson_id"
            element={<AuthLayout><LessonPage /></AuthLayout>}
          />
          <Route
            path="/courses/:course_id/exercises/:exercise_id"
            element={<AuthLayout><ExercisePage /></AuthLayout>}
          />
        </Route>

        {/* ── Mentor + Admin ────────────────────────────── */}
        <Route element={
          <RoleGuard allowedRoles={['mentor', 'administrator']} />
        }>
          <Route path="/mentor" element={
            <AuthLayout><MentorDashboard /></AuthLayout>
          } />
          <Route path="/mentor/courses/create" element={
            <AuthLayout><CreateCoursePage /></AuthLayout>
          } />
          <Route path="/mentor/courses/:course_id/lessons/create" element={
            <AuthLayout><CreateLessonPage /></AuthLayout>
          } />
          <Route path="/mentor/courses/:course_id/lessons/:lesson_id/edit" element={
            <AuthLayout><EditLessonPage /></AuthLayout>
          } />
        </Route>
{/* Learner exam routes */}
<Route
  path="/courses/:course_id/exam"
  element={<AuthLayout><FinalExamPage /></AuthLayout>}
/>
<Route
  path="/courses/:course_id/exam/result"
  element={<AuthLayout><ExamResultPage /></AuthLayout>}
/>

{/* Mentor exam routes */}
<Route
  path="/mentor/courses/:course_id/exam"
  element={<AuthLayout><ExamBuilderPage /></AuthLayout>}
/>
<Route
  path="/mentor/courses/:course_id/exam/review"
  element={<AuthLayout><ExamReviewPage /></AuthLayout>}
/>
<Route
  path="/mentor/courses/:course_id/exam/submission/:submission_id"
  element={<AuthLayout><ExamSubmissionPage /></AuthLayout>}
/>
        {/* ── Admin only ────────────────────────────────── */}
        <Route element={
          <RoleGuard allowedRoles={['administrator']} />
        }>
          <Route path="/admin" element={
            <AuthLayout><AdminPanel /></AuthLayout>
          } />
          <Route path="/admin/users" element={
            <AuthLayout><AdminUsers /></AuthLayout>
          } />
          <Route path="/admin/certificates" element={
            <AuthLayout><AdminCertificates /></AuthLayout>
          } />
        </Route>

      </Route>

      {/* ── Fallback ───────────────────────────────────── */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*"    element={<Navigate to="/404" replace />} />

    </Routes>
  );
};

export default App;