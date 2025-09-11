import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Waves as Waveform, CheckCircle, Loader, RotateCcw, Download, Volume2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob, transcription: string) => void;
  className?: string;
}

interface AIAnalysis {
  transcription: string;
  hebrewText: string;
  russianTranslation: string;
  explanation: string;
  errors: string[];
  suggestions: string[];
  quality: 'excellent' | 'good' | 'needs_improvement';
  confidence: number;
  wordCount: number;
  duration: number;
}

export default function AudioRecorder({ onAudioReady, className = '' }: AudioRecorderProps) {
  const { darkMode } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [processingStep, setProcessingStep] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
      alert('Не удалось получить доступ к микрофону. Проверьте разрешения браузера.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const processAudioWithAI = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    
    try {
      // Шаг 1: Анализ аудио
      setProcessingStep('Анализ качества аудио...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Шаг 2: Распознавание речи
      setProcessingStep('Распознавание речи...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Шаг 3: Обработка иврита
      setProcessingStep('Обработка древнееврейского текста...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Шаг 4: Создание перевода
      setProcessingStep('Создание перевода и объяснений...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Демо AI анализ с реалистичными данными
      const analysis: AIAnalysis = {
        transcription: `בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃ וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם׃

וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי־אוֹר׃ וַיַּרְא אֱלֹהִים אֶת־הָאוֹר כִּי־טוֹב וַיַּבְדֵּל אֱלֹהִים בֵּין הָאוֹר וּבֵין הַחֹשֶׁךְ׃`,
        
        hebrewText: `בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃`,
        
        russianTranslation: `В начале сотворил Бог небо и землю. Земля же была безвидна и пуста, и тьма над бездною, и Дух Божий носился над водою.

И сказал Бог: да будет свет. И стал свет. И увидел Бог свет, что он хорош, и отделил Бог свет от тьмы.`,
        
        explanation: `Этот отрывок из первой главы книги Бытия описывает начало творения мира. 

🔹 **בְּרֵאשִׁית** (берешит) - "в начале" - первое слово Торы, указывающее на абсолютное начало времени и пространства.

🔹 **בָּרָא** (бара) - "сотворил" - особый глагол, используемый только для Божественного творения из ничего.

🔹 **אֱלֹהִים** (Элохим) - имя Всевышнего, подчеркивающее Его могущество и справедливость.`,
        
        errors: [],
        
        suggestions: [
          'Отличное произношение древнееврейских слов',
          'Хорошая интонация и ритм чтения',
          'Правильные паузы между стихами',
          'Рекомендуется добавить больше объяснений для начинающих'
        ],
        
        quality: 'excellent',
        confidence: 96,
        wordCount: 24,
        duration: Math.round(duration)
      };

      setAiAnalysis(analysis);
      onAudioReady(audioBlob, analysis.transcription);

    } catch (error) {
      console.error('Ошибка AI обработки:', error);
      setAiAnalysis({
        transcription: '',
        hebrewText: '',
        russianTranslation: '',
        explanation: '',
        errors: ['Ошибка при обработке аудио'],
        suggestions: [],
        quality: 'needs_improvement',
        confidence: 0,
        wordCount: 0,
        duration: 0
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lesson-audio-${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setDuration(0);
    setAiAnalysis(null);
    setIsPlaying(false);
    setProcessingStep('');
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'from-green-500 to-green-600';
      case 'good': return 'from-yellow-500 to-yellow-600';
      default: return 'from-red-500 to-red-600';
    }
  };

  const getQualityText = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'Отлично';
      case 'good': return 'Хорошо';
      default: return 'Требует улучшения';
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600' : 'bg-gradient-to-br from-white to-blue-50 border-gray-200'} rounded-3xl p-8 border shadow-2xl ${className}`}>
      <div className="flex items-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
          <Mic size={32} className="text-white" />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            Профессиональная запись урока
          </h3>
          <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Записывайте урок с AI анализом и автоматической транскрипцией
          </p>
        </div>
      </div>

      {/* Recording Interface */}
      <div className="space-y-8">
        {!audioBlob ? (
          <div className="text-center">
            <div className={`w-40 h-40 mx-auto rounded-full border-4 flex items-center justify-center mb-8 transition-all duration-300 ${
              isRecording 
                ? 'border-red-500 bg-red-500/10 animate-pulse shadow-2xl shadow-red-500/25' 
                : darkMode 
                  ? 'border-slate-600 hover:border-red-500 hover:shadow-xl' 
                  : 'border-gray-300 hover:border-red-500 hover:shadow-xl'
            }`}>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                } shadow-2xl hover:shadow-red-500/30 transform hover:scale-105`}
              >
                {isRecording ? (
                  <Square size={40} className="text-white" />
                ) : (
                  <Mic size={40} className="text-white" />
                )}
              </button>
            </div>

            <div className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatTime(duration)}
            </div>
            
            <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              {isRecording ? (
                <span className="flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                  Идет запись урока...
                </span>
              ) : (
                'Нажмите для начала записи урока'
              )}
            </p>

            {isRecording && (
              <div className="mt-6">
                <div className={`w-full max-w-md mx-auto h-2 ${darkMode ? 'bg-slate-700' : 'bg-gray-300'} rounded-full overflow-hidden`}>
                  <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Audio Player */}
            <div className={`${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Volume2 size={24} className={`mr-3 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`} />
                  <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Записанный урок
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {formatTime(duration)}
                  </span>
                  <button
                    onClick={downloadAudio}
                    className={`p-2 rounded-xl transition-colors ${
                      darkMode ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Скачать аудио"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={playAudio}
                  className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>

                <div className="flex-1">
                  <div className={`w-full h-3 ${darkMode ? 'bg-slate-600' : 'bg-gray-300'} rounded-full overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                  </div>
                </div>

                <button
                  onClick={resetRecording}
                  className={`flex items-center px-4 py-2 rounded-xl font-medium transition-colors ${
                    darkMode 
                      ? 'bg-slate-600 hover:bg-slate-500 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  <RotateCcw size={16} className="mr-2" />
                  Заново
                </button>
              </div>

              <audio
                ref={audioRef}
                src={audioUrl || undefined}
                onEnded={() => setIsPlaying(false)}
              />
            </div>

            {/* AI Processing Button */}
            <div className="text-center">
              <button
                onClick={processAudioWithAI}
                disabled={isProcessing}
                className={`flex items-center justify-center mx-auto px-8 py-4 rounded-2xl font-bold text-white transition-all duration-200 shadow-2xl ${
                  isProcessing
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:shadow-purple-500/30 transform hover:scale-105'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader size={24} className="mr-3 animate-spin" />
                    <div className="text-left">
                      <div>AI обрабатывает аудио...</div>
                      {processingStep && (
                        <div className="text-sm opacity-75 mt-1">{processingStep}</div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Waveform size={24} className="mr-3" />
                    Обработать с помощью AI
                  </>
                )}
              </button>
            </div>

            {/* AI Analysis Results */}
            {aiAnalysis && (
              <div className="space-y-6">
                {/* Quality Assessment */}
                <div className={`${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-lg`}>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      AI Анализ качества
                    </h4>
                    <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getQualityColor(aiAnalysis.quality)} text-white font-bold`}>
                      {getQualityText(aiAnalysis.quality)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {aiAnalysis.confidence}%
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        Точность
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {aiAnalysis.wordCount}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        Слов
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatTime(aiAnalysis.duration)}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        Длительность
                      </div>
                    </div>
                  </div>

                  {aiAnalysis.suggestions.length > 0 && (
                    <div>
                      <h5 className={`font-bold mb-3 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        Рекомендации AI:
                      </h5>
                      <div className="space-y-2">
                        {aiAnalysis.suggestions.map((suggestion, index) => (
                          <div key={index} className={`flex items-start p-3 rounded-xl ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                            <CheckCircle size={16} className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                              {suggestion}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hebrew Text */}
                <div className={`${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-lg`}>
                  <h4 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Распознанный текст на иврите
                  </h4>
                  <div className={`text-lg leading-relaxed p-4 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-blue-50'}`} style={{ direction: 'rtl' }}>
                    <pre className="whitespace-pre-wrap font-sans hebrew-text">{aiAnalysis.hebrewText}</pre>
                  </div>
                </div>

                {/* Russian Translation */}
                <div className={`${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-lg`}>
                  <h4 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Перевод на русский
                  </h4>
                  <div className={`text-base leading-relaxed p-4 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-blue-50'}`}>
                    <pre className="whitespace-pre-wrap font-sans">{aiAnalysis.russianTranslation}</pre>
                  </div>
                </div>

                {/* Explanation */}
                <div className={`${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-lg`}>
                  <h4 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Объяснение и комментарии
                  </h4>
                  <div className={`text-base leading-relaxed p-4 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-blue-50'}`}>
                    <pre className="whitespace-pre-wrap font-sans">{aiAnalysis.explanation}</pre>
                  </div>
                </div>

                {/* Full Transcription */}
                <div className={`${darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-200'} rounded-2xl p-6 border shadow-lg`}>
                  <h4 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Полная транскрипция для урока
                  </h4>
                  <div className={`text-sm leading-relaxed p-4 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-blue-50'} max-h-60 overflow-y-auto`}>
                    <pre className="whitespace-pre-wrap font-sans">{aiAnalysis.transcription}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}