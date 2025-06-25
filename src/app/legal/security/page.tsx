// src/app/legal/security/page.tsx
export const metadata = {
  title: 'Политика безопасности | 3GIS',
  description: 'Как 3GIS защищает ваши данные - технические и организационные меры безопасности',
};

export default function SecurityPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Политика безопасности данных
          </h1>
          <p className="text-gray-600 mb-8">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>

          <div className="prose prose-lg max-w-none">
            {/* Security Overview */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Обзор безопасности
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                3GIS применяет многоуровневую систему защиты данных, соответствующую 
                современным стандартам информационной безопасности и требованиям 
                CCPA, GDPR и других применимых законов о защите данных.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                  🛡️ Наши принципы безопасности
                </h3>
                <ul className="list-disc list-inside text-blue-700 space-y-2">
                  <li><strong>Privacy by Design</strong> - безопасность заложена в архитектуру</li>
                  <li><strong>Минимизация данных</strong> - собираем только необходимое</li>
                  <li><strong>Прозрачность</strong> - четко объясняем использование данных</li>
                  <li><strong>Контроль пользователей</strong> - вы управляете своими данными</li>
                </ul>
              </div>
            </section>

            {/* Technical Safeguards */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Технические меры защиты
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                2.1 Шифрование данных
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>TLS 1.3</strong> для всех соединений (HTTPS everywhere)</li>
                <li><strong>AES-256</strong> шифрование данных в покое</li>
                <li><strong>Хеширование паролей</strong> с использованием bcrypt</li>
                <li><strong>Шифрование базы данных</strong> на уровне диска</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                2.2 Инфраструктура безопасности
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Облачная инфраструктура</strong> с сертификацией SOC 2 Type II</li>
                <li><strong>Автоматическое резервное копирование</strong> с шифрованием</li>
                <li><strong>Географическое разделение</strong> серверов и backup</li>
                <li><strong>DDoS защита</strong> и мониторинг сетевого трафика</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                2.3 Безопасность приложения
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>JWT токены</strong> с коротким временем жизни</li>
                <li><strong>Rate limiting</strong> для предотвращения атак</li>
                <li><strong>Input validation</strong> и защита от SQL injection</li>
                <li><strong>CSRF protection</strong> во всех формах</li>
                <li><strong>Content Security Policy (CSP)</strong> заголовки</li>
              </ul>
            </section>

            {/* Organizational Measures */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Организационные меры
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                3.1 Контроль доступа
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Принцип наименьших привилегий</strong> - доступ только к необходимому</li>
                <li><strong>Двухфакторная аутентификация (2FA)</strong> для всех админов</li>
                <li><strong>Регулярная ротация</strong> паролей и API ключей</li>
                <li><strong>Журналирование</strong> всех действий с данными</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                3.2 Обучение персонала
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Регулярные тренинги</strong> по информационной безопасности</li>
                <li><strong>Политики BYOD</strong> (Bring Your Own Device)</li>
                <li><strong>Соглашения о неразглашении</strong> для всех сотрудников</li>
                <li><strong>Процедуры</strong> сообщения об инцидентах безопасности</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                3.3 Аудит и мониторинг
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Непрерывный мониторинг</strong> системных событий 24/7</li>
                <li><strong>Ежеквартальные аудиты</strong> безопасности</li>
                <li><strong>Penetration testing</strong> раз в полгода</li>
                <li><strong>Автоматические</strong> уведомления об аномалиях</li>
              </ul>
            </section>

            {/* Data Protection */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Защита персональных данных
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    📊 При сборе данных:
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Минимизация объема собираемых данных</li>
                    <li>• Прозрачное уведомление о цели сбора</li>
                    <li>• Получение явного согласия пользователя</li>
                    <li>• Шифрование при передаче</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    🔒 При хранении данных:
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Шифрование в покое (AES-256)</li>
                    <li>• Географическое распределение backup</li>
                    <li>• Контроль доступа по ролям</li>
                    <li>• Регулярная очистка устаревших данных</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                4.1 Обработка запросов пользователей
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Мы обрабатываем все запросы пользователей в соответствии с требованиями 
                CCPA, GDPR и других применимых законов:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Доступ к данным</strong> - предоставляем в течение 45 дней</li>
                <li><strong>Исправление данных</strong> - корректируем неточности</li>
                <li><strong>Удаление данных</strong> - безвозвратно стираем по запросу</li>
                <li><strong>Портируемость данных</strong> - выгружаем в стандартных форматах</li>
              </ul>
            </section>

            {/* Incident Response */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Реагирование на инциденты
              </h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-red-800 mb-3">
                  🚨 План реагирования на нарушения безопасности
                </h3>
                <ol className="list-decimal list-inside text-red-700 space-y-2">
                  <li><strong>Обнаружение</strong> - автоматические системы мониторинга</li>
                  <li><strong>Изоляция</strong> - немедленная остановка утечки</li>
                  <li><strong>Оценка</strong> - определение масштаба инцидента</li>
                  <li><strong>Уведомление</strong> - регуляторы в течение 72 часов</li>
                  <li><strong>Коммуникация</strong> - пользователи в течение 5 дней</li>
                  <li><strong>Восстановление</strong> - устранение уязвимостей</li>
                  <li><strong>Анализ</strong> - извлечение уроков для будущего</li>
                </ol>
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                5.1 Уведомление пользователей
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                В случае нарушения безопасности, которое может повлиять на ваши данные, 
                мы обязуемся:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Уведомить вас в течение 72 часов с момента обнаружения</li>
                <li>Предоставить четкую информацию о произошедшем</li>
                <li>Объяснить, какие данные могли быть затронуты</li>
                <li>Рассказать о принятых мерах по устранению проблемы</li>
                <li>Дать рекомендации по защите ваших аккаунтов</li>
              </ul>
            </section>

            {/* Compliance */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Соответствие стандартам
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🇺🇸</div>
                  <h3 className="font-semibold mb-2">CCPA/CPRA</h3>
                  <p className="text-sm text-gray-600">Калифорнийский закон о защите данных</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🇪🇺</div>
                  <h3 className="font-semibold mb-2">GDPR</h3>
                  <p className="text-sm text-gray-600">Европейский регламент о защите данных</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🔒</div>
                  <h3 className="font-semibold mb-2">SOC 2</h3>
                  <p className="text-sm text-gray-600">Стандарт безопасности облачных сервисов</p>
                </div>
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                6.1 Регулярные аудиты
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Внутренние аудиты</strong> - ежемесячно</li>
                <li><strong>Внешние аудиты</strong> - ежегодно</li>
                <li><strong>Penetration testing</strong> - каждые 6 месяцев</li>
                <li><strong>Compliance review</strong> - при изменении законодательства</li>
              </ul>
            </section>

            {/* Third Party Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Безопасность третьих сторон
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                7.1 Партнеры и поставщики
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Все наши партнеры проходят тщательную проверку безопасности:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Due diligence</strong> перед началом сотрудничества</li>
                <li><strong>Соглашения о защите данных (DPA)</strong> с каждым партнером</li>
                <li><strong>Регулярные аудиты</strong> систем безопасности партнеров</li>
                <li><strong>Минимизация доступа</strong> к нашим данным</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                7.2 Основные технологические партнеры
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li><strong>Supabase</strong> - база данных (SOC 2 Type II сертифицирован)</li>
                  <li><strong>Vercel</strong> - хостинг приложения (ISO 27001 сертифицирован)</li>
                  <li><strong>AWS S3</strong> - хранение файлов (множественные сертификации)</li>
                  <li><strong>Telegram</strong> - аутентификация (end-to-end encryption)</li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Контакты по безопасности
              </h2>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Сообщить об инциденте безопасности
                </h3>
                <div className="text-gray-700 space-y-2">
                  <p>
                    <strong>Email безопасности:</strong> 
                    <a href="mailto:security@3gis.us" className="text-red-600 underline ml-1">
                      security@3gis.us
                    </a>
                  </p>
                  <p>
                    <strong>Экстренная линия:</strong> 
                    <a href="tel:+1234567890" className="text-red-600 underline ml-1">
                      +1 (234) 567-890 (24/7)
                    </a>
                  </p>
                  <p>
                    <strong>PGP ключ:</strong> 
                    <a href="/pgp-key.txt" className="text-blue-600 underline ml-1">
                      Скачать публичный ключ
                    </a>
                  </p>
                  <p className="text-sm text-gray-600 mt-4">
                    <strong>Время ответа:</strong> В течение 2 часов на критические инциденты, 
                    24 часа на обычные вопросы безопасности.
                  </p>
                </div>
              </div>
            </section>

            {/* Last Updated */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
              <p>
                Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
              </p>
              <p className="mt-1">
                Данная политика регулярно пересматривается и обновляется в соответствии 
                с изменениями в технологиях и законодательстве.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
