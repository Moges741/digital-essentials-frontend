
import type { ReactNode }  from 'react';
import Navbar         from './Navbar';
import Sidebar        from './Sidebar';
import { useUIStore } from '../../store/ui.store';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      {/* Main content shifts right when sidebar is open */}
      <main className={`
        pt-16 min-h-screen
        transition-all duration-200 ease-in-out
        ${sidebarOpen ? 'md:ml-60' : 'ml-0'}
      `}>
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;