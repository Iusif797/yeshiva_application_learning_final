import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types/global';
import { notificationService } from '../lib/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
              
            if (profile) {
              setUser({
                id: session.user.id,
                email: session.user.email!,
                name: profile.name,
                role: profile.user_type,
                nativeLanguage: profile.native_language,
                created_at: profile.created_at || new Date().toISOString()
              });
            }
          }
        } catch (supabaseError) {
          console.warn('Supabase auth check failed, falling back to demo mode:', supabaseError);
          // Fall back to localStorage check
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            setShowAuthModal(true);
          }
        }
      } else {
        // Demo mode - check localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          setShowAuthModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setShowAuthModal(true);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
    
    // Сохраняем реальные данные пользователя
    const userProfile = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      nativeLanguage: userData.nativeLanguage,
      nativeLanguageCode: userData.nativeLanguage === 'Русский' ? 'ru' : 
                         userData.nativeLanguage === 'English' ? 'en' : 
                         userData.nativeLanguage === 'עברית' ? 'he' : 'ru',
      studyStreak: 0, // Начинаем с нуля
      totalLessons: 0, // Начинаем с нуля
      knownWords: 0, // Начинаем с нуля
      totalPoints: 0, // Начинаем с нуля
      joinedAt: new Date().toISOString()
    };
    
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // Создаем приветственное уведомление для новых пользователей
    createWelcomeNotification(userData);
    
    setShowAuthModal(false);
  };

  const createWelcomeNotification = async (user: User) => {
    try {
      if (supabase && user.id) {
        await notificationService.create(
          user.id,
          'Добро пожаловать!',
          `Добро пожаловать в Yeshiva Learning, ${user.name}! Начните свое путешествие изучения Торы и иврита.`,
          'success'
        );
      }
      
      // Локальное уведомление как резерв
      const notifications = JSON.parse(localStorage.getItem('demoNotifications') || '[]');
      notifications.unshift({
        id: Date.now().toString(),
        title: 'Добро пожаловать!',
        message: `Добро пожаловать в Yeshiva Learning, ${user.name}! Начните свое путешествие изучения Торы и иврита.`,
        type: 'success',
        is_read: false,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('demoNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error creating welcome notification:', error);
    }
  };
  const logout = async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userProfile');
      setUser(null);
      setShowAuthModal(true);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      showAuthModal,
      setShowAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};