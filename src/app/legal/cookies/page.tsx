// src/app/legal/cookies/page.tsx
import { CookieSettings } from '@/components/legal/CookieBanner';

export const metadata = {
  title: 'Политика Cookies | 3GIS',
  description: 'Политика использования cookies в 3GIS - как мы используем файлы cookie',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Политика использования Cookies
          </h1>
          <p className="text-gray-600 mb-8">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Что такое cookies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Cookies (файлы cookie) - это небольшие текстовые файлы, которые 
                сохраняются в вашем браузере при посещении веб-сайтов. Они помогают 
                сайтам запоминать информацию о вашем визите и предоставлять более 
                персонализированный опыт.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Как мы используем cookies
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                2.1 Необходимые cookies
              </h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>Назначение:</strong> Обеспечение базовой функциональности сайта
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Сохранение настроек языка и региона</li>
                <li>Поддержание сессии пользователя</li>
                <li>Безопасность и защита от CSRF-атак</li>
                <li>Сохранение согласия на использование cookies</li>
              </ul>
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                <strong>Правовая основа:</strong> Эти cookies необходимы для работы сайта 
                и не требуют отдельного согласия согласно GDPR/CCPA.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">
                2.2 Функциональные cookies
              </h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>Назначение:</strong> Улучшение пользовательского опыта
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Запоминание выбранного города</li>
                <li>Сохранение предпочтений поиска</li>
                <li>История последних просмотренных заведений</li>
                <li>Настройки отображения карты</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                2.3 Аналитические cookies
              </h3>
              <p className="text-gray-700 leading-relaxed mb-2">
                <strong>Назначение:</strong> Анализ использования сайта для улучшений
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Google Analytics - статистика посещений</li>
                <li>Анализ популярных разделов сайта</li>
                <li>Отслеживание эффективности функций</li>
                <li>Понимание поведения пользователей</li>
              </ul>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  <strong>Конфиденциальность:</strong> Все аналитические данные 
                  анонимизированы и не позволяют идентифицировать конкретных пользователей.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Cookies третьих сторон
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                3.1 Google Services
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden mb-4">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Сервис</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Назначение</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900">Срок хранения</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">Google Analytics</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Статистика посещений</td>
                      <td className="px-4 py-2 text-sm text-gray-700">2 года</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">Google Maps</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Отображение карт</td>
                      <td className="px-4 py-2 text-sm text-gray-700">1 год</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-700">reCAPTCHA</td>
                      <td className="px-4 py-2 text-sm text-gray-700">Защита от спама</td>
                      <td className="px-4 py-2 text-sm text-gray-700">6 месяцев</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                3.2 Telegram Web App
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                При использовании 3GIS через Telegram Mini App могут устанавливаться 
                cookies, связанные с функционированием Telegram Web App API. Эти 
                cookies регулируются политикой конфиденциальности Telegram.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Управление cookies
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                4.1 Настройки браузера
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Вы можете управлять cookies через настройки вашего браузера:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Google Chrome</h4>
                  <p className="text-sm text-gray-600">
                    Настройки → Конфиденциальность и безопасность → Файлы cookie
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Mozilla Firefox</h4>
                  <p className="text-sm text-gray-600">
                    Настройки → Приватность и защита → Куки и данные сайтов
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Safari</h4>
                  <p className="text-sm text-gray-600">
                    Настройки → Конфиденциальность → Управление данными веб-сайтов
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Microsoft Edge</h4>
                  <p className="text-sm text-gray-600">
                    Настройки → Файлы cookie и разрешения сайтов
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                4.2 Последствия отключения cookies
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 mb-2">
                  <strong>Внимание:</strong> Отключение cookies может повлиять на работу сайта:
                </p>
                <ul className="list-disc list-inside text-yellow-700 space-y-1 text-sm">
                  <li>Потеря настроек и предпочтений</li>
                  <li>Необходимость повторного выбора города при каждом визите</li>
                  <li>Ограниченная функциональность некоторых возможностей</li>
                  <li>Невозможность анализа для улучшения сервиса</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Ваши права (GDPR/CCPA)
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                В отношении cookies вы имеете право:
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Отозвать согласие</strong> на использование необязательных cookies</li>
                <li><strong>Запросить информацию</strong> о том, какие cookies мы используем</li>
                <li><strong>Удалить cookies</strong> через настройки браузера</li>
                <li><strong>Блокировать</strong> определенные типы cookies</li>
              </ul>
              
              <p className="text-gray-700 mb-4">
                Для реализации этих прав или получения дополнительной информации 
                свяжитесь с нами:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Email: <a href="mailto:privacy@3gis.us" className="text-blue-600 underline">privacy@3gis.us</a>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Обновления политики
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Мы можем периодически обновлять данную политику использования cookies. 
                О существенных изменениях мы уведомим пользователей через баннер на сайте 
                или другими доступными способами.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Актуальная версия политики всегда доступна по адресу: 
                <a href="/legal/cookies" className="text-blue-600 underline ml-1">
                  3gis.us/legal/cookies
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Контактная информация
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>По вопросам cookies:</strong>
                </p>
                <p className="text-gray-700 mb-1">
                  Email: <a href="mailto:privacy@3gis.us" className="text-blue-600 underline">privacy@3gis.us</a>
                </p>
                <p className="text-gray-700 mb-1">
                  Общие вопросы: <a href="mailto:support@3gis.us" className="text-blue-600 underline">support@3gis.us</a>
                </p>
                <p className="text-gray-700">
                  Телефон: <a href="tel:+1234567890" className="text-blue-600 underline">+1 (234) 567-890</a>
                </p>
              </div>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                🍪 Кратко о главном
              </h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                Мы используем cookies для улучшения работы сайта и анализа его использования. 
                Вы можете управлять cookies через настройки браузера. Некоторые cookies 
                необходимы для базовой функциональности сайта и не могут быть отключены.
              </p>
            </div>

            {/* Cookie Settings Widget */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Управление настройками
              </h2>
              <CookieSettings />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}