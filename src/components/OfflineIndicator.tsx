import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function OfflineIndicator() {
  const { darkMode } = useTheme();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl shadow-lg transition-all duration-300 ${
      isOnline
        ? 'bg-green-600 text-white'
        : darkMode
          ? 'bg-red-600 text-white'
          : 'bg-red-500 text-white'
    }`}>
      <div className="flex items-center">
        {isOnline ? (
          <>
            <Wifi size={16} className="mr-2" />
            <span className="text-sm font-medium">Подключение восстановлено</span>
          </>
        ) : (
          <>
            <WifiOff size={16} className="mr-2" />
            <span className="text-sm font-medium">Нет подключения к интернету</span>
          </>
        )}
      </div>
    </div>
  );
}