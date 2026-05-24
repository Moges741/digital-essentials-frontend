// src/App.tsx
// Complete route definitions for the Digital Essentials Platform

import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import OfflineBanner from './components/ui/OfflineBanner';

// Guards
import ProtectedRoute from './components/guards/ProtectedRoute';
import RoleGuard from './components/guards/RoleGuard';

// Public pages
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';
import CoursesPage from './pages/courses/CoursesPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import ApplyMentorPage from './pages/home/ApplyMentorPage';

// Learner pages
import LearnerDashboard from './pages/dashboard/LearnerDashboard';
import LessonPage from './pages/lessons/LessonPage';
import ProgressPage from './pages/progress/ProgressPage';
import CertificatesPage from './pages/certificates/CertificatesPage';
import ExercisePage from './pages/exercises/ExercisePage';

// Mentor pages
import MentorDashboard from './pages/dashboard/MentorDashboard';
import CreateCoursePage from './pages/courses/CreateCoursePage';
import CreateLessonPage from './pages/lessons/CreateLessonPage';
import EditLessonPage from './pages/lessons/EditLessonPage';
import CreateMaterialPage from './pages/materials/CreateMaterialPage';
import ExamBuilderPage from './pages/exam/ExamBuilderPage';
import FinalExamPage from './pages/exam/FinalExamPage';
import ExamResultPage from './pages/exam/ExamResultPage';
import ExamReviewPage from './pages/exam/ExamReviewPage';
import ExamSubmissionPage from './pages/exam/ExamSubmissionPage';

// Admin pages
import AdminPanel from './pages/dashboard/AdminPanel';
import AdminUsers from './pages/dashboard/AdminUsers';
import AdminCertificates from './pages/dashboard/AdminCertificates.tsx';
import AdminMentors from './pages/dashboard/AdminMentors';
import AdminMentorApplications from './pages/dashboard/AdminMentorApplications';

// Shared pages
import ChatPage from './pages/chat/ChatPage';

// ────────────────────────────────────────────────────
// Auth Layout — sidebar layout
// ────────────────────────────────────────────────────
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <OfflineBanner />
    <DashboardLayout>{children}</DashboardLayout>
  </>
);

// ────────────────────────────────────────────────────
// Public Layout — navbar + footer
// ────────────────────────────────────────────────────
interface PublicLayoutProps {
  children: React.ReactNode;
  noPaddingTop?: boolean;
}

const PublicLayout = ({
  children,
  noPaddingTop = false,
}: PublicLayoutProps) => (
  <div className="flex flex-col min-h-screen">
    <OfflineBanner />

    <Navbar />

    <main
      className={`flex-1 ${
        noPaddingTop ? 'pt-0' : 'pt-24 sm:pt-28'
      }`}
    >
      {children}
    </main>

    <Footer />
  </div>
);

