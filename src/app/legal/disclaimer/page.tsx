// src/app/legal/disclaimer/page.tsx
export const metadata = {
  title: 'Отказ от ответственности | 3GIS',
  description: 'Отказ от ответственности 3GIS - важная информация об ограничениях ответственности',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Отказ от ответственности
          </h1>
          <p className="text-gray-600 mb-8">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>

          <div className="prose prose-lg max-w-none">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                ⚠️ Важная информация
              </h3>
              <p className="text-yellow-700">
                Пожалуйста, внимательно прочитайте данный отказ от ответственности 
                перед использованием сервиса 3GIS. Использование нашей платформы 
                означает согласие с изложенными ниже условиями.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Характер предоставляемой информации
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                3GIS является <strong>информационной платформой</strong>, которая 
                агрегирует и отображает информацию о русскоязычных заведениях и 
                услугах в США. Мы НЕ являемся:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Рекламным агентством или посредником</li>
                <li>Гарантом качества услуг заведений</li>
                <li>Стороной в любых сделках между пользователями и заведениями</li>
                <li>Источником медицинских, юридических или финансовых консультаций</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Точность информации
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                2.1 Информация о заведениях
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Информация о заведениях (адреса, телефоны, часы работы, цены) 
                предоставляется пользователями и владельцами бизнесов. Мы НЕ ГАРАНТИРУЕМ:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Актуальность контактной информации</li>
                <li>Правильность указанных цен и услуг</li>
                <li>Соответствие реальных часов работы указанным</li>
                <li>Точность описаний заведений и их особенностей</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                2.2 Пользовательские отзывы
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Отзывы и рейтинги отражают <strong>субъективное мнение</strong> 
                пользователей. Мы НЕ МОЖЕМ ГАРАНТИРОВАТЬ:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Достоверность всех опубликованных отзывов</li>
                <li>Отсутствие предвзятости в оценках</li>
                <li>Актуальность отзывов на момент вашего посещения</li>
                <li>Соответствие вашего опыта описанному в отзывах</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Специальные отказы от ответственности
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                3.1 Медицинские услуги
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800">
                  <strong>ВАЖНО:</strong> Информация о медицинских учреждениях и 
                  специалистах предоставляется исключительно в справочных целях. 
                  Мы НЕ ПРОВЕРЯЕМ медицинские лицензии, квалификацию врачей или 
                  качество медицинских услуг.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Всегда самостоятельно проверяйте лицензии медицинских учреждений 
                и специалистов через официальные государственные реестры.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">
                3.2 Юридические услуги
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800">
                  <strong>ВАЖНО:</strong> Мы НЕ ПРОВЕРЯЕМ лицензии адвокатов, их 
                  специализацию или право на практику в конкретных штатах.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Проверяйте лицензии юристов через State Bar Associations и убеждайтесь 
                в их праве на практику в вашем штате.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3 mt-6">
                3.3 Финансовые услуги
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Информация о финансовых услугах НЕ ЯВЛЯЕТСЯ финансовой консультацией. 
                Всегда консультируйтесь с лицензированными финансовыми консультантами 
                и проверяйте регистрацию компаний в соответствующих регулирующих органах.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Ограничения ответственности
              </h2>
              
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Мы НЕ НЕСЕМ ОТВЕТСТВЕННОСТИ за:
                </h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                  <li>Качество товаров и услуг, предоставляемых заведениями</li>
                  <li>Любые убытки от использования неточной информации</li>
                  <li>Результаты медицинского, юридического или финансового консультирования</li>
                  <li>Ущерб от несвоевременности или недоступности информации</li>
                  <li>Действия или бездействие владельцев заведений</li>
                  <li>Нарушение заведениями местных законов и регулирований</li>
                  <li>Проблемы с платежами между пользователями и заведениями</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Рекомендации пользователям
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                5.1 Обязательные проверки
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li><strong>Всегда звоните</strong> заведениям для подтверждения часов работы</li>
                <li><strong>Проверяйте лицензии</strong> медицинских и юридических специалистов</li>
                <li><strong>Уточняйте цены</strong> непосредственно у поставщиков услуг</li>
                <li><strong>Читайте отзывы критически</strong>, обращая внимание на дату публикации</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                5.2 Безопасность
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Будьте осторожны при передаче личной информации</li>
                <li>Не совершайте предоплаты без проверки заведения</li>
                <li>При подозрениях на мошенничество сообщайте нам</li>
                <li>Доверяйте своей интуиции при выборе услуг</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Контактная информация
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>По вопросам отказа от ответственности:</strong>
                </p>
                <p className="text-gray-700 mb-1">
                  Email: <a href="mailto:legal@3gis.us" className="text-blue-600 underline">legal@3gis.us</a>
                </p>
                <p className="text-gray-700 mb-1">
                  Поддержка: <a href="mailto:support@3gis.us" className="text-blue-600 underline">support@3gis.us</a>
                </p>
                <p className="text-gray-700 mb-1">
                  Телефон: <a href="tel:+1234567890" className="text-blue-600 underline">+1 (234) 567-890</a>
                </p>
              </div>
            </section>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                📋 Итоговое напоминание
              </h3>
              <p className="text-red-700 text-sm leading-relaxed">
                3GIS является исключительно <strong>информационной платформой</strong>. 
                Мы предоставляем справочную информацию "как есть" и настоятельно 
                рекомендуем пользователям самостоятельно проверять всю информацию 
                перед принятием важных решений, особенно касающихся здоровья, 
                юридических и финансовых вопросов.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}