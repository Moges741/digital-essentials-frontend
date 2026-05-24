
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen,
  BarChart2, Award, MessageCircle,
  PlusCircle, Users, Settings, ScrollText,
  BookMarked, LogOut, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { RoleBadge } from '../ui/Badge';
import toast            from 'react-hot-toast';

interface NavItem {
  label:   string;
  to:      string;
  icon:    React.ReactNode;
  end?:    boolean;
}

interface NavGroup {
  group:  string;
  items:  NavItem[];
}

// ── Learner navigation ────────────────────────────────────────
const learnerNav: NavGroup[] = [
  {
    group: 'Learning',
    items: [
      {
        label: 'Dashboard',
        to:    '/dashboard',
        icon:  <LayoutDashboard size={17} />,
        end:   true,
      },
      {
        label: 'Browse Courses',
        to:    '/courses',
        icon:  <BookOpen size={17} />,
      },
      {
        label: 'My Progress',
        to:    '/dashboard/progress',
        icon:  <BarChart2 size={17} />,
      },
      {
        label: 'Certificates',
        to:    '/dashboard/certificates',
        icon:  <Award size={17} />,
      },
     
    ],
  },
  {
    group: 'Tools',
    items: [
      {
        label: 'AI Assistant',
        to:    '/chat',
        icon:  <MessageCircle size={17} />,
      },
    ],
  },
];

// ── Instructor navigation ─────────────────────────────────────────
const instructorNav: NavGroup[] = [
  {
    group: 'Teaching',
    items: [
      {
        label: 'Dashboard',
        to:    '/instructor',
        icon:  <LayoutDashboard size={17} />,
        end:   true,
      },
      {
        label: 'Browse Courses',
        to:    '/courses',
        icon:  <BookOpen size={17} />,
      },
      {
        label: 'Create Course',
        to:    '/instructor/courses/create',
        icon:  <PlusCircle size={17} />,
      },
    ],
  },
  {
    group: 'Tools',
    items: [
      {
        label: 'AI Assistant',
        to:    '/chat',
        icon:  <MessageCircle size={17} />,
      },
    ],
  },
];

// ── Admin navigation ──────────────────────────────────────────
const adminNav: NavGroup[] = [
  {
    group: 'Management',
    items: [
      {
        label: 'Admin Panel',
        to:    '/admin',
        icon:  <Settings size={17} />,
        end:   true,
      },
      {
        label: 'All Courses',
        to:    '/courses',
        icon:  <BookOpen size={17} />,
      },
      {
        label: 'Users',
        to:    '/admin/users',
        icon:  <Users size={17} />,
      },
      {
        label: 'Manage Certificates',
        to:    '/admin/certificates',
        icon:  <ScrollText size={17} />,
      },
      {
        label: 'Instructor Applications',
        to:    '/admin/instructor-applications',
        icon:  <FileText size={17} />,
      },
       {
        label :'Instructors',
        to:    '/admin/instructors',
        icon:  <Users size={17} />,
      }
    ],
  },
  {
    group: 'Tools',
    items: [
      {
        label: 'AI Assistant',
        to:    '/chat',
        icon:  <MessageCircle size={17} />,
      },
    ],
  },
];

const navByRole: Record<string, NavGroup[]> = {
  learner:       learnerNav,
  mentor:        instructorNav,
  administrator: adminNav,
};

// ── Nav item ──────────────────────────────────────────────────
const SidebarNavItem = ({ item, sidebarOpen, onNavigate }: { item: NavItem; sidebarOpen: boolean; onNavigate: () => void }) => (
  <NavLink
    to={item.to}
    end={item.end}
    onClick={onNavigate}
    className={({ isActive }) => `
      flex items-center gap-3 px-3 py-2 rounded-lg
      text-sm font-medium transition-all duration-150
      ${isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      }
      ${!sidebarOpen && 'justify-center'}
    `}
    title={!sidebarOpen ? item.label : undefined}
  >
    <span className="flex-shrink-0">{item.icon}</span>
    {sidebarOpen && <span className="truncate">{item.label}</span>}
  </NavLink>
);

// ── Main Sidebar ──────────────────────────────────────────────
const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate         = useNavigate();

  const groups = navByRole[user?.role ?? 'learner'] ?? learnerNav;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-40
        bg-white border-r border-gray-200
        flex flex-col
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-56' : 'w-16'}
      `}>

      {/* ── Logo ───────────────────────────────────────── */}
      <Link to='/'>
            <div className={`flex items-center gap-2.5 px-4 py-4
                       border-b border-gray-100 flex-shrink-0
                       ${!sidebarOpen && 'justify-center px-0'}`}>
        <div className="w-8 h-8 bg-primary-600 rounded-lg
                          flex items-center justify-center flex-shrink-0">
          <BookMarked size={16} className="text-white" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0 transition-opacity duration-300">
            <p className="text-sm font-bold text-gray-900 truncate leading-tight">
              Digital Essentials
            </p>
            <p className="text-xs text-gray-400 truncate leading-tight">
              Learning Platform
            </p>
          </div>
        )}
      </div>
      </Link>


      {/* ── Navigation ─────────────────────────────────── */}
      <nav className={`flex-1 overflow-y-auto py-3 flex flex-col gap-5 ${sidebarOpen ? 'px-3' : 'px-2'}`}>
        {groups.map((group) => (
          <div key={group.group}>

            {/* Group label */}
            {sidebarOpen ? (
              <p className="text-xs font-semibold text-gray-400
                              uppercase tracking-widest px-3 mb-1.5 line-clamp-1 truncate">
                {group.group}
              </p>
            ) : (
              <div className="h-4" /> // spacer when collapsed
            )}

            {/* Group items */}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <SidebarNavItem 
                    key={item.to} 
                    item={item} 
                    sidebarOpen={sidebarOpen}
                    onNavigate={() => {}}
                />
              ))}
            </div>

          </div>
        ))}
      </nav>

      {/* ── User profile + logout ───────────────────────── */}
      <div className={`flex-shrink-0 border-t border-gray-100 p-3 flex flex-col`}>

        {/* Content Toggle Button */}
        <div className={`flex ${sidebarOpen ? 'justify-end' : 'justify-center'} mb-2`}>
           <button
             onClick={toggleSidebar}
             className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
             aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
           >
             {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
           </button>
        </div>

        {/* User info row */}
        <div className={`flex items-center gap-2.5 px-2 py-2 mb-1 ${!sidebarOpen && 'justify-center mx-auto px-0'}`}>
          {/* Avatar */}
          <div className="w-8 h-8 bg-primary-100 rounded-full
                            flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary-700">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0 transition-opacity duration-300">
              <p className="text-xs font-semibold text-gray-800 truncate leading-tight">
                {user?.username}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500 truncate leading-tight">
                {user?.email}
              </p>
              <div className="mt-1">
                <RoleBadge role={user?.role ?? ''} />
              </div>
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 py-2 rounded-lg
            text-sm font-medium text-gray-500
            hover:bg-red-50 hover:text-red-600
            transition-colors duration-150
            ${sidebarOpen ? 'px-3' : 'justify-center px-0'}
          `}
          title={!sidebarOpen ? `Sign out` : undefined}
        >
          <LogOut size={16} />
          {sidebarOpen && <span>Sign out</span>}
        </button>

      </div>
    </aside>
    </>
  );
};

export default Sidebar;