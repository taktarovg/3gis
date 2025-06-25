// src/app/legal/accessibility/page.tsx
import { Eye, Keyboard, VolumeX, Settings, Monitor, Users } from 'lucide-react';

export const metadata = {
  title: 'Заявление о доступности | 3GIS',
  description: 'Политика доступности 3GIS - наша приверженность обеспечению равного доступа для всех пользователей',
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Заявление о доступности
          </h1>
          <p className="text-gray-600 mb-8">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>

          <div className="prose prose-lg max-w-none">
            {/* Commitment */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                ♿ Наши обязательства
              </h3>
              <p className="text-blue-700 leading-relaxed">
                3GIS стремится обеспечить доступность нашего веб-сайта для людей с ограниченными возможностями. 
                Мы активно работаем над улучшением пользовательского опыта для всех и применяем 
                соответствующие стандарты доступности.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Стандарты соответствия
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Мы стремимся соответствовать уровню AA руководящих принципов доступности 
                веб-контента (WCAG) 2.1. Эти рекомендации объясняют, как сделать веб-контент 
                более доступным для людей с ограниченными возможностями.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">WCAG 2.1 Level AA</h3>
                  <p className="text-gray-600 text-sm">
                    Международный стандарт доступности веб-контента
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Section 508</h3>
                  <p className="text-gray-600 text-sm">
                    Соответствие федеральным требованиям США
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Реализованные функции доступности
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Keyboard className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Навигация с клавиатуры</h3>
                  <p className="text-gray-600 text-sm">
                    Полная поддержка навигации без мыши
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Скринридеры</h3>
                  <p className="text-gray-600 text-sm">
                    Семантическая HTML разметка и ARIA-метки
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Monitor className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Адаптивный дизайн</h3>
                  <p className="text-gray-600 text-sm">
                    Работа на всех устройствах и размерах экрана
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Контрастность</h3>
                  <p className="text-gray-600 text-sm">
                    Соответствие требованиям контрастности WCAG
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <VolumeX className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Альтернативный текст</h3>
                  <p className="text-gray-600 text-sm">
                    Описания для всех изображений и медиа
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Простота использования</h3>
                  <p className="text-gray-600 text-sm">
                    Интуитивная навигация и понятные инструкции
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Конкретные меры доступности
              </h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Визуальная доступность</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Минимальный коэффициент контрастности 4.5:1 для обычного текста</li>
                    <li>• Размер шрифта не менее 16px для основного текста</li>
                    <li>• Возможность увеличения до 200% без потери функциональности</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Навигация</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Логический порядок табуляции</li>
                    <li>• Видимый фокус для всех интерактивных элементов</li>
                    <li>• Skip links для быстрого перехода к основному контенту</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-gray-900 mb-1">Контент</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Описательные заголовки и ссылки</li>
                    <li>• Альтернативный текст для всех изображений</li>
                    <li>• Четкие сообщения об ошибках и инструкции</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Известные ограничения
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Мы постоянно работаем над улучшением доступности, но признаем, 
                что некоторые области все еще требуют доработки:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Интерактивные карты могут иметь ограниченную доступность для скринридеров</li>
                <li>Некоторые сторонние виджеты могут не полностью соответствовать стандартам</li>
                <li>Видеоконтент может не иметь субтитров (добавляется по запросу)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Обратная связь и поддержка
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Мы приветствуем отзывы о доступности нашего веб-сайта. Если вы столкнулись 
                с препятствиями или у вас есть предложения по улучшению, пожалуйста, свяжитесь с нами:
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Контакты по вопросам доступности:</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Email:</strong> 
                    <a href="mailto:accessibility@3gis.us" className="text-blue-600 underline ml-1">
                      accessibility@3gis.us
                    </a>
                  </p>
                  <p>
                    <strong>Телефон:</strong> 
                    <a href="tel:+1234567890" className="text-blue-600 underline ml-1">
                      +1 (234) 567-890
                    </a>
                  </p>
                  <p>
                    <strong>Время ответа:</strong> В течение 48 часов в рабочие дни
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Альтернативные форматы
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Если вам нужна информация с нашего веб-сайта в альтернативном формате, 
                мы можем предоставить:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Крупный шрифт</li>
                <li>Аудио описание</li>
                <li>Упрощенный текст</li>
                <li>Другие форматы по запросу</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Процедура подачи жалоб
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-yellow-800 leading-relaxed mb-4">
                  Если вы не удовлетворены нашим ответом на ваш запрос о доступности, 
                  вы можете подать официальную жалобу:
                </p>
                <ol className="list-decimal list-inside text-yellow-800 space-y-2">
                  <li>Напишите на accessibility@3gis.us с подробным описанием проблемы</li>
                  <li>Мы рассмотрим вашу жалобу в течение 10 рабочих дней</li>
                  <li>При необходимости вы можете обратиться в соответствующие государственные органы</li>
                </ol>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Регулярные оценки
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Мы регулярно оцениваем доступность нашего веб-сайта через:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Ежемесячные автоматизированные проверки</li>
                <li>Ежеквартальные ручные аудиты</li>
                <li>Тестирование с реальными пользователями</li>
                <li>Консультации с экспертами по доступности</li>
              </ul>
            </section>

            {/* Last Updated */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                📅 Обновления документа
              </h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                Это заявление о доступности будет регулярно пересматриваться и обновляться 
                по мере внесения изменений в наш веб-сайт и в соответствии с развитием 
                стандартов доступности.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}