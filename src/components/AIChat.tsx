import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Minimize2, Maximize2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  lessonContext?: {
    title: string;
    content: string;
  };
}

export default function AIChat({ isOpen, onClose, onMinimize, isMinimized, lessonContext }: AIChatProps) {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Приветственное сообщение
      const welcomeMessage: Message = {
        id: '1',
        type: 'ai',
        content: `Шалом, ${user?.name || 'дорогой ученик'}! 🕊️\n\nЯ ваш AI помощник для изучения Торы и иврита. Я могу:\n\n📚 Объяснить сложные концепции\n🔤 Помочь с переводом слов\n💡 Дать контекст к урокам\n🎯 Создать персональные упражнения\n\n${lessonContext ? `Сейчас мы изучаем: "${lessonContext.title}"\n\nЗадавайте любые вопросы!` : 'Чем могу помочь в изучении?'}`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user?.name, lessonContext]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Симуляция задержки API
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Простая логика ответов на основе ключевых слов
    const message = userMessage.toLowerCase();
    
    if (message.includes('בראשית') || message.includes('берешит')) {
      return `Отличный вопрос о בְּרֵאשִׁית (Берешит)! 🌟\n\nЭто первое слово Торы означает "В начале". Интересные факты:\n\n🔤 Гематрия: 913\n📖 Корень: ב-ר-א (создавать)\n💡 Раши объясняет: "В начале сотворения"\n\n${lessonContext ? 'В нашем уроке это слово открывает всю историю творения.' : ''}\n\nЕсть еще вопросы по этому слову?`;
    }
    
    if (message.includes('אלהים') || message.includes('элохим')) {
      return `אֱלֹהִים (Элохим) - одно из имен Всевышнего! ✨\n\n🔍 Особенности:\n• Форма множественного числа\n• Означает "Судья", "Властелин"\n• Гематрия: 86\n• Используется 2570 раз в Танахе\n\n📚 В контексте творения показывает могущество и справедливость Творца.\n\nХотите узнать о других именах Всевышнего?`;
    }
    
    if (message.includes('гематрия') || message.includes('gematria')) {
      return `Гематрия - это удивительная система! 🔢\n\n✨ Основы:\n• Каждая буква = число\n• Слова с одинаковой суммой связаны\n• Три основных метода:\n  - Простая (פשוט)\n  - Стандартная (רגיל)\n  - Порядковая (סדרי)\n\n🎯 Например:\n• אחד (один) = 13\n• אהבה (любовь) = 13\n\nХотите посчитать гематрию конкретного слова?`;
    }
    
    if (message.includes('перевод') || message.includes('translate')) {
      return `С удовольствием помогу с переводом! 📝\n\n🔤 Напишите слово на иврите, и я дам:\n• Точный перевод\n• Контекст использования\n• Грамматические формы\n• Примеры из Торы\n\n💡 Также могу объяснить этимологию и связанные понятия.\n\nКакое слово хотите перевести?`;
    }
    
    if (message.includes('урок') || message.includes('lesson')) {
      return `Давайте разберем урок подробнее! 📚\n\n${lessonContext ? 
        `📖 Текущий урок: "${lessonContext.title}"\n\n🔍 Ключевые моменты:\n• Основные слова и их значения\n• Исторический контекст\n• Духовные уроки\n• Практическое применение\n\nКакой аспект урока вас больше всего интересует?` :
        '🎯 Я могу помочь с любым уроком:\n• Объяснить сложные места\n• Дать исторический контекст\n• Разобрать грамматику\n• Предложить упражнения\n\nО каком уроке хотите поговорить?'
      }`;
    }
    
    if (message.includes('упражнение') || message.includes('практика')) {
      return `Отличная идея практиковаться! 💪\n\n🎯 Предлагаю упражнения:\n\n1️⃣ **Словарь**: Найдите 5 новых слов из урока\n2️⃣ **Гематрия**: Посчитайте числовые значения\n3️⃣ **Перевод**: Переведите фразу без подсказок\n4️⃣ **Контекст**: Объясните значение в историческом контексте\n\n${lessonContext ? `Начнем с урока "${lessonContext.title}"?` : 'С какого упражнения начнем?'}`;
    }
    
    // Общий ответ
    return `Спасибо за интересный вопрос! 🤔\n\nЯ стараюсь помочь с изучением Торы и иврита. Могу:\n\n📚 Объяснить тексты и концепции\n🔤 Помочь с переводами\n🧮 Рассчитать гематрию\n💡 Дать исторический контекст\n🎯 Создать упражнения\n\n${lessonContext ? `Особенно хорошо разбираюсь в теме: "${lessonContext.title}"` : ''}\n\nМожете переформулировать вопрос или спросить что-то конкретное?`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Добавляем индикатор печатания
    const typingMessage: Message = {
      id: 'typing',
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const aiResponse = await simulateAIResponse(userMessage.content);
      
      // Убираем индикатор печатания и добавляем ответ
      setMessages(prev => {
        const withoutTyping = prev.filter(m => m.id !== 'typing');
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiResponse,
          timestamp: new Date()
        };
        return [...withoutTyping, aiMessage];
      });
    } catch (error) {
      setMessages(prev => {
        const withoutTyping = prev.filter(m => m.id !== 'typing');
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: 'Извините, произошла ошибка. Попробуйте еще раз.',
          timestamp: new Date()
        };
        return [...withoutTyping, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
      isMinimized ? 'pointer-events-none' : ''
    }`}>
      {/* Backdrop */}
      {!isMinimized && (
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Chat Window */}
      <div className={`relative w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl transition-all duration-300 ${
        isMinimized 
          ? 'w-80 h-16 fixed bottom-4 right-4 pointer-events-auto' 
          : ''
      } ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600' 
          : 'bg-gradient-to-br from-white to-blue-50 border border-gray-200'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          darkMode ? 'border-slate-600' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                AI Помощник Торы
              </h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Онлайн
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {onMinimize && (
              <button
                onClick={onMinimize}
                className={`p-2 rounded-full transition-colors ${
                  darkMode 
                    ? 'hover:bg-slate-700 text-slate-400' 
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                darkMode 
                  ? 'hover:bg-slate-700 text-slate-400' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(80vh-140px)]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gradient-to-br from-purple-500 to-blue-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User size={16} className="text-white" />
                      ) : (
                        <Bot size={16} className="text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`rounded-2xl p-3 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : darkMode
                          ? 'bg-slate-700 text-slate-200'
                          : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.isTyping ? (
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm ml-2">печатает...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                      )}
                      
                      <div className={`text-xs mt-2 opacity-70 ${
                        message.type === 'user' ? 'text-blue-100' : darkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`p-4 border-t ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Задайте вопрос о Торе или иврите..."
                  disabled={isLoading}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                    darkMode
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500 placeholder-slate-400'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 placeholder-gray-500'
                  } disabled:opacity-50`}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}