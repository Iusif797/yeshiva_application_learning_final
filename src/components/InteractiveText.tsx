import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import WordTooltip from './WordTooltip';

interface InteractiveTextProps {
  text: string;
  translations: { [key: string]: string };
  unknownWords?: string[];
  className?: string;
}

export default function InteractiveText({ 
  text, 
  translations, 
  unknownWords = [], 
  className = '' 
}: InteractiveTextProps) {
  const { darkMode } = useTheme();
  const [tooltip, setTooltip] = useState<{
    word: string;
    translation: string;
    position: { x: number; y: number };
    visible: boolean;
  }>({
    word: '',
    translation: '',
    position: { x: 0, y: 0 },
    visible: false
  });

  const handleWordClick = (event: React.MouseEvent, word: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const translation = translations[word] || 'Перевод недоступен';
    
    // Анимация тряски
    event.currentTarget.classList.add('animate-pulse');
    setTimeout(() => {
      event.currentTarget.classList.remove('animate-pulse');
    }, 300);

    setTooltip({
      word,
      translation,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top
      },
      visible: true
    });
  };

  const renderInteractiveText = () => {
    // Better word splitting that preserves Hebrew text structure
    const words = text.split(/(\s+|[׃׀])/);
    
    return words.map((segment, index) => {
      const cleanWord = segment.trim().replace(/[׃׀]/g, ''); // Remove Hebrew punctuation
      if (!cleanWord || /^\s+$/.test(segment)) {
        return <span key={index}>{segment}</span>;
      }
      
      // Skip if it's just punctuation
      if (/^[׃׀\s]*$/.test(segment)) {
        return <span key={index}>{segment}</span>;
      }

      const isUnknown = unknownWords.includes(cleanWord);
      const hasTranslation = translations[cleanWord];

      return (
        <span key={index}>
          <span
            onClick={(e) => handleWordClick(e, cleanWord)}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              isUnknown 
                ? darkMode 
                  ? 'bg-red-900/30 text-red-300 border-b-2 border-red-500 rounded-sm' 
                  : 'bg-red-100 text-red-700 border-b-2 border-red-400'
                : hasTranslation
                  ? darkMode
                    ? 'hover:bg-blue-900/30 hover:text-blue-300'
                    : 'hover:bg-blue-100 hover:text-blue-700'
                  : ''
            } px-1 py-0.5 rounded`}
            title={isUnknown ? 'Неизвестное слово - нажмите для перевода' : hasTranslation ? 'Нажмите для перевода' : 'Перевод недоступен'}
          >
            {segment}
          </span>
        </span>
      );
    });
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        className="leading-relaxed text-right hebrew-text"
        style={{ direction: 'rtl' }}
      >
        {renderInteractiveText()}
      </div>

      <WordTooltip
        word={tooltip.word}
        translation={tooltip.translation}
        isVisible={tooltip.visible}
        position={tooltip.position}
        onClose={() => setTooltip(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
}