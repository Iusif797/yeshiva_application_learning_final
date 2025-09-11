import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { User, Settings, Sun, Moon, LogOut, Edit, Check, X, Bell, Volume2, ChevronDown, BookOpen, BarChart2, Star, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImageUploader from '../components/ImageUploader';
import PremiumToggle from '../components/PremiumToggle';

interface UserProfile {
  name: string;
  email: string;
  nativeLanguage: string;
  nativeLanguageCode: string;
  studyStreak: number;
  totalLessons: number;
  knownWords: number;
  avatar?: string;
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [rtlMode, setRtlMode] = useState(true);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: user?.name || 'Давид Коэн',
    email: user?.email || 'david.cohen@example.com',
    nativeLanguage: user?.nativeLanguage || 'Русский',
    nativeLanguageCode: 'ru',
    studyStreak: 15,
    totalLessons: 12,
    knownWords: 245,
    avatar: localStorage.getItem('userAvatar') || undefined
  });

  const [tempProfile, setTempProfile] = useState(userProfile);

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'he', name: 'עברית', flag: '🇮🇱' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' }
  ];

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        const profileWithAvatar = {
          ...parsedProfile,
          avatar: localStorage.getItem('userAvatar') || undefined
        };
        setUserProfile(profileWithAvatar);
        setTempProfile(profileWithAvatar);
      }
    } catch (error) {
      console.warn('Failed to parse user profile from localStorage:', error);
    }

    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setNotifications(settings.notifications ?? true);
        setAutoPlay(settings.autoPlay ?? false);
        setRtlMode(settings.rtlMode ?? true);
      }
    } catch (error) {
      console.warn('Failed to parse app settings from localStorage:', error);
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      notifications,
      autoPlay,
      rtlMode
    };
    localStorage.setItem('appSettings', JSON.stringify(settings));
    showSavedMessage(t('settings.settingsSaved'));
  };

  const handleSaveProfile = () => {
    setUserProfile(tempProfile);
    localStorage.setItem('userProfile', JSON.stringify(tempProfile));
    setShowProfileEdit(false);
    showSavedMessage(t('settings.settingsSaved'));
  };

  const handleImageChange = (imageUrl: string) => {
    const updatedProfile = { ...tempProfile, avatar: imageUrl };
    setTempProfile(updatedProfile);
    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    showSavedMessage('Фото профиля обновлено!');
  };

  const showSavedMessage = (message: string) => {
    setSavedMessage(message);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleLanguageChange = (languageCode: string) => {
    const selectedLang = languages.find(lang => lang.code === languageCode);
    if (selectedLang) {
      i18n.changeLanguage(languageCode);
      setShowLanguageSelect(false);
      showSavedMessage(t('settings.languageChangedTo', { language: selectedLang.name }));
    }
  };

  const handleLogout = () => {
    if (confirm(t('settings.logoutConfirmation'))) {
      logout();
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-5 ${
          darkMode ? 'bg-blue-500' : 'bg-purple-400'
        }`}></div>
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-5 ${
          darkMode ? 'bg-purple-500' : 'bg-blue-400'
        }`}></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 pt-16 sm:pt-20">
        {/* Success Message */}
        {savedMessage && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center backdrop-blur-lg">
            <Check size={20} className="mr-2" />
            {savedMessage}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t('settings.title')}
          </h1>
          <p className={`text-base sm:text-lg ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Персонализируйте свой опыт обучения
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Profile Section */}
            <div className="lg:col-span-1">
              <div className={`rounded-3xl p-6 sm:p-8 shadow-2xl border backdrop-blur-lg ${
                darkMode 
                  ? 'bg-slate-800/50 border-slate-600' 
                  : 'bg-white/80 border-gray-200'
              }`}>
                <div className="flex items-center mb-6">
                  <User size={28} className="mr-4 text-blue-400" />
                  <h2 className={`text-xl sm:text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('settings.profile')}
                  </h2>
                </div>

                {showProfileEdit ? (
                  <div className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex justify-center">
                      <ImageUploader
                        currentImage={tempProfile.avatar}
                        onImageChange={handleImageChange}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {t('settings.name')}
                      </label>
                      <input
                        type="text"
                        value={tempProfile.name}
                        onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                          darkMode 
                            ? 'bg-slate-700/50 border-slate-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {t('settings.email')}
                      </label>
                      <input
                        type="email"
                        value={tempProfile.email}
                        onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                          darkMode 
                            ? 'bg-slate-700/50 border-slate-600 text-white focus:border-blue-500' 
                            : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                        }`}
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button 
                        onClick={() => setShowProfileEdit(false)} 
                        className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          darkMode 
                            ? 'bg-slate-600 hover:bg-slate-500 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                      >
                        <X size={18} className="inline-block mr-2" />
                        {t('settings.cancel')}
                      </button>
                      <button 
                        onClick={handleSaveProfile} 
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                      >
                        <Check size={18} className="inline-block mr-2" />
                        {t('settings.save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                      <ImageUploader
                        currentImage={userProfile.avatar}
                        onImageChange={handleImageChange}
                      />
                      <div className="text-center sm:text-left">
                        <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {userProfile.name}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {userProfile.email}
                        </p>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          <strong>{t('settings.nativeLanguage')}:</strong> {userProfile.nativeLanguage}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                        <Star className="mx-auto mb-2 text-yellow-400" size={24} />
                        <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {userProfile.studyStreak}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          {t('settings.studyStreak')}
                        </p>
                      </div>
                      <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                        <BookOpen className="mx-auto mb-2 text-green-400" size={24} />
                        <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {userProfile.totalLessons}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          {t('settings.totalLessons')}
                        </p>
                      </div>
                      <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                        <BarChart2 className="mx-auto mb-2 text-purple-400" size={24} />
                        <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {userProfile.knownWords}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          {t('settings.knownWords')}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setShowProfileEdit(true)} 
                      className={`w-full px-4 py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 ${
                        darkMode 
                          ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      <Edit size={16} className="mr-2" />
                      {t('settings.editProfile')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Settings Section */}
            <div className="lg:col-span-2">
              <div className={`rounded-3xl p-6 sm:p-8 shadow-2xl border backdrop-blur-lg ${
                darkMode 
                  ? 'bg-slate-800/50 border-slate-600' 
                  : 'bg-white/80 border-gray-200'
              }`}>
                <div className="flex items-center mb-8">
                  <Settings size={28} className="mr-4 text-purple-400" />
                  <h2 className={`text-xl sm:text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('settings.preferences')}
                  </h2>
                </div>

                <div className="space-y-2">
                  {/* Interface Language */}
                  <div className="relative">
                    <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      {t('settings.interfaceLanguage')}
                    </label>
                    <button
                      onClick={() => setShowLanguageSelect(!showLanguageSelect)}
                      className={`w-full text-left flex justify-between items-center px-4 py-4 rounded-xl border-2 transition-all duration-200 ${
                        darkMode
                          ? 'bg-slate-700/50 border-slate-600 text-white hover:border-blue-500'
                          : 'bg-white border-gray-200 text-gray-900 hover:border-blue-500'
                      }`}
                    >
                      <div className="flex items-center">
                        <Globe size={20} className="mr-3 text-blue-500" />
                        <span>{languages.find(l => l.code === i18n.language)?.name || 'Select Language'}</span>
                      </div>
                      <ChevronDown size={20} className={`transition-transform ${showLanguageSelect ? 'rotate-180' : ''}`} />
                    </button>

                    {showLanguageSelect && (
                      <div className={`absolute z-10 w-full mt-2 rounded-xl shadow-2xl border overflow-hidden ${
                        darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'
                      }`}>
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`w-full text-left px-4 py-3 transition-colors ${
                              darkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'
                            }`}
                          >
                            {lang.flag} {lang.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Premium Toggles */}
                  <div className="space-y-1">
                    <PremiumToggle
                      enabled={darkMode}
                      onChange={toggleDarkMode}
                      label={t('settings.darkMode')}
                      description="Темная тема для комфортного изучения"
                      icon={darkMode ? <Moon size={20} className="text-yellow-400" /> : <Sun size={20} className="text-yellow-500" />}
                      color="blue"
                    />

                    <PremiumToggle
                      enabled={notifications}
                      onChange={(value) => {
                        setNotifications(value);
                        setTimeout(saveSettings, 100);
                      }}
                      label={t('settings.notifications')}
                      description="Уведомления о новых уроках и достижениях"
                      icon={<Bell size={20} className="text-green-500" />}
                      color="green"
                    />

                    <PremiumToggle
                      enabled={autoPlay}
                      onChange={(value) => {
                        setAutoPlay(value);
                        setTimeout(saveSettings, 100);
                      }}
                      label={t('settings.autoPlayAudio')}
                      description="Автоматическое воспроизведение аудио"
                      icon={<Volume2 size={20} className="text-red-500" />}
                      color="red"
                    />

                    <PremiumToggle
                      enabled={rtlMode}
                      onChange={(value) => {
                        setRtlMode(value);
                        setTimeout(saveSettings, 100);
                      }}
                      label={t('settings.rtlMode')}
                      description="Режим чтения справа налево для иврита"
                      icon={<BookOpen size={20} className="text-indigo-500" />}
                      color="purple"
                    />
                  </div>
                </div>

                {/* Logout Section */}
                <div className="pt-8 mt-8 border-t border-dashed border-opacity-30">
                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center justify-center px-6 py-4 rounded-xl font-bold transition-all duration-200 ${
                      darkMode
                        ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-800'
                        : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                    }`}
                  >
                    <LogOut size={20} className="mr-3" />
                    {t('settings.logout')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}