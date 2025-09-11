import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Play, FileText, ArrowRight, Clock } from 'lucide-react';
import { Lesson } from '../types/global';
import { lessonService } from '../lib/database';

export default function CourseLessonsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadLessons();
    }
  }, [id]);

  const loadLessons = async () => {
    try {
      // Сначала пытаемся загрузить из Supabase
      try {
        const data = await lessonService.getByCourseId(id!);
        if (data.length > 0) {
          setLessons(data);
          return;
        }
      } catch (error) {
        console.warn('Supabase недоступен, загружаем локальные уроки:', error);
      }
      
      // Загружаем уроки, созданные раввином локально
      const localLessons = JSON.parse(localStorage.getItem('lessons') || '[]');
      const courseLessons = localLessons.filter((lesson: any) => lesson.course_id === id);
      
      if (courseLessons.length > 0) {
        setLessons(courseLessons);
      } else {
        // Демо данные только если нет реальных уроков
        const demoLessons: Lesson[] = [
          {
            id: 'a0e1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5',
            course_id: id!,
            title: 'בראשית א׳ א׳-ה׳',
            content: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ׃ וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם׃',
            audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
            youtube_url: 'https://youtube.com/watch?v=example1',
            order_number: 1,
            created_at: new Date().toISOString()
          },
          {
            id: 'b1f2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6',
            course_id: id!,
            title: 'בראשית א׳ ו׳-י׳',
            content: 'וַיֹּאמֶר אֱלֹהִים יְהִי רָקִיעַ בְּתוֹךְ הַמָּיִם וִיהִי מַבְדִּיל בֵּין מַיִם לָמָיִם׃',
            audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
            youtube_url: 'https://youtube.com/watch?v=example2',
            order_number: 2,
            created_at: new Date().toISOString()
          },
          {
            id: 'c2e3d4f5-a6b7-c8d9-e0f1-a2b3c4d5e6f7',
            course_id: id!,
            title: 'בראשית א׳ יא׳-יג׳',
            content: 'וַיֹּאמֶר אֱלֹהִים תַּדְשֵׁא הָאָרֶץ דֶּשֶׁא עֵשֶׂב מַזְרִיעַ זֶרַע עֵץ פְּרִי עֹשֶׂה פְּרִי לְמִינוֹ׃',
            audio_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
            youtube_url: 'https://youtube.com/watch?v=example3',
            order_number: 3,
            created_at: new Date().toISOString()
          }
        ];
        setLessons(demoLessons);
      }
    } catch (error) {
      console.warn('Ошибка загрузки уроков:', error);
      // Use demo data as fallback
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-300 text-lg">Загрузка уроков...</div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-20">
      <div className="flex items-center mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 p-3 hover:bg-slate-700 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft size={24} className="text-slate-300" />
        </button>
        <h1 className="text-3xl font-bold text-white">Уроки курса</h1>
      </div>

      <div className="space-y-6">
        {lessons.map((lesson, index) => (
          <Link
            key={lesson.id}
            to={`/lesson/${lesson.id}`}
            className="block bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-600 hover:from-slate-750 hover:to-slate-850 transition-all duration-300 shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30 transform hover:-translate-y-1"
          >
            <div className="flex items-start mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3 text-right">
                  {lesson.title}
                </h3>
                <div className="flex items-center justify-end mb-3">
                  <div className="flex items-center bg-slate-700/50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm text-slate-300 font-medium">Не начат</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center justify-center bg-slate-800/50 rounded-xl p-3">
                <FileText size={18} className="text-blue-400 mr-2" />
                <span className="text-sm text-slate-300 font-medium">0 неизвестных слов</span>
              </div>
              
              {lesson.audio_url && (
                <div className="flex items-center justify-center bg-slate-800/50 rounded-xl p-3">
                  <Play size={18} className="text-green-400 mr-2" />
                  <span className="text-sm text-slate-300 font-medium">Аудио доступно</span>
                </div>
              )}
              
              {lesson.youtube_url && (
                <div className="flex items-center justify-center bg-slate-800/50 rounded-xl p-3">
                  <Play size={18} className="text-red-400 mr-2" />
                  <span className="text-sm text-slate-300 font-medium">Видео объяснение</span>
                </div>
              )}

              <div className="flex items-center justify-center bg-slate-800/50 rounded-xl p-3">
                <Clock size={18} className="text-purple-400 mr-2" />
                <span className="text-sm text-slate-300 font-medium">~15 мин</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4">
              <p className="text-slate-400 text-sm flex-1 text-right mr-4" style={{ direction: 'rtl' }}>
                {lesson.content.slice(0, 80)}...
              </p>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <ArrowRight size={20} className="text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {lessons.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen size={40} className="text-slate-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Уроки недоступны</h3>
          <p className="text-slate-400 text-lg">Раввин еще не добавил уроки</p>
        </div>
      )}
    </div>
  );
}