
import type { ReactNode } from 'react';
import Sidebar       from './Sidebar';
import { useUIStore } from '../../store/ui.store';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Fixed sidebar — always visible on desktop, togglable on mobile */}
      <Sidebar />

      {/* Main content — offset by sidebar width on desktop */}
      <main className={`flex-1 min-h-screen overflow-y-auto
                        transition-all duration-300
                        ${sidebarOpen ? 'ml-56' : 'ml-16'}`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;