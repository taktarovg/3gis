// src/app/legal/privacy/page.tsx
export const metadata = {
  title: 'Политика конфиденциальности | 3GIS',
  description: 'Политика конфиденциальности 3GIS - как мы собираем, используем и защищаем ваши данные',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Политика конфиденциальности
          </h1>
          <p className="text-gray-600 mb-8">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Общие положения
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Настоящая Политика конфиденциальности описывает, как 3GIS ("мы", "наш", "нас") 
                собирает, использует и защищает информацию пользователей нашего сервиса.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Используя 3GIS, вы соглашаетесь с условиями данной политики конфиденциальности.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Какую информацию мы собираем
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                2.1 Информация от Telegram
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Имя пользователя (имя и фамилия)</li>
                <li>Username в Telegram (если указан)</li>
                <li>Уникальный ID пользователя Telegram</li>
                <li>Аватар (если разрешен доступ)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                2.2 Данные о местоположении
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Приблизительное местоположение (город, штат)</li>
                <li>Координаты GPS (только с вашего разрешения)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                2.3 Пользовательский контент
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Отзывы о заведениях</li>
                <li>Рейтинги и комментарии</li>
                <li>Информация о добавленных заведениях</li>
                <li>Избранные места</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Как мы используем информацию
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Предоставление и улучшение наших услуг</li>
                <li>Персонализация контента и рекомендаций</li>
                <li>Обработка отзывов и рейтингов</li>
                <li>Обеспечение безопасности и предотвращение мошенничества</li>
                <li>Связь с пользователями по вопросам сервиса</li>
                <li>Аналитика использования для улучшения платформы</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Передача данных третьим лицам
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Мы НЕ продаем, НЕ сдаем в аренду и НЕ передаем вашу личную информацию 
                третьим лицам, за исключением следующих случаев:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>С вашего явного согласия</li>
                <li>Владельцам заведений (только контактная информация при необходимости)</li>
                <li>Поставщикам услуг, помогающим в работе платформы (хостинг, аналитика)</li>
                <li>При требовании закона или судебного решения</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Ваши права (CCPA и GDPR)
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Вы имеете право:
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Доступ:</strong> Запросить копию ваших персональных данных</li>
                <li><strong>Исправление:</strong> Обновить неточную информацию</li>
                <li><strong>Удаление:</strong> Запросить удаление ваших данных ("право на забвение")</li>
                <li><strong>Портируемость:</strong> Получить данные в структурированном формате</li>
                <li><strong>Отказ:</strong> Отказаться от обработки данных в маркетинговых целях</li>
              </ul>
              
              <p className="text-gray-700 mt-4">
                Для реализации этих прав свяжитесь с нами: 
                <a href="mailto:privacy@3gis.us" className="text-blue-600 underline ml-1">
                  privacy@3gis.us
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Безопасность данных
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Мы применяем современные технические и организационные меры для защиты 
                ваших персональных данных:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Шифрование данных при передаче и хранении</li>
                <li>Регулярные аудиты безопасности</li>
                <li>Контроль доступа и мониторинг</li>
                <li>Резервное копирование и восстановление</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Защита детей (COPPA)
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                  🧒 Важная информация для родителей
                </h3>
                <p className="text-yellow-700 leading-relaxed mb-4">
                  3GIS соблюдает требования Закона о защите конфиденциальности детей в Интернете 
                  (COPPA) и НЕ предназначен для детей младше 13 лет.
                </p>
                <ul className="list-disc list-inside text-yellow-700 space-y-2">
                  <li>Мы не собираем сознательно персональную информацию от детей младше 13 лет</li>
                  <li>Если нам становится известно о сборе данных от ребенка младше 13 лет, мы немедленно удаляем эту информацию</li>
                  <li>Родители могут связаться с нами для удаления данных своего ребенка</li>
                  <li>Telegram требует возраст от 13 лет для создания аккаунта</li>
                </ul>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Для родителей:</strong> Если вы считаете, что ваш ребенок младше 13 лет 
                предоставил нам персональную информацию, немедленно свяжитесь с нами по адресу 
                <a href="mailto:privacy@3gis.us" className="text-blue-600 underline">privacy@3gis.us</a>. 
                Мы удалим эту информацию из наших систем в течение 48 часов.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Контактная информация
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>По вопросам конфиденциальности:</strong>
                </p>
                <p className="text-gray-700 mb-1">
                  Email: <a href="mailto:privacy@3gis.us" className="text-blue-600 underline">privacy@3gis.us</a>
                </p>
                <p className="text-gray-700 mb-1">
                  Телефон: <a href="tel:+1234567890" className="text-blue-600 underline">+1 (234) 567-890</a>
                </p>
                <p className="text-gray-700">
                  Почтовый адрес: [Укажите после регистрации LLC]
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}