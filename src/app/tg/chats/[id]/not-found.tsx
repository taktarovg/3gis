import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function ChatNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-gray-400" />
        </div>
        
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Чат не найден
        </h1>
        
        <p className="text-gray-600 mb-6">
          Этот чат был удален, заблокирован или не существует.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/tg/chats"
            className="block w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Посмотреть все чаты
          </Link>
          
          <Link
            href="/tg"
            className="flex items-center justify-center w-full text-gray-600 py-2 px-4 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
