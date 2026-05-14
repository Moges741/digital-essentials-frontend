
import { Link, useNavigate } from 'react-router-dom';
import { BookMarked} from 'lucide-react';
import { useAuthStore }      from '../../store/auth.store';
import Button                from '../ui/Button';
import { getDashboardByRole } from '../../utils/constants';

const Navbar = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate                  = useNavigate();

  const handleGoToDashboard = () => {
    if (user) navigate(getDashboardByRole(user.role));
  };

  return (
    <nav className="
      fixed top-0 left-0 right-0 z-40 h-16
      bg-white/90 backdrop-blur-sm
      border-b border-gray-200
    ">
      <div className="h-full max-w-screen-xl mx-auto px-4
                       flex items-center justify-between">

        {/* Hamburger + Logo */}
        <div className="flex items-center gap-2">
          
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold
                         text-primary-700 hover:text-primary-800
                         transition-colors"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg
                              flex items-center justify-center">
              <BookMarked size={17} className="text-white" />
            </div>
            <span className="hidden sm:block text-base">
              Digital Essentials
            </span>
          </Link>
        </div>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/courses"
            className="text-sm text-gray-600 hover:text-primary-600
                         font-medium transition-colors"
          >
            Courses
          </Link>
        </div>

        {/* Right — auth */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            /* Already logged in — go to their dashboard */
            <Button
              size="sm"
              onClick={handleGoToDashboard}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;