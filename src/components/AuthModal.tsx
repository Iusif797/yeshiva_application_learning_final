import { useState } from 'react';
import { X, User, Users, Mail, Lock, Eye, EyeOff, BookOpen, Star, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User as UserType } from '../types/global';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const { darkMode } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'student' | 'rabbi'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    nativeLanguage: 'Русский'
  });

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'he', name: 'עברית', flag: '🇮🇱' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    if (!isLogin && !formData.name.trim()) {
      setError('Пожалуйста, введите ваше имя');
      return;
    }
    
    setLoading(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        if (isLogin) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (error) throw error;

          // Get user profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          if (data.user) {
            const user: UserType = {
              id: data.user.id,
              email: data.user.email || '',
              name: profile?.name || '',
              role: profile?.user_type as 'student' | 'rabbi' || 'student',
              nativeLanguage: profile?.native_language || 'Русский',
              created_at: data.user.created_at || new Date().toISOString()
            };
            onAuthSuccess(user);
          }
        } else {
          const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                name: formData.name,
                user_type: userType,
                native_language: formData.nativeLanguage
              }
            }
          });

          if (error) throw error;

          // Create user profile
          if (data.user) {
            try {
              const { error: profileError } = await supabase.from('user_profiles').insert({
                user_id: data.user.id,
                name: formData.name,
                user_type: userType,
                native_language: formData.nativeLanguage
              });

              if (profileError) {
                console.warn('Profile creation error:', profileError);
                // Continue anyway for demo purposes
              }
            } catch (profileError) {
              console.warn('Profile creation failed, continuing with demo mode:', profileError);
            }
          }

          if (data.user) {
            const user: UserType = {
              id: data.user.id,
              email: data.user.email || '',
              name: formData.name,
              role: userType,
              nativeLanguage: formData.nativeLanguage,
              created_at: data.user.created_at || new Date().toISOString()
            };
            onAuthSuccess(user);
          }
        }
      } else {
        // Demo mode - save to localStorage
        const userData: UserType = {
          id: Date.now().toString(),
          email: formData.email,
          name: formData.name,
          role: userType,
          nativeLanguage: formData.nativeLanguage,
          created_at: new Date().toISOString()
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('userProfile', JSON.stringify({
          name: formData.name,
          email: formData.email,
          nativeLanguage: formData.nativeLanguage,
          nativeLanguageCode: languages.find(l => l.name === formData.nativeLanguage)?.code || 'ru',
          studyStreak: 0,
          totalLessons: 0,
          knownWords: 0
        }));

        onAuthSuccess(userData);
      }
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка при входе/регистрации');
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
      } else {
        alert('OAuth недоступен в демо-режиме.');
      }
    } catch (error: any) {
      alert(error.message || 'Не удалось выполнить вход через Google');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`relative max-w-md w-full rounded-3xl overflow-hidden shadow-2xl ${darkMode
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-white via-blue-50 to-purple-50'
        }`}>
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 ${darkMode ? 'bg-blue-500' : 'bg-purple-400'
            }`}></div>
          <div className={`absolute -bottom-10 -left-10 w-24 h-24 rounded-full opacity-20 ${darkMode ? 'bg-purple-500' : 'bg-blue-400'
            }`}></div>
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-10 ${darkMode ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-purple-400 to-blue-400'
            }`}></div>
        </div>

        <div className="relative p-8">
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${darkMode
                ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BookOpen size={32} className="text-white" />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {isLogin ? 'Добро пожаловать!' : 'Присоединяйтесь к нам'}
            </h2>
            <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-600/20 border border-red-600/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* User Type Selection (only for registration) */}
          {!isLogin && (
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                Тип аккаунта
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('student')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${userType === 'student'
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg'
                      : darkMode
                        ? 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                >
                  <User size={24} className={`mx-auto mb-2 ${userType === 'student' ? 'text-blue-500' : darkMode ? 'text-slate-400' : 'text-gray-500'
                    }`} />
                  <div className={`text-sm font-semibold ${userType === 'student' ? 'text-blue-500' : darkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                    Ученик
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('rabbi')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${userType === 'rabbi'
                      ? 'border-purple-500 bg-purple-500/10 shadow-lg'
                      : darkMode
                        ? 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                >
                  <Users size={24} className={`mx-auto mb-2 ${userType === 'rabbi' ? 'text-purple-500' : darkMode ? 'text-slate-400' : 'text-gray-500'
                    }`} />
                  <div className={`text-sm font-semibold ${userType === 'rabbi' ? 'text-purple-500' : darkMode ? 'text-slate-300' : 'text-gray-700'
                    }`}>
                    Раввин
                  </div>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (only for registration) */}
            {!isLogin && (
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Полное имя
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${darkMode
                      ? 'bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:bg-slate-800'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-blue-50/50'
                    }`}
                  placeholder="Введите ваше имя"
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                Email
              </label>
              <div className="relative">
                <Mail size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-slate-400' : 'text-gray-400'
                  }`} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${darkMode
                      ? 'bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:bg-slate-800'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-blue-50/50'
                    }`}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                Пароль
              </label>
              <div className="relative">
                <Lock size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-slate-400' : 'text-gray-400'
                  }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${darkMode
                      ? 'bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:bg-slate-800'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:bg-blue-50/50'
                    }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Native Language (only for registration) */}
            {!isLogin && (
              <div>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Родной язык
                </label>
                <select
                  value={formData.nativeLanguage}
                  onChange={(e) => setFormData({ ...formData, nativeLanguage: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${darkMode
                      ? 'bg-slate-800/50 border-slate-600 text-white focus:border-blue-500'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                    }`}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.name}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-200 shadow-lg transform hover:scale-105 ${userType === 'rabbi'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:shadow-purple-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/25'
                } ${loading ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Загрузка...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {isLogin ? (
                    <>
                      <Star size={20} className="mr-2" />
                      Войти
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} className="mr-2" />
                      Создать аккаунт
                    </>
                  )}
                </div>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4">
              <button
                type="button"
                onClick={signInWithGoogle}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${darkMode
                    ? 'border-2 border-slate-600 text-slate-200 hover:bg-slate-700/50'
                    : 'border-2 border-gray-300 text-gray-800 hover:bg-gray-100'
                  }`}
              >
                Войти через Google
              </button>
            </div>
          )}

          {/* Toggle Login/Register */}
          <div className="text-center mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className={`text-sm font-semibold transition-colors ${darkMode
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-700'
                }`}
            >
              {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}