// ────────────────────────────────────────────────────
// App
// ────────────────────────────────────────────────────
const App = () => {
  return (
    <Routes>

      {/* ── Home Page (NO top padding) ───────────── */}
      <Route
        path="/"
        element={
          <PublicLayout noPaddingTop>
            <HomePage />
          </PublicLayout>
        }
      />

      {/* ── Public Routes ────────────────────────── */}
      <Route
        path="/login"
        element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        }
      />

      <Route
        path="/register"
        element={
          <PublicLayout>
            <RegisterPage />
          </PublicLayout>
        }
      />

      <Route
        path="/verify-email"
        element={
          <PublicLayout>
            <VerifyEmailPage />
          </PublicLayout>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicLayout>
            <ForgotPasswordPage />
          </PublicLayout>
        }
      />

      <Route
        path="/reset-password"
        element={
          <PublicLayout>
            <ResetPasswordPage />
          </PublicLayout>
        }
      />

      <Route
        path="/auth/google/callback"
        element={
          <PublicLayout>
            <GoogleCallbackPage />
          </PublicLayout>
        }
      />

      <Route
        path="/courses"
        element={
          <PublicLayout>
            <CoursesPage />
          </PublicLayout>
        }
      />

      <Route
        path="/courses/:course_id"
        element={
          <PublicLayout>
            <CourseDetailPage />
          </PublicLayout>
        }
      />

      <Route
        path="/apply-mentor"
        element={
          <PublicLayout>
            <ApplyMentorPage />
          </PublicLayout>
        }
      />

      {/* ── Protected Routes ─────────────────────── */}
      <Route element={<ProtectedRoute />}>

        {/* Change password */}
        <Route
          path="/change-password"
          element={
            <PublicLayout>
              <ChangePasswordPage />
            </PublicLayout>
          }
        />

        {/* Shared authenticated routes */}
        <Route path="/chat" element={<ChatPage />} />

        {/* ── Learner Routes ─────────────────────── */}
        <Route element={<RoleGuard allowedRoles={['learner']} />}>

          <Route
            path="/dashboard"
            element={
              <AuthLayout>
                <LearnerDashboard />
              </AuthLayout>
            }
          />

          <Route
            path="/dashboard/progress"
            element={
              <AuthLayout>
                <ProgressPage />
              </AuthLayout>
            }
          />

          <Route
            path="/dashboard/certificates"
            element={
              <AuthLayout>
                <CertificatesPage />
              </AuthLayout>
            }
          />

          <Route
            path="/courses/:course_id/lessons/:lesson_id"
            element={
              <AuthLayout>
                <LessonPage />
              </AuthLayout>
            }
          />

          <Route
            path="/courses/:course_id/exercises/:exercise_id"
            element={
              <AuthLayout>
                <ExercisePage />
              </AuthLayout>
            }
          />
        </Route>

        {/* ── Mentor + Admin Routes ─────────────── */}
        <Route
          element={
            <RoleGuard allowedRoles={['mentor', 'administrator']} />
          }
        >

          <Route
            path="/mentor"
            element={
              <AuthLayout>
                <MentorDashboard />
              </AuthLayout>
            }
          />

          <Route
            path="/mentor/courses/create"
            element={
              <AuthLayout>
                <CreateCoursePage />
              </AuthLayout>
            }
          />

          <Route
            path="/mentor/courses/:course_id/lessons/create"
            element={
              <AuthLayout>
                <CreateLessonPage />
              </AuthLayout>
            }
          />

          <Route
            path="/mentor/courses/:course_id/materials/create"
            element={
              <AuthLayout>
                <CreateMaterialPage />
              </AuthLayout>
            }
          />

          <Route
            path="/mentor/courses/:course_id/lessons/:lesson_id/edit"
            element={
              <AuthLayout>
                <EditLessonPage />
              </AuthLayout>
            }
          />
        </Route>

        {/* ── Learner Exam Routes ────────────────── */}
        <Route
          path="/courses/:course_id/exam"
          element={
            <AuthLayout>
              <FinalExamPage />
            </AuthLayout>
          }
        />

        <Route
          path="/courses/:course_id/exam/result"
          element={
            <AuthLayout>
              <ExamResultPage />
            </AuthLayout>
          }
        />

        {/* ── Mentor Exam Routes ─────────────────── */}
        <Route
          path="/mentor/courses/:course_id/exam"
          element={
            <AuthLayout>
              <ExamBuilderPage />
            </AuthLayout>
          }
        />

        <Route
          path="/mentor/courses/:course_id/exam/review"
          element={
            <AuthLayout>
              <ExamReviewPage />
            </AuthLayout>
          }
        />

        <Route
          path="/mentor/courses/:course_id/exam/submission/:submission_id"
          element={
            <AuthLayout>
              <ExamSubmissionPage />
            </AuthLayout>
          }
        />

        {/* ── Admin Only Routes ──────────────────── */}
        <Route
          element={
            <RoleGuard allowedRoles={['administrator']} />
          }
        >

          <Route
            path="/admin"
            element={
              <AuthLayout>
                <AdminPanel />
              </AuthLayout>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AuthLayout>
                <AdminUsers />
              </AuthLayout>
            }
          />

          <Route
            path="/admin/certificates"
            element={
              <AuthLayout>
                <AdminCertificates />
              </AuthLayout>
            }
          />

          <Route
            path="/admin/mentors"
            element={
              <AuthLayout>
                <AdminMentors />
              </AuthLayout>
            }
          />

          <Route
            path="/admin/mentor-applications"
            element={
              <AuthLayout>
                <AdminMentorApplications />
              </AuthLayout>
            }
          />
        </Route>

      </Route>

      {/* ── Fallback Routes ─────────────────────── */}
      <Route path="/404" element={<NotFoundPage />} />

      <Route
        path="*"
        element={<Navigate to="/404" replace />}
      />

    </Routes>
  );
};

export default App;