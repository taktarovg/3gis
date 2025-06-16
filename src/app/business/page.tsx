// src/app/business/page.tsx
import { ArrowLeft, CheckCircle, Star, TrendingUp, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Для владельцев бизнеса - 3GIS',
  description: 'Увеличьте количество клиентов среди русскоговорящих американцев. Добавьте свой бизнес в 3GIS и получите доступ к 5.5 миллионам потенциальных клиентов.',
};

export default function BusinessPage() {
  const plans = [
    {
      name: 'Базовый',
      price: '$49',
      period: '/месяц',
      features: [
        'Верифицированный профиль с галочкой',
        'До 10 фотографий',
        'Ответы на отзывы',
        'Базовая статистика просмотров',
        'Контактная информация'
      ],
      recommended: false
    },
    {
      name: 'Стандарт',
      price: '$149',
      period: '/месяц',
      features: [
        'Приоритет в результатах поиска (топ-3)',
        'До 25 фотографий',
        'Детальная аналитика',
        'Промо-посты в ленте',
        'Интеграция с соцсетями'
      ],
      recommended: true
    },
    {
      name: 'Премиум',
      price: '$299',
      period: '/месяц',
      features: [
        'Гарантированная позиция #1 в категории',
        'Неограниченное количество фото',
        'Рекламные блоки в поиске',
        'Персональный менеджер',
        'Брендированный дизайн карточки'
      ],
      recommended: false
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться на главную
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Привлекайте русскоговорящих клиентов
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Добавьте свой бизнес в 3GIS и получите доступ к <strong>5.5 миллионам</strong> русскоговорящих американцев. 
            Увеличьте поток клиентов уже сегодня!
          </p>
          <a
            href="https://t.me/ThreeGIS_bot/app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg"
          >
            Добавить заведение бесплатно
          </a>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Почему стоит присоединиться к 3GIS?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Целевая аудитория
              </h3>
              <p className="text-gray-600">
                5.5 миллионов русскоговорящих американцев ищут качественные услуги на родном языке
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Рост клиентов
              </h3>
              <p className="text-gray-600">
                В среднем наши партнеры видят увеличение клиентской базы на 40% в первые 3 месяца
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Отзывы и рейтинги
              </h3>
              <p className="text-gray-600">
                Система отзывов на русском языке помогает клиентам выбрать именно вас
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Высокий доход
              </h3>
              <p className="text-gray-600">
                Медианный доход русскоговорящих американцев составляет $80,554 - выше среднего по стране
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Выберите подходящий план
            </h2>
            <p className="text-xl text-gray-600">
              Начните с бесплатного размещения и переходите на премиум когда будете готовы
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`bg-white rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                  plan.recommended 
                    ? 'border-blue-500 shadow-lg relative' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Рекомендуем
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <a
                  href="https://t.me/ThreeGIS_bot/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-colors duration-200 ${
                    plan.recommended
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Выбрать план
                </a>
              </div>
            ))}
          </div>

          {/* Free Plan */}
          <div className="mt-12 text-center">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                🎉 Бесплатное размещение
              </h3>
              <p className="text-gray-700 mb-6">
                Добавьте свое заведение в 3GIS бесплатно! Базовая карточка с контактами, 
                описанием и возможностью получать отзывы.
              </p>
              <a
                href="https://t.me/ThreeGIS_bot/app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors duration-200"
              >
                Добавить бесплатно
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Истории успеха наших партнеров
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Ресторан &ldquo;Русский дом&rdquo;
              </h3>
              <p className="text-gray-600 mb-4">
                &ldquo;За первый месяц в 3GIS количество заказов увеличилось на 60%. 
                Теперь к нам приезжают русские из всего Нью-Йорка!&rdquo;
              </p>
              <div className="text-sm text-gray-500">
                Владелец: Анна Петрова, Бруклин
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-4xl mb-4">💄</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Салон &ldquo;Красота&rdquo;
              </h3>
              <p className="text-gray-600 mb-4">
                &ldquo;3GIS помог найти постоянных клиентов. Отзывы на русском 
                очень важны - люди доверяют мнению соотечественников.&rdquo;
              </p>
              <div className="text-sm text-gray-500">
                Владелица: Мария Сидорова, Лос-Анджелес
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-4xl mb-4">⚖️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Юридическая фирма
              </h3>
              <p className="text-gray-600 mb-4">
                &ldquo;Благодаря 3GIS ко мне обращаются клиенты со всей Флориды. 
                Премиум план окупился уже через 2 недели.&rdquo;
              </p>
              <div className="text-sm text-gray-500">
                Адвокат: Дмитрий Козлов, Майами
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Часто задаваемые вопросы
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Как быстро мое заведение появится в поиске?
              </h3>
              <p className="text-gray-600">
                После добавления ваше заведение проходит модерацию в течение 24 часов. 
                После одобрения оно сразу становится видимым всем пользователям.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Можно ли изменить план в любое время?
              </h3>
              <p className="text-gray-600">
                Да, вы можете повысить или понизить тарифный план в любое время. 
                Изменения вступают в силу немедленно.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Как я буду получать уведомления о новых отзывах?
              </h3>
              <p className="text-gray-600">
                Все уведомления приходят прямо в Telegram. Вы сможете быстро отвечать 
                на отзывы и общаться с клиентами.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Есть ли гарантия результата?
              </h3>
              <p className="text-gray-600">
                Мы гарантируем увеличение видимости вашего бизнеса среди русскоговорящей аудитории. 
                Если в первый месяц вы не увидите результатов, вернем деньги.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Готовы увеличить поток клиентов?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Присоединяйтесь к тысячам успешных бизнесов в 3GIS. 
              Начните привлекать русскоговорящих клиентов уже сегодня!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://t.me/ThreeGIS_bot/app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                Добавить заведение
              </a>
              <a
                href="mailto:business@3gis.us"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                Связаться с нами
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
