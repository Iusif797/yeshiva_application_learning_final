import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Lesson } from '../types/global';
import WordCard from '../components/WordCard';
import AudioPlayer from '../components/AudioPlayer';
import InteractiveText from '../components/InteractiveText';
import LessonQuiz from '../components/LessonQuiz';
import { extractUniqueWords, calculateGematria } from '../utils/hebrew';
import { lessonService, wordService, studentWordService, translationRequestService, progressService } from '../lib/database';
import { useAuth } from '../context/AuthContext';

export default function LessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (id) {
      loadLessonData();
    }
  }, [id]);

  const loadLessonData = async () => {
    try {
      const lessonData = await lessonService.getById(id!);
      if (lessonData) {
        setLesson(lessonData);
        const uniqueWords = extractUniqueWords(lessonData.content);
        setWords(uniqueWords);
      } else {
        // Fallback to demo data
        const demoLesson = {
          id: id!,
          course_id: '11111111-1111-1111-1111-111111111111',
          title: 'בראשית א׳ א׳-ה׳',
          content: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃ וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם׃',
          audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          youtube_url: 'https://youtube.com/watch?v=example1',
          order_number: 1,
          created_at: new Date().toISOString()
        };
        setLesson(demoLesson);
        const uniqueWords = extractUniqueWords(demoLesson.content);
        setWords(uniqueWords);
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWordKnown = async () => {
    await updateWordProgress('known', true);
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      await completeLesson();
    }
  };

  const handleWordUnknown = async () => {
    await updateWordProgress('learning', false);
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      await completeLesson();
    }
  };

  const updateWordProgress = async (level: 'learning' | 'known', isCorrect: boolean) => {
    if (!user) return;

    try {
      const currentWord = words[currentWordIndex];
      const gematria = calculateGematria(currentWord);

      // Get or create word
      const word = await wordService.getOrCreate(currentWord, gematria);

      // Update student word progress
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      if (userProfile.id) {
        await studentWordService.updateWordKnowledge(
          userProfile.id,
          word.id,
          level,
          isCorrect
        );
      }
    } catch (error) {
      console.error('Error updating word progress:', error);
    }
  };

  const completeLesson = async () => {
    if (!user || !lesson) return;

    setShowQuiz(true);
  };

  const [toast, setToast] = useState<string | null>(null);

  const handleRequestTranslation = async () => {
    if (!user) return;

    try {
      const currentWord = words[currentWordIndex];
      const gematria = calculateGematria(currentWord);

      // Get or create word
      const word = await wordService.getOrCreate(currentWord, gematria);

      // Create translation request
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      if (userProfile.id) {
        await translationRequestService.create(
          userProfile.id,
          word.id,
          lesson?.id
        );
        setToast(`Запрос на перевод слова "${currentWord}" отправлен раввину!`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error requesting translation:', error);
      setToast(`Запрос на перевод слова "${words[currentWordIndex]}" отправлен раввину!`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleQuizComplete = async (score: number) => {
    if (!lesson) return;

    try {
      const timeSpent = Math.round((Date.now() - startTime) / 60000); // minutes
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

      if (userProfile.id) {
        await progressService.updateProgress(userProfile.id, lesson.id, {
          status: 'completed',
          completion_percentage: 100,
          time_spent_minutes: timeSpent,
          score: score,
          completed_at: new Date().toISOString()
        });
      }

      // Обновляем статистику в localStorage
      const updatedProfile = {
        ...userProfile,
        totalLessons: (userProfile.totalLessons || 0) + 1,
        knownWords: (userProfile.knownWords || 0) + words.length
      };
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

      setLessonCompleted(true);

      setTimeout(() => {
        navigate(-1);
      }, 3000);
    } catch (error) {
      console.error('Error completing lesson:', error);
      setLessonCompleted(true);
      setTimeout(() => {
        navigate(-1);
      }, 3000);
    }
  };

  const handleQuizRetry = () => {
    setShowQuiz(false);
    setCurrentWordIndex(0);
  };

  if (loading || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-300 text-lg">Загрузка урока...</div>
      </div>
    );
  }

  const currentWord = words[currentWordIndex];
  const gematria = currentWord ? calculateGematria(currentWord) : { simple: 0, standard: 0, ordinal: 0 };

  // Demo translations for different words
  const translations: { [key: string]: string } = {
    'בְּרֵאשִׁית': 'В начале',
    'בָּרָא': 'сотворил',
    'אֱלֹהִים': 'Бог',
    'אֵת': 'את (определенный артикль)',
    'הַשָּׁמַיִם': 'небеса',
    'וְאֵת': 'и את',
    'הָאָרֶץ': 'земля',
    'וְהָאָרֶץ': 'и земля',
    'הָיְתָה': 'была',
    'תֹהוּ': 'пустота',
    'וָבֹהוּ': 'и хаос',
    'וְחֹשֶׁךְ': 'и тьма',
    'עַל־פְּנֵי': 'на поверхности',
    'תְהוֹם': 'бездна',
    'וְרוּחַ': 'и дух',
    'מְרַחֶפֶת': 'парил',
    'הַמָּיִם': 'воды'
  };

  const quizQuestions = [
    {
      id: '1',
      question: 'Что означает слово בְּרֵאשִׁית?',
      options: ['В конце', 'В начале', 'В середине', 'Всегда'],
      correctAnswer: 1,
      explanation: 'בְּרֵאשִׁית означает "В начале" - первое слово Торы'
    },
    {
      id: '2',
      question: 'Как переводится אֱלֹהִים?',
      options: ['Ангел', 'Человек', 'Бог', 'Пророк'],
      correctAnswer: 2,
      explanation: 'אֱלֹהִים - это одно из имен Всевышнего'
    },
    {
      id: '3',
      question: 'Что означает הַשָּׁמַיִם?',
      options: ['земля', 'вода', 'огонь', 'небеса'],
      correctAnswer: 3,
      explanation: 'הַשָּׁמַיִם означает "небеса"'
    }
  ];

  const currentTranslation = translations[currentWord] || 'Перевод недоступен';

  if (lessonCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Урок завершен!</h2>
          <p className="text-slate-300 text-lg">Отличная работа! Возвращаемся к урокам...</p>
        </div>
      </div>
    );
  }

  if (showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 pt-16">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <button
              onClick={() => setShowQuiz(false)}
              className="mr-4 p-3 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-300" />
            </button>
            <h1 className="text-2xl font-bold text-white">Тест по уроку: {lesson.title}</h1>
          </div>

          <LessonQuiz
            questions={quizQuestions}
            onComplete={handleQuizComplete}
            onRetry={handleQuizRetry}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="p-6 pt-16">
        {toast && (
          <div className="mb-4 rounded-xl bg-green-600/20 border border-green-600/30 text-green-300 px-4 py-3">
            {toast}
          </div>
        )}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-300" />
          </button>
          <h1 className="text-2xl font-bold text-white text-right">{lesson.title}</h1>
        </div>

        <div className="mb-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 mb-6 border border-slate-600 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-300 mb-4">Текст урока:</h2>

            <InteractiveText
              text={lesson.content}
              translations={translations}
              unknownWords={words.filter(word => !translations[word] || translations[word] === 'Перевод недоступен')}
              className="text-slate-200 text-xl leading-relaxed mb-6"
            />

            <div className="mb-4 p-3 bg-slate-700/50 rounded-xl">
              <div className="text-sm text-slate-400 mb-2">Статистика урока:</div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Всего слов: {words.length}</span>
                <span className="text-red-400">
                  Неизвестных: {words.filter(word => !translations[word] || translations[word] === 'Перевод недоступен').length}
                </span>
                <span className="text-green-400">
                  Известных: {words.filter(word => translations[word] && translations[word] !== 'Перевод недоступен').length}
                </span>
              </div>
            </div>

            {lesson.audio_url && (
              <AudioPlayer
                src={lesson.audio_url}
                title={`Аудио: ${lesson.title}`}
                autoPlay={false}
              />
            )}
          </div>
        </div>

        {words.length > 0 && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <span className="text-slate-300 text-lg font-medium bg-slate-800 px-4 py-2 rounded-full">
                Слово {currentWordIndex + 1} из {words.length}
              </span>
            </div>

            <div className="w-full bg-slate-700 rounded-full h-3 mb-8 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
              ></div>
            </div>

            <WordCard
              word={currentWord}
              translation={currentTranslation}
              gematria={gematria}
              onKnown={handleWordKnown}
              onUnknown={handleWordUnknown}
              onRequestTranslation={handleRequestTranslation}
            />
          </div>
        )}
      </div>
    </div>
  );
}