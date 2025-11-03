import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  hideMobileBottomNav?: boolean;
}
export function Layout({
  children,
  showSidebar = true,
  hideMobileBottomNav = false
}: LayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();

  // Are we on the /chat route? If so, do not show Sidebar on desktop (just show navbar or mobile nav).
  const isChatPage = location.pathname.startsWith('/chat');

  // Helper function to determine if a route is active
  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  return <div className="h-screen flex flex-col bg-white dark:bg-black overflow-hidden">
      <Navbar />
      
      <div className="flex flex-1 relative min-h-0 overflow-hidden">
        {/* Desktop Sidebar */}
        {/* Always show main sidebar on desktop */}
        {showSidebar && !isMobile && <div className="fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-12 md:w-48 bg-gray-200 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 z-20 overflow-y-auto overflow-x-hidden">
            <Sidebar className="h-full" />
          </div>}
        
        {/* Main Content */}
        <main className={`
          flex flex-col flex-1 min-h-0 relative overflow-x-hidden overflow-y-auto
          ${!isMobile && showSidebar ? 'ml-12 md:ml-48' : 'ml-0'}
          bg-white dark:bg-black
       `}>
          {children}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      {/* Always show mobile bottom nav on
          - mobile devices
          - AND the Sidebar should be visible, including ChatPage (so user never gets stuck)
          - UNLESS explicitly hidden via hideMobileBottomNav */}
      {isMobile && showSidebar && !hideMobileBottomNav && <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-700 z-50">
          <div className="flex justify-around items-center py-2 px-4 h-16">
            <Link to="/home" className={`flex flex-col items-center min-w-0 flex-1 transition-colors ${isActiveRoute('/') ? 'text-mental-green-600 dark:text-mental-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-mental-green-600 dark:hover:text-mental-green-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link to="/chat" className={`flex flex-col items-center min-w-0 flex-1 transition-colors ${isActiveRoute('/chat') ? 'text-mental-green-600 dark:text-mental-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-mental-green-600 dark:hover:text-mental-green-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-xs mt-1">Chat</span>
            </Link>
            <Link to="/consult" className={`flex flex-col items-center min-w-0 flex-1 transition-colors ${isActiveRoute('/consult') ? 'text-mental-green-600 dark:text-mental-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-mental-green-600 dark:hover:text-mental-green-400'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 1 0 7.75" />
              </svg>
              <span className="text-xs mt-1">Consult</span>
            </Link>
            
          </div>
        </nav>}
    </div>;
}
export default Layout;