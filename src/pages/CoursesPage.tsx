import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Clock, ArrowRight, Star } from 'lucide-react';
import { Course } from '../types/global';
import { courseService } from '../lib/database';
import { demoData } from '../lib/supabase';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

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
    <div className="p-6 pt-16 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Курсы изучения Торы
        </h1>
        <p className="text-slate-400 text-lg">Выберите курс, чтобы начать свое обучение</p>
      </div>

      <div className="space-y-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/course/${course.id}`}
            className="block bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-600 hover:from-slate-750 hover:to-slate-850 transition-all duration-300 shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/30 transform hover:-translate-y-1"
          >
            <div className="flex items-start mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                <BookOpen size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-2xl font-bold text-white mr-3">
                    {course.title}
                  </h3>
                  <div className="flex items-center">
                    <Star size={16} className="text-yellow-400 mr-1" />
                    <span className="text-sm text-yellow-400 font-medium">4.8</span>
                  </div>
                </div>
                <p className="text-slate-300 text-lg leading-relaxed">
                  {course.description}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-6">
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

            <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4">
              <span className="text-blue-400 font-bold text-lg">Начать изучение</span>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <ArrowRight size={20} className="text-white" />
              </div>
            </div>
          </Link>
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