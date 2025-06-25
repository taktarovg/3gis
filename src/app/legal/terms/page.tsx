// src/app/legal/terms/page.tsx
export const metadata = {
  title: 'Условия использования | 3GIS',
  description: 'Условия использования сервиса 3GIS - права и обязанности пользователей',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Условия использования
          </h1>
          <p className="text-gray-600 mb-8">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Принятие условий
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Добро пожаловать в 3GIS! Используя наш сервис, вы соглашаетесь соблюдать 
                данные Условия использования ("Условия"). Если вы не согласны с какой-либо 
                частью этих условий, пожалуйста, не используйте наш сервис.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Описание сервиса
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                3GIS - это платформа-справочник русскоязычных организаций в США, 
                работающая через Telegram Mini App. Мы предоставляем:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Поиск и каталогизацию заведений и услуг</li>
                <li>Систему отзывов и рейтингов</li>
                <li>Геолокационные услуги</li>
                <li>Возможность добавления новых заведений</li>
                <li>Премиум-функции для владельцев бизнеса</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Учетные записи пользователей
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                3.1 Регистрация
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Для использования 3GIS необходимо иметь активную учетную запись Telegram. 
                Авторизация происходит автоматически через Telegram Web App API.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                3.2 Ответственность за аккаунт
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Вы несете ответственность за безопасность своего Telegram аккаунта</li>
                <li>Запрещено создавать фальшивые или вводящие в заблуждение профили</li>
                <li>Один пользователь может иметь только один аккаунт</li>
                <li>Мы вправе заблокировать аккаунты, нарушающие наши правила</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Пользовательский контент
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                4.1 Ваш контент
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Вы сохраняете права на весь контент, который публикуете в 3GIS (отзывы, 
                фотографии, информацию о заведениях). Публикуя контент, вы предоставляете 
                нам неисключительную лицензию на его использование в рамках нашего сервиса.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                4.2 Запрещенный контент
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Оскорбительные, клеветнические или дискриминационные материалы</li>
                <li>Спам, реклама без разрешения или массовые рассылки</li>
                <li>Ложные отзывы или накрутка рейтингов</li>
                <li>Нарушение авторских прав или других прав интеллектуальной собственности</li>
                <li>Материалы, нарушающие законы США или международное право</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Правила поведения
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                5.1 Разрешенное использование
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Поиск заведений и услуг для личного использования</li>
                <li>Написание честных отзывов на основе личного опыта</li>
                <li>Добавление достоверной информации о заведениях</li>
                <li>Использование премиум-функций согласно условиям подписки</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                5.2 Запрещенные действия
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Создание ложных или фиктивных заведений</li>
                <li>Манипулирование рейтингами или отзывами</li>
                <li>Использование автоматизированных систем (ботов) без разрешения</li>
                <li>Попытки взлома или нарушения безопасности сервиса</li>
                <li>Коммерческое использование данных без письменного согласия</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Премиум-подписки и платежи
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                6.1 Telegram Stars
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Премиум-функции оплачиваются через Telegram Stars. Все транзакции 
                обрабатываются Telegram согласно их условиям использования.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                6.2 Возврат средств
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Возврат средств осуществляется в соответствии с политикой Telegram Stars. 
                При технических проблемах с нашей стороны мы обеспечим компенсацию 
                или продление подписки.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                6.3 Автоматическое продление
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Подписки НЕ продлеваются автоматически. Пользователи должны вручную 
                продлевать премиум-подписки по истечении срока действия.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Интеллектуальная собственность
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                3GIS, наш логотип, дизайн и программное обеспечение защищены авторским 
                правом и являются собственностью компании. Пользователи получают 
                ограниченную лицензию на использование сервиса исключительно в 
                личных некоммерческих целях.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Отказ от ответственности
              </h2>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800 font-medium">
                  ВАЖНО: 3GIS предоставляется "как есть" без каких-либо гарантий.
                </p>
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                8.1 Информация о заведениях
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Мы не гарантируем точность информации о заведениях</li>
                <li>Часы работы, цены и услуги могут изменяться без уведомления</li>
                <li>Пользователи должны самостоятельно проверять информацию</li>
                <li>Мы не несем ответственности за качество услуг заведений</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                8.2 Отзывы и рейтинги
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Отзывы отражают личное мнение пользователей. Мы не можем гарантировать 
                их достоверность, несмотря на модерацию контента.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                8.3 Доступность сервиса
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Мы стремимся обеспечить бесперебойную работу сервиса, но не гарантируем 
                100% доступность. Периодические технические работы могут временно 
                ограничить доступ к платформе.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Ограничение ответственности
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                В максимально допустимых законом пределах наша ответственность 
                ограничивается суммой, уплаченной вами за использование премиум-функций 
                в течение 12 месяцев, предшествующих возникновению претензии.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Мы не несем ответственности за косвенные, случайные или специальные 
                убытки, включая упущенную прибыль или потерю данных.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Прекращение использования
              </h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                10.1 Ваше право
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Вы можете прекратить использование 3GIS в любое время. Для удаления 
                учетной записи свяжитесь с нами по адресу support@3gis.us.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">
                10.2 Наше право
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Мы можем заблокировать или удалить аккаунты, нарушающие данные Условия, 
                с предварительным уведомлением (за исключением случаев серьезных нарушений).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Применимое право и разрешение споров
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Данные Условия регулируются законами штата [Укажите штат регистрации LLC]. 
                Все споры подлежат рассмотрению в судах данной юрисдикции.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Мы рекомендуем сначала попытаться решить любые разногласия путем 
                прямого обращения в нашу службу поддержки.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Изменения в условиях
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Мы можем периодически обновлять данные Условия. О существенных 
                изменениях мы уведомим пользователей через Telegram или другими 
                доступными способами минимум за 30 дней до вступления в силу.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Продолжение использования сервиса после изменений означает принятие 
                новых условий.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Контактная информация
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>По вопросам условий использования:</strong>
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
                <p className="text-gray-700">
                  Почтовый адрес: [Укажите после регистрации LLC]
                </p>
              </div>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <p className="text-blue-800 text-sm">
                <strong>Последнее обновление:</strong> {new Date().toLocaleDateString('ru-RU')}
                <br />
                Эти условия вступают в силу немедленно для новых пользователей и 
                через 30 дней для существующих пользователей.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}