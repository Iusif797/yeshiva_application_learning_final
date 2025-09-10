import { useState } from 'react';
import { RotateCcw, CheckCircle, XCircle, Send } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface WordCardProps {
  word: string;
  translation: string;
  gematria: {
    simple: number;
    standard: number;
    ordinal: number;
  };
  onKnown: () => void;
  onUnknown: () => void;
  onRequestTranslation?: () => void;
}

export default function WordCard({ word, translation, gematria, onKnown, onUnknown, onRequestTranslation }: WordCardProps) {
  const { darkMode } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);
  const [showGematria, setShowGematria] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const toggleGematria = () => {
    setShowGematria(!showGematria);
  };

  const handleRequestTranslation = () => {
    setIsProcessing(true);
    if (onRequestTranslation) {
      onRequestTranslation();
    }
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6">
      <div
        onClick={handleFlip}
        className={`rounded-3xl p-6 sm:p-10 min-h-[300px] sm:min-h-[350px] flex flex-col justify-center items-center border cursor-pointer transition-all duration-300 shadow-2xl ${
          darkMode
            ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600 hover:from-slate-750 hover:to-slate-850 hover:shadow-blue-500/10 hover:border-blue-500/30'
            : 'bg-gradient-to-br from-white to-blue-50 border-gray-200 hover:from-blue-50 hover:to-purple-50 hover:shadow-blue-500/20 hover:border-blue-300 shadow-xl'
        }`}
      >
        <div className="w-full text-center">
          {!isFlipped ? (
            // Hebrew word side
            <div>
              <div className={`text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 tracking-wide hebrew-text ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`} style={{ direction: 'rtl' }}>
                {word}
              </div>
              <div className={`text-sm italic px-4 py-2 rounded-full ${
                darkMode 
                  ? 'text-slate-400 bg-slate-800/50' 
                  : 'text-gray-600 bg-gray-100'
              }`}>
                Нажмите, чтобы увидеть перевод
              </div>
            </div>
          ) : (
            // Translation side
            <div className="w-full">
              <div className={`text-2xl sm:text-3xl font-semibold mb-4 hebrew-text ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`} style={{ direction: 'rtl' }}>
                {word}
              </div>
              <div className={`text-lg sm:text-xl mb-4 sm:mb-6 leading-relaxed p-4 rounded-xl min-h-[60px] flex items-center justify-center font-medium ${
                darkMode 
                  ? 'text-slate-200 bg-slate-800/30' 
                  : 'text-gray-700 bg-blue-50/50'
              }`}>
                {translation}
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGematria();
                }}
                className={`flex items-center justify-center text-white px-4 py-2 sm:py-3 rounded-xl text-sm font-bold mb-4 sm:mb-6 mx-auto transition-all duration-200 shadow-lg ${
                  darkMode
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/25'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-blue-500/30'
                }`}
              >
                <RotateCcw size={16} className="mr-2" />
                {showGematria ? 'Скрыть' : 'Показать'} Гематрию
              </button>

              {showGematria && (
                <div className={`rounded-xl p-5 w-full border ${
                  darkMode
                    ? 'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-600'
                    : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200'
                }`}>
                  <div className={`text-sm font-bold mb-3 ${
                    darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>Значения Гематрии:</div>
                  <div className={`text-sm space-y-2 ${
                    darkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    <div className="flex justify-between">
                      <span>Простая:</span>
                      <span className={`font-mono font-bold ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>{gematria.simple}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Стандартная:</span>
                      <span className={`font-mono font-bold ${
                        darkMode ? 'text-green-400' : 'text-green-600'
                      }`}>{gematria.standard}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Порядковая:</span>
                      <span className={`font-mono font-bold ${
                        darkMode ? 'text-yellow-400' : 'text-yellow-600'
                      }`}>{gematria.ordinal}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Translation request button - always visible */}
      <div className="mt-4 sm:mt-6">
        <button 
          onClick={handleRequestTranslation}
          disabled={isProcessing}
          className={`w-full flex items-center justify-center text-white py-3 sm:py-4 rounded-xl font-bold transition-all duration-200 shadow-lg btn-mobile ${
            isProcessing
              ? 'bg-gray-500 cursor-not-allowed'
              : 
            darkMode
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:shadow-purple-500/25'
              : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 hover:shadow-purple-500/30'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Отправляется...
            </>
          ) : (
            <>
              <Send size={20} className="mr-2" />
              Отправить на перевод
            </>
          )}
        </button>
      </div>

      {isFlipped && (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
          <button 
            onClick={onUnknown}
            className={`flex-1 flex items-center justify-center text-white py-3 sm:py-4 rounded-xl font-bold transition-all duration-200 shadow-lg btn-mobile ${
              darkMode
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-red-500/25'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-red-500/30'
            }`}
          >
            <XCircle size={20} className="mr-2" />
            Не знаю
          </button>

          <button 
            onClick={onKnown}
            className={`flex-1 flex items-center justify-center text-white py-3 sm:py-4 rounded-xl font-bold transition-all duration-200 shadow-lg btn-mobile ${
              darkMode
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-green-500/25'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-green-500/30'
            }`}
          >
            <CheckCircle size={20} className="mr-2" />
            Знаю это
          </button>
        </div>
      )}
    </div>
  );
}