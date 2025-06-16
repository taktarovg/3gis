// src/components/landing/FeaturesSection.tsx
'use client';

import { Smartphone, MapPin, Star, Shield, Search, Users, Clock, Heart } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Smartphone,
      title: 'Telegram Mini App',
      description: 'Работает прямо в Telegram без установки дополнительных приложений',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: MapPin,
      title: 'Геолокация',
      description: 'Находите ближайшие заведения и прокладывайте маршруты одним касанием',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Search,
      title: 'Умный поиск',
      description: 'Ищите по названию, адресу, категории или особым требованиям',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Star,
      title: 'Отзывы на русском',
      description: 'Читайте честные отзывы от русскоговорящего сообщества',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Shield,
      title: 'Проверенные заведения',
      description: 'Все организации проходят модерацию и проверку качества',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      icon: Users,
      title: 'Сообщество',
      description: 'Добавляйте новые места и помогайте соотечественникам',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      icon: Clock,
      title: 'Актуальная информация',
      description: 'Часы работы, телефоны и адреса всегда актуальны',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      icon: Heart,
      title: 'Избранное',
      description: 'Сохраняйте любимые места для быстрого доступа',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Почему выбирают 3GIS?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Современные технологии для комфортной жизни русскоговорящих в Америке
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.bgColor} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Готовы начать использовать 3GIS?
            </h3>
            <p className="text-xl opacity-90 mb-6">
              Присоединяйтесь к тысячам русскоговорящих американцев, которые уже нашли свои любимые места
            </p>
            <a
              href="https://t.me/ThreeGIS_bot/app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              Открыть в Telegram
              <Smartphone className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
