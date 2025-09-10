interface PremiumToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

export default function PremiumToggle({ 
  enabled, 
  onChange, 
  label, 
  description, 
  icon, 
  color = 'blue'
}: PremiumToggleProps) {
  const colorClasses = {
    blue: enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600',
    green: enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600',
    purple: enabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600',
    red: enabled ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600',
    yellow: enabled ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600',
  };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center flex-1">
        {icon && (
          <div className="mr-3 flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="font-medium text-base text-gray-900 dark:text-white">
            {label}
          </div>
          {description && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {description}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${colorClasses[color]}`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}