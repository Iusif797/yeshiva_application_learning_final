import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Clock, ArrowRight, Star } from 'lucide-react';
import { Course } from '../types/global';
import { courseService } from '../lib/database';
import { demoData } from '../lib/supabase';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLessonsCount, setNewLessonsCount] = useState<{[key: string]: number}>({});

  useEffect(() => {
    loadCourses();
    checkForNewLessons();
  }, []);

  const checkForNewLessons = () => {
    // Проверяем новые уроки, созданные раввином
    const lastVisitedLessons = JSON.parse(localStorage.getItem('lastVisitedLessons') || '{}');
    const allLessons = JSON.parse(localStorage.getItem('lessons') || '[]');
    
    const newCounts: {[key: string]: number} = {};
    
    // Группируем уроки по курсам
    const lessonsByCourse = allLessons.reduce((acc: any, lesson: any) => {
      if (!acc[lesson.course_id]) acc[lesson.course_id] = [];
      acc[lesson.course_id].push(lesson);
      return acc;
    }, {});
    
    // Считаем новые уроки для каждого курса
    Object.keys(lessonsByCourse).forEach(courseId => {
      const courseLessons = lessonsByCourse[courseId];
      const lastVisited = lastVisitedLessons[courseId] || 0;
      const newLessonsInCourse = courseLessons.filter((lesson: any) => 
        new Date(lesson.created_at).getTime() > lastVisited
      ).length;
      
      if (newLessonsInCourse > 0) {
        newCounts[courseId] = newLessonsInCourse;
      }
    });
    
    setNewLessonsCount(newCounts);
  };

  const loadCourses = async () => {
    try {
      // Try to load from Supabase first
      try {
        const data = await courseService.getAll();
        if (data && data.length > 0) {
          console.log('%cУспех! Данные загружены из Supabase:', 'color: #22c55e; font-size: 16px; font-weight: bold;', data);
          setCourses(data);
          return;
        }
      } catch (supabaseError) {
        console.warn('%cSupabase недоступен, используются демо-данные:', 'color: #eab308; font-size: 16px; font-weight: bold;', supabaseError);
      }
      
      // Always fallback to demo data
      console.log('%cИспользуются демо-данные курсов', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
      setCourses(demoData.courses);
    } catch (error) {
      console.error('%cОшибка загрузки курсов:', 'color: #ef4444; font-size: 16px; font-weight: bold;', error);
      // Even if everything fails, show demo data
      setCourses(demoData.courses);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-white text-lg font-semibold">Загрузка курсов...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 pt-16 sm:pt-20 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Курсы изучения Торы
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">Выберите курс, чтобы начать свое обучение</p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="relative"
          >
            {newLessonsCount[course.id] && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                  {newLessonsCount[course.id]} новых урока
                </div>
              </div>
            )}
            
            <Link
              to={`/course/${course.id}`}
              onClick={() => {
                // Отмечаем курс как посещенный
                const lastVisitedLessons = JSON.parse(localStorage.getItem('lastVisitedLessons') || '{}');
                lastVisitedLessons[course.id] = Date.now();
                localStorage.setItem('lastVisitedLessons', JSON.stringify(lastVisitedLessons));
              }}
              className="block bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-600 hover:from-slate-750 hover:to-slate-850 transition-all duration-300 shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30 transform hover:-translate-y-1 card-mobile"
            >
              <div className="flex items-start mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
                  <BookOpen size={24} className="text-white sm:w-7 sm:h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg sm:text-2xl font-bold text-white mr-3">
                      {course.title}
                    </h3>
                    <div className="flex items-center">
                      <Star size={16} className="text-yellow-400 mr-1" />
                      <span className="text-sm text-yellow-400 font-medium">4.8</span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm sm:text-lg leading-relaxed">
                    {course.description}
                  </p>
                  {newLessonsCount[course.id] && (
                    <div className="mt-2 inline-flex items-center bg-green-600/20 border border-green-600/30 rounded-full px-3 py-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-green-400 text-xs font-medium">Новые уроки доступны!</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="flex items-center text-slate-400">
                    <Users size={18} className="mr-2" />
                    <span className="text-sm font-medium">Активные студенты</span>
                  </div>
                  <div className="flex items-center text-slate-400">
                    <Clock size={18} className="mr-2" />
                    <span className="text-sm font-medium">В своем темпе</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3 sm:p-4">
                <span className="text-blue-400 font-bold text-lg">Начать изучение</span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <ArrowRight size={20} className="text-white" />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen size={40} className="text-slate-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Курсы недоступны</h3>
          <p className="text-slate-400 text-lg">Проверьте позже для новых курсов</p>
        </div>
      )}
    </div>
  );
}