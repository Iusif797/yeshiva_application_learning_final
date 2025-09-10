import { Link, useLocation } from 'react-router-dom';
import { Book, User, Users, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import OfflineIndicator from './OfflineIndicator';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { darkMode } = useTheme();
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: Book, label: 'Курсы' },
    { path: '/progress', icon: User, label: 'Прогресс' },
    { path: '/rabbi', icon: Users, label: 'Раввин' },
    { path: '/settings', icon: Settings, label: 'Настройки' },
  ];

  // Filter navigation based on user type
  const filteredNavItems = user?.role === 'rabbi' 
    ? navItems.filter(item => item.path !== '/progress')
    : navItems.filter(item => item.path !== '/rabbi');

  const backgroundClass = darkMode
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden'
    : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden';

  return (
    <div className={`min-h-screen min-h-[100dvh] flex flex-col ${backgroundClass} transition-colors duration-500`}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 ${
          darkMode ? 'bg-blue-500' : 'bg-purple-400'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 ${
          darkMode ? 'bg-purple-500' : 'bg-blue-400'
        }`}></div>
        <div className={`absolute top-1/3 left-1/4 w-32 h-32 rounded-full opacity-5 ${
          darkMode ? 'bg-green-500' : 'bg-pink-400'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/3 w-24 h-24 rounded-full opacity-5 ${
          darkMode ? 'bg-yellow-500' : 'bg-indigo-400'
        }`}></div>
      </div>
      
      {/* User info header */}
      {user && (
        <div className={`relative z-10 px-4 py-3 border-b backdrop-blur-lg safe-area-top ${
          darkMode 
            ? 'bg-slate-900/50 border-slate-700' 
            : 'bg-white/50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between max-w-screen-xl mx-auto">
            <div className="flex items-center">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-3 sm:mr-4 shadow-lg ${
                user.role === 'rabbi' 
                  ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                  : 'bg-gradient-to-br from-blue-500 to-blue-600'
              }`}>
                {localStorage.getItem('userAvatar') ? (
                  <img 
                    src={localStorage.getItem('userAvatar')!} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                {user.role === 'rabbi' ? (
                    <Users size={20} className="text-white" />
                ) : (
                    <User size={20} className="text-white" />
                )}
                )}
              </div>
              <div>
                <div className={`font-semibold text-sm sm:text-base truncate max-w-[120px] sm:max-w-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.name}
                </div>
                <div className={`text-xs hidden sm:block ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {user.role === 'rabbi' ? 'Раввин' : 'Ученик'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              user.role === 'rabbi'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
                <span className="hidden sm:inline">{user.nativeLanguage}</span>
                <span className="sm:hidden">{user.nativeLanguage.slice(0, 2)}</span>
              </div>
              <NotificationCenter />
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 pb-20 safe-area-bottom">
        {children}
      </main>
      
      <OfflineIndicator />
      
      <nav className={`fixed bottom-0 left-0 right-0 border-t backdrop-blur-lg shadow-2xl mobile-nav safe-area-bottom ${
        darkMode 
          ? 'bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-slate-600' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="flex justify-around items-center py-2 sm:py-3">
          {filteredNavItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center py-2 px-3 sm:px-4 rounded-xl transition-all duration-200 transform hover:scale-105 min-h-[44px] justify-center ${
                location.pathname === path
                  ? darkMode 
                    ? 'text-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/25'
                    : 'text-blue-600 bg-blue-100 shadow-lg shadow-blue-500/25'
                  : darkMode
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 hover:shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:shadow-lg'
              }`}
            >
              <Icon size={20} className="sm:w-6 sm:h-6" />
              <span className="text-xs mt-1 font-bold hidden sm:block">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}