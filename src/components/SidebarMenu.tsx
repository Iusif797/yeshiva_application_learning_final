import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  Book, 
  User, 
  Users, 
  Settings, 
  LogOut, 
  Star, 
  Trophy, 
  BarChart3,
  BookOpen,
  Crown,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const { darkMode } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [userStats, setUserStats] = useState({
    studyStreak: 15,
    totalLessons: 12,
    knownWords: 245,
    totalPoints: 850
  });

  useEffect(() => {
    // Load user stats from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserStats({
        studyStreak: profile.studyStreak || 15,
        totalLessons: profile.totalLessons || 12,
        knownWords: profile.knownWords || 245,
        totalPoints: profile.totalPoints || 850
      });
    }
  }, []);

  const navItems = [
    { 
      path: '/', 
      icon: Book, 
      label: 'Курсы', 
      description: 'Изучение Торы',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      path: '/progress', 
      icon: BarChart3, 
      label: 'Прогресс', 
      description: 'Ваши достижения',
      gradient: 'from-green-500 to-green-600'
    },
    { 
      path: '/rabbi', 
      icon: Users, 
      label: 'Раввин', 
      description: 'Управление курсами',
      gradient: 'from-purple-500 to-purple-600'
    },
    { 
      path: '/settings', 
      icon: Settings, 
      label: 'Настройки', 
      description: 'Персонализация',
      gradient: 'from-gray-500 to-gray-600'
    },
  ];

  // Filter navigation based on user type
  const filteredNavItems = user?.role === 'rabbi' 
    ? navItems.filter(item => item.path !== '/progress')
    : navItems.filter(item => item.path !== '/rabbi');

  const handleLogout = () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
      logout();
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        darkMode 
          ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900' 
          : 'bg-gradient-to-b from-white via-blue-50 to-purple-50'
      } shadow-2xl border-r ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10 ${
            darkMode ? 'bg-blue-500' : 'bg-purple-400'
          }`}></div>
          <div className={`absolute -bottom-20 -left-20 w-32 h-32 rounded-full opacity-10 ${
            darkMode ? 'bg-purple-500' : 'bg-blue-400'
          }`}></div>
        </div>

        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-opacity-20 border-gray-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-3 shadow-lg ${
                  user?.role === 'rabbi' 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                  <Crown size={24} className="text-white" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Yeshiva Learning
                  </h2>
                  <div className="flex items-center">
                    <Sparkles size={12} className="text-yellow-400 mr-1" />
                    <span className="text-xs text-yellow-400 font-medium">Premium</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${
                  darkMode 
                    ? 'hover:bg-slate-700 text-slate-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile */}
            {user && (
              <div className={`p-4 rounded-2xl border backdrop-blur-lg ${
                darkMode 
                  ? 'bg-slate-800/50 border-slate-600' 
                  : 'bg-white/80 border-gray-200'
              }`}>
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow-lg ${
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
                      user.role === 'rabbi' ? (
                        <Users size={20} className="text-white" />
                      ) : (
                        <User size={20} className="text-white" />
                      )
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {user.role === 'rabbi' ? 'Раввин' : 'Ученик'}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`text-center p-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                    <Star className="mx-auto mb-1 text-yellow-400" size={16} />
                    <div className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userStats.studyStreak}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      дней
                    </div>
                  </div>
                  <div className={`text-center p-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                    <Trophy className="mx-auto mb-1 text-purple-400" size={16} />
                    <div className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userStats.totalPoints}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      очков
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 p-6">
            <div className="space-y-2">
              {filteredNavItems.map(({ path, icon: Icon, label, description, gradient }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={`group flex items-center p-4 rounded-2xl transition-all duration-200 ${
                    location.pathname === path
                      ? darkMode 
                        ? 'bg-blue-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                        : 'bg-blue-100 border border-blue-200 shadow-lg shadow-blue-500/10'
                      : darkMode
                        ? 'hover:bg-slate-700/50 hover:shadow-lg'
                        : 'hover:bg-white/80 hover:shadow-lg'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      location.pathname === path
                        ? darkMode ? 'text-blue-400' : 'text-blue-600'
                        : darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {label}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {description}
                    </div>
                  </div>
                  <ChevronRight size={16} className={`${
                    location.pathname === path
                      ? darkMode ? 'text-blue-400' : 'text-blue-600'
                      : darkMode ? 'text-slate-400' : 'text-gray-400'
                  } group-hover:translate-x-1 transition-transform duration-200`} />
                </Link>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-opacity-20 border-gray-300">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center p-4 rounded-2xl font-semibold transition-all duration-200 ${
                darkMode
                  ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-800/30'
                  : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
              }`}
            >
              <LogOut size={20} className="mr-3" />
              Выйти
            </button>
          </div>
        </div>
      </div>
    </>
  );
}