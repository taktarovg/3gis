'use client';

import { useStoredTrafficSource, TARGET_KEYWORDS, isTargetKeyword } from '@/hooks/use-traffic-tracking';
import { track3GISEvents } from '@/lib/analytics';
import { useState, useEffect } from 'react';

export default function SEOAnalyticsPage() {
  const { getTrafficSource } = useStoredTrafficSource();
  const [trafficData, setTrafficData] = useState<any>(null);
  const [testKeyword, setTestKeyword] = useState('');

  useEffect(() => {
    const data = getTrafficSource();
    setTrafficData(data);
  }, [getTrafficSource]);

  const handleTestEvent = (eventType: string) => {
    switch (eventType) {
      case 'google_organic':
        track3GISEvents.landingView('google_organic', 'none', 'русские врачи нью йорк');
        break;
      case 'social_media':
        track3GISEvents.socialClick('facebook', 'external_post');
        break;
      case 'direct':
        track3GISEvents.landingView('direct', 'none', 'none');
        break;
      case 'utm_campaign':
        track3GISEvents.landingView('google_ads', 'russian_doctors_ny', 'русский врач');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          SEO Analytics & Traffic Tracking
        </h1>
        
        {/* Текущий источник трафика */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Ваш источник трафика</h2>
          {trafficData ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Источник:</strong> {trafficData.source}
              </div>
              <div>
                <strong>Кампания:</strong> {trafficData.campaign}
              </div>
              <div>
                <strong>Ключевое слово:</strong> {trafficData.keyword}
              </div>
              <div>
                <strong>Medium:</strong> {trafficData.medium}
              </div>
              <div className="col-span-2">
                <strong>Referrer:</strong> {trafficData.referrer || 'Прямой переход'}
              </div>
              <div className="col-span-2">
                <strong>Время:</strong> {new Date(trafficData.timestamp).toLocaleString('ru-RU')}
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Загрузка данных о трафике...</p>
          )}
        </div>

        {/* Целевые ключевые слова для 3GIS */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Целевые ключевые слова</h2>
          <p className="text-gray-600 mb-4">
            Ключевые слова, по которым должен ранжироваться 3GIS:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {TARGET_KEYWORDS.map((keyword, index) => (
              <span 
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Тестер ключевых слов */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Тестер ключевых слов</h2>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={testKeyword}
              onChange={(e) => setTestKeyword(e.target.value)}
              placeholder="Введите ключевое слово для проверки"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            />
            <button
              onClick={() => {
                const isTarget = isTargetKeyword(testKeyword);
                alert(`Ключевое слово "${testKeyword}" ${isTarget ? 'ЦЕЛЕВОЕ' : 'НЕ целевое'} для 3GIS`);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Проверить
            </button>
          </div>
        </div>

        {/* Тестовые события для Analytics */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Тестовые события трафика</h2>
          <p className="text-gray-600 mb-4">
            Отправьте тестовые события в Google Analytics для проверки отслеживания:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleTestEvent('google_organic')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
            >
              Google Органика
            </button>
            <button
              onClick={() => handleTestEvent('social_media')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              Соцсети
            </button>
            <button
              onClick={() => handleTestEvent('direct')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
            >
              Прямой переход
            </button>
            <button
              onClick={() => handleTestEvent('utm_campaign')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
            >
              UTM кампания
            </button>
          </div>
        </div>

        {/* Источники трафика для мониторинга */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Ожидаемые источники трафика</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Поисковые системы:</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Google.com (органика + реклама)</li>
                <li>• Yandex.ru (русскоязычные запросы)</li>
                <li>• Bing.com</li>
                <li>• DuckDuckGo.com</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Социальные сети:</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Facebook группы русскоязычных</li>
                <li>• Telegram каналы</li>
                <li>• VKontakte сообщества</li>
                <li>• Instagram посты</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Референсы:</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Brighton Beach блоги</li>
                <li>• Русскоязычные порталы США</li>
                <li>• Иммиграционные форумы</li>
                <li>• Русские новостные сайты</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Прямой трафик:</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Прямой ввод 3gis.biz</li>
                <li>• Закладки браузера</li>
                <li>• QR коды в оффлайне</li>
                <li>• Word-of-mouth рекомендации</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  );
}
