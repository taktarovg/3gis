// src/components/landing/CategoriesSection.tsx
'use client';

import Link from 'next/link';

export function CategoriesSection() {
  const categories = [
    {
      id: 1,
      name: 'Рестораны и кафе',
      nameEn: 'Restaurants & Cafes',
      icon: '🍽️',
      description: 'Русская, украинская, грузинская и другая кухня народов СНГ',
      examples: ['Борщ & Сало', 'Золотой петушок', 'Мама Люба'],
      count: '200+',
    },
    {
      id: 2,
      name: 'Медицина',
      nameEn: 'Healthcare',
      icon: '⚕️',
      description: 'Врачи всех специальностей, говорящие на русском языке',
      examples: ['Семейные врачи', 'Стоматологи', 'Педиатры'],
      count: '150+',
    },
    {
      id: 3,
      name: 'Юридические услуги',
      nameEn: 'Legal Services',
      icon: '⚖️',
      description: 'Иммиграционные адвокаты, нотариусы, консультации',
      examples: ['Грин карта', 'Гражданство', 'Бизнес-право'],
      count: '80+',
    },
    {
      id: 4,
      name: 'Красота и здоровье',
      nameEn: 'Beauty & Health',
      icon: '💄',
      description: 'Салоны красоты, парикмахерские, SPA, массаж',
      examples: ['Маникюр', 'Стрижки', 'Косметология'],
      count: '120+',
    },
    {
      id: 5,
      name: 'Автосервисы',
      nameEn: 'Auto Services',
      icon: '🔧',
      description: 'Ремонт автомобилей, покупка, страхование',
      examples: ['Механики', 'Автодилеры', 'Страховка'],
      count: '90+',
    },
    {
      id: 6,
      name: 'Финансовые услуги',
      nameEn: 'Financial Services',
      icon: '🏦',
      description: 'Банки, кредиты, налоги, бухгалтерские услуги',
      examples: ['Налоги', 'Кредиты', 'Инвестиции'],
      count: '60+',
    },
    {
      id: 7,
      name: 'Образование',
      nameEn: 'Education',
      icon: '🎓',
      description: 'Русские школы, курсы, репетиторы, детские сады',
      examples: ['Русская школа', 'Репетиторы', 'Курсы'],
      count: '70+',
    },
    {
      id: 8,
      name: 'Недвижимость',
      nameEn: 'Real Estate',
      icon: '🏠',
      description: 'Агенты по недвижимости, аренда, покупка жилья',
      examples: ['Риелторы', 'Аренда', 'Ипотека'],
      count: '50+',
    },
  ];

  return (
    <section id="categories" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Все необходимые услуги в одном месте
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            8 основных категорий покрывают все потребности русскоговорящих американцев
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div 
              key={category.id}
              className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all duration-300 group hover:scale-105 hover:shadow-lg"
            >
              {/* Иконка и счетчик */}
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{category.icon}</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {category.count}
                </span>
              </div>
              
              {/* Название */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{category.nameEn}</p>
              
              {/* Описание */}
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {category.description}
              </p>
              
              {/* Примеры */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Примеры:
                </p>
                <div className="flex flex-wrap gap-1">
                  {category.examples.map((example, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-white text-gray-700 text-xs px-2 py-1 rounded border"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            Не нашли нужную категорию? Мы постоянно добавляем новые разделы
          </p>
          <a
            href="https://t.me/ThreeGIS_bot/app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200"
          >
            Посмотреть все заведения
          </a>
        </div>
      </div>
    </section>
  );
}
