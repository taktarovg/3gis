// src/components/landing/StatsSection.tsx
'use client';

import { MapPin, Building2, Users, Star } from 'lucide-react';

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: '5.5M',
      label: 'Русскоговорящих в США',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: MapPin,
      value: '50+',
      label: 'Городов покрыто',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Building2,
      value: '1000+',
      label: 'Проверенных заведений',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Star,
      value: '8',
      label: 'Категорий услуг',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Русскоязычная Америка в цифрах
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Мы объединяем крупнейшее русскоговорящее сообщество в США
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${stat.bgColor} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Дополнительная информация */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              🇺🇸 Почему важен русскоязычный справочник?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Языковой барьер</h4>
                <p className="text-gray-600 text-sm">
                  Сложно объяснить симптомы врачу или юридические вопросы на английском
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Культурное понимание</h4>
                <p className="text-gray-600 text-sm">
                  Русскоговорящие специалисты лучше понимают потребности иммигрантов
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Доверие и качество</h4>
                <p className="text-gray-600 text-sm">
                  Отзывы от русскоязычного сообщества помогают выбрать лучших
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
