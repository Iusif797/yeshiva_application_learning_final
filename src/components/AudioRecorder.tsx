import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Waves as Waveform, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob, transcription: string) => void;
  className?: string;
}

export default function AudioRecorder({ onAudioReady, className = '' }: AudioRecorderProps) {
  const { darkMode } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<{
    errors: string[];
    suggestions: string[];
    quality: 'excellent' | 'good' | 'needs_improvement';
  } | null>(null);

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
          sampleRate: 44100
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
        
        // Останавливаем все треки
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Записываем чанки каждую секунду
      setIsRecording(true);
      setDuration(0);

      // Таймер для отслеживания длительности
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
      alert('Не удалось получить доступ к микрофону. Проверьте разрешения.');
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
      // Симуляция AI обработки аудио
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Демо транскрипция (в реальности здесь был бы API вызов)
      const demoTranscription = `בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃ וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם׃

В начале сотворил Бог небо и землю. Земля же была безвидна и пуста, и тьма над бездною, и Дух Божий носился над водою.

Этот отрывок из первой главы книги Бытия рассказывает о начале творения мира. Слово "בְּרֵאשִׁית" (берешит) означает "в начале" и является первым словом Торы.`;

      setTranscription(demoTranscription);

      // Демо AI анализ
      const analysis = {
        errors: [],
        suggestions: [
          'Отличное произношение древнееврейских слов',
          'Хорошая интонация при объяснении',
          'Рекомендуется добавить паузы между стихами'
        ],
        quality: 'excellent' as const
      };

      setAiAnalysis(analysis);
      onAudioReady(audioBlob, demoTranscription);

    } catch (error) {
      console.error('Ошибка AI обработки:', error);
      setAiAnalysis({
        errors: ['Ошибка при обработке аудио'],
        suggestions: [],
        quality: 'needs_improvement'
      });
    } finally {
      setIsProcessing(false);
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
    setTranscription('');
    setAiAnalysis(null);
    setIsPlaying(false);
  };

  return (
    <div className={`${darkMode ? 'bg-slate-800/50' : 'bg-gray-50'} rounded-2xl p-6 border ${darkMode ? 'border-slate-600' : 'border-gray-200'} ${className}`}>
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
          <Mic size={24} className="text-white" />
        </div>
        <div>
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Запись урока
          </h3>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Записывайте урок с высоким качеством звука
          </p>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="space-y-6">
        {!audioBlob ? (
          <div className="text-center">
            <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center mb-6 transition-all duration-300 ${
              isRecording 
                ? 'border-red-500 bg-red-500/10 animate-pulse' 
                : darkMode 
                  ? 'border-slate-600 hover:border-red-500' 
                  : 'border-gray-300 hover:border-red-500'
            }`}>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                } shadow-lg hover:shadow-red-500/25 transform hover:scale-105`}
              >
                {isRecording ? (
                  <Square size={32} className="text-white" />
                ) : (
                  <Mic size={32} className="text-white" />
                )}
              </button>
            </div>

            <div className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {formatTime(duration)}
            </div>
            
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              {isRecording ? 'Идет запись...' : 'Нажмите для начала записи'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Audio Player */}
            <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-white'} rounded-xl p-4 border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Записанный урок
                </span>
                <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={playAudio}
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
                </button>

                <div className="flex-1">
                  <div className={`w-full h-2 ${darkMode ? 'bg-slate-600' : 'bg-gray-300'} rounded-full overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                  </div>
                </div>

                <button
                  onClick={resetRecording}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    darkMode 
                      ? 'bg-slate-600 hover:bg-slate-500 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Заново
                </button>
              </div>

              <audio
                ref={audioRef}
                src={audioUrl || undefined}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              />
            </div>

            {/* AI Processing */}
            <div className="text-center">
              <button
                onClick={processAudioWithAI}
                disabled={isProcessing}
                className={`flex items-center justify-center mx-auto px-6 py-3 rounded-xl font-bold text-white transition-all duration-200 shadow-lg ${
                  isProcessing
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:shadow-purple-500/25 transform hover:scale-105'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader size={20} className="mr-2 animate-spin" />
                    AI обрабатывает аудио...
                  </>
                ) : (
                  <>
                    <Waveform size={20} className="mr-2" />
                    Обработать с помощью AI
                  </>
                )}
              </button>
            </div>

            {/* AI Analysis Results */}
            {aiAnalysis && (
              <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-white'} rounded-xl p-4 border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                <div className="flex items-center mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    aiAnalysis.quality === 'excellent' 
                      ? 'bg-green-600' 
                      : aiAnalysis.quality === 'good' 
                        ? 'bg-yellow-600' 
                        : 'bg-red-600'
                  }`}>
                    {aiAnalysis.quality === 'excellent' ? (
                      <CheckCircle size={16} className="text-white" />
                    ) : (
                      <AlertCircle size={16} className="text-white" />
                    )}
                  </div>
                  <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    AI Анализ: {
                      aiAnalysis.quality === 'excellent' ? 'Отлично' :
                      aiAnalysis.quality === 'good' ? 'Хорошо' : 'Требует улучшения'
                    }
                  </h4>
                </div>

                {aiAnalysis.suggestions.length > 0 && (
                  <div className="mb-4">
                    <h5 className={`font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Рекомендации:
                    </h5>
                    <ul className="space-y-1">
                      {aiAnalysis.suggestions.map((suggestion, index) => (
                        <li key={index} className={`text-sm flex items-start ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          <CheckCircle size={14} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAnalysis.errors.length > 0 && (
                  <div>
                    <h5 className={`font-medium mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Обнаруженные проблемы:
                    </h5>
                    <ul className="space-y-1">
                      {aiAnalysis.errors.map((error, index) => (
                        <li key={index} className={`text-sm flex items-start ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          <AlertCircle size={14} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Transcription */}
            {transcription && (
              <div className={`${darkMode ? 'bg-slate-700/50' : 'bg-white'} rounded-xl p-4 border ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                <h4 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  AI Транскрипция:
                </h4>
                <div className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  <pre className="whitespace-pre-wrap font-sans">{transcription}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}