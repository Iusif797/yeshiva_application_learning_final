import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { User, Settings, Sun, Moon, LogOut, Edit, Check, X, Bell, Volume2, ChevronDown, BookOpen, BarChart2, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserProfile {
  name: string;
  email: string;
  nativeLanguage: string;
  nativeLanguageCode: string;
  studyStreak: number;
  totalLessons: number;
  knownWords: number;
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true); // This state is still local for notifications
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
    knownWords: 245
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
    // Load user data from localStorage or API
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setUserProfile(parsedProfile);
        setTempProfile(parsedProfile);
      }
    } catch (error) {
      console.warn('Failed to parse user profile from localStorage:', error);
    }

    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setNotifications(settings.notifications ?? true);
        // darkMode is now managed by ThemeContext, no need to load here
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
      // darkMode is saved by ThemeContext
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

  const showSavedMessage = (message: string) => {
    setSavedMessage(message);
    setTimeout(() => setSavedMessage(''), 2000);
  };

  const handleLanguageChange = (languageCode: string) => {
    const selectedLang = languages.find(lang => lang.code === languageCode);
    if (selectedLang) {
      i18n.changeLanguage(languageCode);
      // We are not changing the nativeLanguage in the profile here,
      // just the interface language.
      setShowLanguageSelect(false);
      showSavedMessage(t('settings.languageChangedTo', { language: selectedLang.name }));
    }
  };

  const handleLogout = () => {
    if (confirm(t('settings.logoutConfirmation'))) {
      logout();
    }
  };

  const toggleSetting = (setting: string, value: boolean) => {
    switch (setting) {
      case 'notifications':
        setNotifications(value);
        break;
      case 'autoPlay':
        setAutoPlay(value);
        break;
      case 'rtlMode':
        setRtlMode(value);
        break;
    }
    setTimeout(saveSettings, 100);
  };

  return (
    <div className={`p-6 pt-16 min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Saved Message Popup */}
      {savedMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center">
          <Check size={20} className="mr-2" />
          {savedMessage}
        </div>
      )}

      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{t('settings.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile */}
        <div className="md:col-span-1">
          <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center mb-6">
              <User size={28} className="mr-4 text-blue-400" />
              <h2 className="text-2xl font-semibold">{t('settings.profile')}</h2>
            </div>

            {showProfileEdit ? (
              // Edit Profile Form
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{t('settings.name')}</label>
                  <input
                    type="text"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border-2 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'} focus:outline-none focus:border-blue-500`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{t('settings.email')}</label>
                  <input
                    type="email"
                    value={tempProfile.email}
                    onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border-2 ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-100 border-gray-200'} focus:outline-none focus:border-blue-500`}
                  />
                </div>
                {/* Native Language is not editable here anymore, it's part of registration */}
                <div className="flex justify-end space-x-3 mt-4">
                  <button onClick={() => setShowProfileEdit(false)} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${darkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-gray-200 hover:bg-gray-300'}`}>
                    <X size={18} className="inline-block mr-2" />{t('settings.cancel')}
                  </button>
                  <button onClick={handleSaveProfile} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    <Check size={18} className="inline-block mr-2" />{t('settings.save')}
                  </button>
                </div>
              </div>
            ) : (
              // Display Profile Info
              <div className="space-y-4">
                <div className="flex items-center">
                  <img src={`https://i.pravatar.cc/150?u=${user?.email}`} alt="Avatar" className="w-20 h-20 rounded-full mr-6 border-4 border-blue-400" />
                  <div>
                    <p className="text-xl font-bold">{userProfile.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{userProfile.email}</p>
                  </div>
                </div>

                <hr className={darkMode ? 'border-slate-700' : 'border-gray-200'} />

                <div className="space-y-3 text-sm">
                  <p><strong>{t('settings.nativeLanguage')}:</strong> {userProfile.nativeLanguage}</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Star className="mx-auto mb-1 text-yellow-400" size={24} />
                      <p className="font-bold text-lg">{userProfile.studyStreak}</p>
                      <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('settings.studyStreak')}</p>
                    </div>
                    <div>
                      <BookOpen className="mx-auto mb-1 text-green-400" size={24} />
                      <p className="font-bold text-lg">{userProfile.totalLessons}</p>
                      <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('settings.totalLessons')}</p>
                    </div>
                    <div>
                      <BarChart2 className="mx-auto mb-1 text-purple-400" size={24} />
                      <p className="font-bold text-lg">{userProfile.knownWords}</p>
                      <p className={`${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('settings.knownWords')}</p>
                    </div>
                  </div>
                </div>

                <button onClick={() => setShowProfileEdit(true)} className={`w-full mt-4 px-4 py-2 rounded-lg font-semibold flex items-center justify-center transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                  <Edit size={16} className="mr-2" /> {t('settings.editProfile')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="md:col-span-2">
          <div className={`p-6 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center mb-6">
              <Settings size={28} className="mr-4 text-purple-400" />
              <h2 className="text-2xl font-semibold">{t('settings.preferences')}</h2>
            </div>

            <div className="space-y-6">
              {/* Interface Language */}
              <div className="relative">
                <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>{t('settings.interfaceLanguage')}</label>
                <button
                  onClick={() => setShowLanguageSelect(!showLanguageSelect)}
                  className={`w-full text-left flex justify-between items-center px-4 py-3 rounded-xl border-2 transition-all duration-200 ${darkMode
                    ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                    }`}
                >
                  <span>{languages.find(l => l.code === i18n.language)?.name || 'Select Language'}</span>
                  <ChevronDown size={20} className={`transition-transform ${showLanguageSelect ? 'rotate-180' : ''}`} />
                </button>

                {showLanguageSelect && (
                  <div className={`absolute z-10 w-full mt-2 rounded-xl shadow-lg ${darkMode ? 'bg-slate-700' : 'bg-white'} border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-500/10"
                      >
                        {lang.flag} {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dark Mode */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {darkMode ? <Moon className="mr-3 text-yellow-400" size={22} /> : <Sun className="mr-3 text-yellow-500" size={22} />}
                  <span className="text-lg font-semibold">{t('settings.darkMode')}</span>
                </div>
                <button onClick={toggleDarkMode} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Notifications */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Bell className="mr-3 text-green-500" size={22} />
                  <span className="text-lg font-semibold">{t('settings.notifications')}</span>
                </div>
                <button onClick={() => toggleSetting('notifications', !notifications)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${notifications ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Auto-play Audio */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Volume2 className="mr-3 text-red-500" size={22} />
                  <span className="text-lg font-semibold">{t('settings.autoPlayAudio')}</span>
                </div>
                <button onClick={() => toggleSetting('autoPlay', !autoPlay)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${autoPlay ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${autoPlay ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* RTL Mode */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <BookOpen className="mr-3 text-indigo-500" size={22} />
                  <span className="text-lg font-semibold">{t('settings.rtlMode')}</span>
                </div>
                <button onClick={() => toggleSetting('rtlMode', !rtlMode)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${rtlMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${rtlMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Logout Button */}
              <div className="pt-4 border-t-2 border-dashed_custom">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-3 bg-red-600/10 text-red-500 rounded-xl font-bold hover:bg-red-600/20 transition-colors"
                >
                  <LogOut size={20} className="mr-3" /> {t('settings.logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}