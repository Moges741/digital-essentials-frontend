
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, GraduationCap,
  BarChart2, Award, MessageCircle,
  PlusCircle, Users, Settings,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore }   from '../../store/ui.store';

interface NavItem {
  label: string;
  to:    string;
  icon:  React.ReactNode;
}

const learnerNav: NavItem[] = [
  { label: 'Dashboard',    to: '/dashboard',              icon: <LayoutDashboard size={18} /> },
  { label: 'Courses',      to: '/courses',                icon: <BookOpen size={18} /> },
  { label: 'My Learning',  to: '/dashboard/enrollments',  icon: <GraduationCap size={18} /> },
  { label: 'Progress',     to: '/dashboard/progress',     icon: <BarChart2 size={18} /> },
  { label: 'Certificates', to: '/dashboard/certificates', icon: <Award size={18} /> },
  { label: 'AI Chat',      to: '/chat',                   icon: <MessageCircle size={18} /> },
];

const mentorNav: NavItem[] = [
  { label: 'Dashboard',     to: '/mentor',                icon: <LayoutDashboard size={18} /> },
  { label: 'Courses',       to: '/courses',               icon: <BookOpen size={18} /> },
  { label: 'Create Course', to: '/mentor/courses/create', icon: <PlusCircle size={18} /> },
  { label: 'AI Chat',       to: '/chat',                  icon: <MessageCircle size={18} /> },
];

const adminNav: NavItem[] = [
  { label: 'Admin Panel',   to: '/admin',   icon: <Settings size={18} /> },
  { label: 'Courses',       to: '/courses', icon: <BookOpen size={18} /> },
  { label: 'Users',         to: '/admin/users', icon: <Users size={18} /> },
  { label: 'AI Chat',       to: '/chat',    icon: <MessageCircle size={18} /> },
];

const navByRole: Record<string, NavItem[]> = {
  learner:       learnerNav,
  mentor:        mentorNav,
  administrator: adminNav,
};

const Sidebar = () => {
  const user        = useAuthStore((state) => state.user);
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  const navItems = navByRole[user?.role ?? 'learner'] ?? learnerNav;

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 md:hidden" />
      )}

      {/* Sidebar panel */}
      <aside className={`
        fixed top-16 left-0 bottom-0 z-30
        w-60 bg-white border-r border-gray-200
        flex flex-col
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-sm font-medium transition-colors duration-150
                    ${isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom — user name */}
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Signed in as</p>
          <p className="text-sm font-semibold text-gray-700 truncate mt-0.5">
            {user?.name}
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;