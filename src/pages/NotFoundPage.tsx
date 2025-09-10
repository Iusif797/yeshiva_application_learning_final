import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
          <Search className="text-white" size={36} />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3">Страница не найдена</h1>
        <p className="text-slate-300 mb-8">Кажется, такой страницы не существует. Проверьте адрес или вернитесь на главную.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-xl hover:shadow-blue-500/25 transition-all"
        >
          <Home size={20} className="mr-2" />
          На главную
        </Link>
      </div>
    </div>
  );
}


