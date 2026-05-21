import { Link, useNavigate } from 'react-router-dom';
import { BookMarked, MessageCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import Button from '../ui/Button';
import { getDashboardByRole } from '../../utils/constants';

const Navbar = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    if (user) navigate(getDashboardByRole(user.role));
  };

  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-3 sm:px-5">
      <div className="relative mx-auto max-w-screen-xl overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-3xl supports-[backdrop-filter]:bg-white/8">

        {/* soft glass gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/15 via-white/[0.03] to-transparent" />

        {/* subtle shine */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -left-10 top-0 h-full w-40 rotate-12 bg-white/10 blur-2xl" />
        </div>

        {/* border glow */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

        <div className="relative flex h-16 items-center justify-between gap-4 px-4">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="group flex items-center gap-3 rounded-full px-2 py-1.5 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/90 to-primary-700/90 shadow-lg shadow-primary-500/20 ring-1 ring-white/20 backdrop-blur-md">
                <BookMarked size={18} className="text-white" />
              </div>

              <div className="hidden sm:block leading-tight">
                <span className="block text-[15px] font-semibold tracking-tight text-blue-700 group-hover:text-primary-700 transition-colors">
                  Digital Essentials
                </span>
              </div>
            </Link>
          </div>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2 py-1 backdrop-blur-xl">
            <Link
              to="/courses"
              className="rounded-full px-4 py-2 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-white/20 hover:text-primary-900"
            >
              Courses
            </Link>
            {(!isAuthenticated || user?.role === 'learner') && (
              <Link
                to="/apply-mentor"
                className="rounded-full px-4 py-2 text-sm font-medium text-blue-700 transition-all duration-200 hover:bg-white/20 hover:text-primary-900"
              >
                Become a Mentor
              </Link>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/chat"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-blue-700 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20 hover:text-primary-900"
                >
                  <MessageCircle size={16} />
                  <span className="hidden sm:inline">
                    AI Assistant
                  </span>
                </Link>

                <Button
                  size="sm"
                  onClick={handleGoToDashboard}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-primary-600/90 shadow-lg shadow-primary-500/20 backdrop-blur-xl"
                >
                  <Sparkles size={16} />
                  <span>Dashboard</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full border border-white/10 bg-white/10 backdrop-blur-xl"
                  >
                    Sign in
                  </Button>
                </Link>

                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="rounded-full border border-white/10 bg-primary-600/90 shadow-lg shadow-primary-500/20 backdrop-blur-xl"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;