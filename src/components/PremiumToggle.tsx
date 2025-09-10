import { useTheme } from '../context/ThemeContext';

interface PremiumToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
}

export default function PremiumToggle({ 
  enabled, 
  onChange, 
  label, 
  description, 
  icon, 
  color = 'blue',
  size = 'md'
}: PremiumToggleProps) {
  const { darkMode } = useTheme();

  const colorClasses = {
    blue: enabled ? 'bg-blue-600' : darkMode ? 'bg-slate-600' : 'bg-gray-300',
    green: enabled ? 'bg-green-600' : darkMode ? 'bg-slate-600' : 'bg-gray-300',
    purple: enabled ? 'bg-purple-600' : darkMode ? 'bg-slate-600' : 'bg-gray-300',
    red: enabled ? 'bg-red-600' : darkMode ? 'bg-slate-600' : 'bg-gray-300',
    yellow: enabled ? 'bg-yellow-600' : darkMode ? 'bg-slate-600' : 'bg-gray-300',
  };

  const sizeClasses = {
    sm: {
      container: 'w-10 h-6',
      thumb: 'w-4 h-4',
      translate: enabled ? 'translate-x-4' : 'translate-x-1'
    },
    md: {
      container: 'w-12 h-7',
      thumb: 'w-5 h-5',
      translate: enabled ? 'translate-x-5' : 'translate-x-1'
    },
    lg: {
      container: 'w-14 h-8',
      thumb: 'w-6 h-6',
      translate: enabled ? 'translate-x-6' : 'translate-x-1'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center flex-1">
        {icon && (
          <div className="mr-4 flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {label}
          </div>
          {description && (
            <div className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              {description}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex items-center ${currentSize.container} rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${colorClasses[color]} shadow-lg hover:shadow-xl transform hover:scale-105`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block ${currentSize.thumb} bg-white rounded-full shadow-lg transform transition-all duration-300 ${currentSize.translate} ${
            enabled ? 'shadow-xl' : 'shadow-md'
          }`}
        />
        
        {/* Animated background gradient */}
        <div className={`absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 ${
          enabled ? 'opacity-100' : 'opacity-0'
        } bg-gradient-to-r ${
          color === 'blue' ? 'from-blue-400 to-blue-600' :
          color === 'green' ? 'from-green-400 to-green-600' :
          color === 'purple' ? 'from-purple-400 to-purple-600' :
          color === 'red' ? 'from-red-400 to-red-600' :
          'from-yellow-400 to-yellow-600'
        }`} />
      </button>
    </div>
  );
}