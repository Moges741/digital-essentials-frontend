
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, BookOpen, MessageCircle, User } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore }   from '../../store/ui.store';
import { RoleBadge }    from '../ui/Badge';
import Button           from '../ui/Button';
import toast            from 'react-hot-toast';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleSidebar }                 = useUIStore();
  const navigate                          = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="h-full max-w-screen-2xl mx-auto px-4 flex items-center justify-between">

        {/* Left — Logo + Sidebar toggle */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
          )}

          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-primary-700 text-lg"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="hidden sm:block">Digital Essentials</span>
          </Link>
        </div>

        {/* Center — Nav links (public) */}
        {!isAuthenticated && (
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/courses"
              className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Courses
            </Link>
          </div>
        )}

        {/* Right — Auth actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* AI Chat button */}
              <Link
                to="/chat"
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="AI Assistant"
              >
                <MessageCircle size={20} />
              </Link>

              {/* User info */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={14} className="text-primary-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-800 leading-none">
                    {user?.name}
                  </span>
                  <div className="mt-0.5">
                    <RoleBadge role={user?.role ?? ''} />
                  </div>
                </div>
              </div>

              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut size={15} />}
              >
                <span className="hidden sm:block">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;