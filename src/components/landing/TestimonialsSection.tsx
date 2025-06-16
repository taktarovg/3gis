// src/components/landing/TestimonialsSection.tsx
'use client';

import { Star, Quote } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: 'Елена М.',
      location: 'Нью-Йорк, NY',
      avatar: '👩‍💼',
      rating: 5,
      text: 'Наконец-то появился удобный справочник! Нашла отличного русскоговорящего педиатра для ребенка за 5 минут. Раньше приходилось часами искать в Facebook группах.',
      category: 'Медицина',
    },
    {
      id: 2,
      name: 'Дмитрий К.',
      location: 'Лос-Анджелес, CA',
      avatar: '👨‍💻',
      rating: 5,
      text: 'Переехал в LA и не знал где найти нормальный борщ 😄 Через 3GIS нашел ресторан "Москва" - теперь хожу туда каждые выходные! Спасибо за удобное приложение.',
      category: 'Рестораны',
    },
    {
      id: 3,
      name: 'Анна С.',
      location: 'Майами, FL',
      avatar: '👩‍🎓',
      rating: 5,
      text: 'Как иммиграционный адвокат нужен был срочно. В 3GIS увидела отзывы на русском и выбрала проверенного специалиста. Грин карту получила без проблем!',
      category: 'Юристы',
    },
    {
      id: 4,
      name: 'Игорь В.',
      location: 'Чикаго, IL',
      avatar: '👨‍🔧',
      rating: 5,
      text: 'Машина сломалась в незнакомом районе. Открыл 3GIS, нашел русского механика в 2 км от меня. Починили быстро и честно. Рекомендую всем!',
      category: 'Автосервисы',
    },
    {
      id: 5,
      name: 'Мария П.',
      location: 'Сан-Франциско, CA',
      avatar: '👩‍💼',
      rating: 5,
      text: 'Открыла салон красоты и добавила его в 3GIS. За месяц клиентов стало в 3 раза больше! Все русскоговорящие девочки теперь ходят ко мне.',
      category: 'Бизнес',
    },
    {
      id: 6,
      name: 'Александр Т.',
      location: 'Бостон, MA',
      avatar: '👨‍🎓',
      rating: 5,
      text: 'Искал русскую школу для дочки. В 3GIS нашел школу с отличными отзывами прямо в нашем районе. Дочка счастлива, что может учить русский с друзьями!',
      category: 'Образование',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Что говорят наши пользователи
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Тысячи русскоговорящих американцев уже используют 3GIS в повседневной жизни
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              {/* Quote Icon */}
              <div className="flex justify-between items-start mb-4">
                <Quote className="w-8 h-8 text-blue-200 transform rotate-180" />
                <div className="flex items-center">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              {/* Testimonial Text */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>
              
              {/* User Info */}
              <div className="flex items-center">
                <span className="text-2xl mr-3">{testimonial.avatar}</span>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.location}</div>
                  <div className="text-xs text-blue-600 font-medium mt-1">
                    {testimonial.category}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Trust Badge */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center bg-green-50 text-green-800 px-6 py-3 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="font-medium">Более 10,000 довольных пользователей</span>
          </div>
        </div>
      </div>
    </section>
  );
}
