import type { ReactNode } from 'react';
import { useState } from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const Layout = ({ children, isAuthenticated = false, user }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Navbar 
          isAuthenticated={isAuthenticated} 
          user={user} 
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Student Management</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            <div className="w-full max-w-6xl mx-auto">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
