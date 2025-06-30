import { Metadata } from 'next';
import Link from 'next/link';
import { Search, ArrowLeft, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Страница не найдена | 3GIS',
  description: 'Запрашиваемая страница не найдена в справочнике 3GIS',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">3G</span>
          </div>
        </div>
        
        {/* 404 */}
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Страница не найдена
          </h2>
          <p className="text-gray-600">
            К сожалению, запрашиваемое заведение или чат не найдены в нашем справочнике
          </p>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/tg"
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center justify-center"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Открыть 3GIS в Telegram
          </Link>
          
          <Link
            href="/tg/businesses"
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors inline-flex items-center justify-center"
          >
            <Search className="w-5 h-5 mr-2" />
            Найти заведения
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full text-gray-600 py-3 px-4 hover:text-gray-800 transition-colors inline-flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </button>
        </div>
        
        {/* Help text */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
          <h3 className="font-medium text-blue-900 mb-2">Что можно сделать?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Проверьте правильность ссылки</li>
            <li>• Найдите заведение через поиск в Telegram</li>
            <li>• Свяжитесь с нами если ссылка должна работать</li>
          </ul>
        </div>
      </div>
    </div>
  );
}