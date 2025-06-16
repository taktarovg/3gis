// src/components/landing/FooterSection.tsx
'use client';

import { MapPin, Mail, MessageCircle, Heart, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function FooterSection() {
  const cities = [
    'Нью-Йорк', 'Лос-Анджелес', 'Чикаго', 'Майами', 
    'Сан-Франциско', 'Бостон', 'Сиэтл', 'Филадельфия'
  ];

  const categories = [
    'Рестораны', 'Медицина', 'Юристы', 'Красота',
    'Автосервисы', 'Финансы', 'Образование', 'Недвижимость'
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <h3 className="text-2xl font-bold">
                3<span className="text-blue-400">GIS</span>
              </h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Современный справочник русскоязычных организаций в США. 
              Находите услуги на родном языке быстро и удобно.
            </p>
            
            {/* App Download */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Скачать приложение
              </p>
              <a
                href="https://t.me/ThreeGIS_bot/app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 group"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Открыть в Telegram
                <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
          
          {/* Cities */}
          <div>
            <h4 className="text-lg font-semibold mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-400" />
              Города
            </h4>
            <ul className="space-y-3">
              {cities.map((city, index) => (
                <li key={index}>
                  <a 
                    href="https://t.me/ThreeGIS_bot/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {city}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Категории</h4>
            <ul className="space-y-3">
              {categories.map((category, index) => (
                <li key={index}>
                  <a 
                    href="https://t.me/ThreeGIS_bot/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact & Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Контакты</h4>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Для бизнеса:</p>
                <a 
                  href="mailto:business@3gis.us"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  business@3gis.us
                </a>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-2">Поддержка:</p>
                <a 
                  href="https://t.me/ThreeGIS_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm flex items-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  @ThreeGIS_bot
                </a>
              </div>
              
              {/* Quick Links */}
              <div className="pt-4 space-y-2">
                <p className="text-gray-400 text-xs uppercase tracking-wide">Полезные ссылки</p>
                <div className="space-y-2">
                  <Link 
                    href="/about"
                    className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    О проекте
                  </Link>
                  <a 
                    href="https://t.me/ThreeGIS_bot/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Добавить заведение
                  </a>
                  <Link 
                    href="/business"
                    className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Для владельцев бизнеса
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center text-gray-400 text-sm mb-4 md:mb-0">
              <span>© 2025 3GIS. Сделано с</span>
              <Heart className="w-4 h-4 mx-1 text-red-400" />
              <span>для русскоговорящих американцев</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Политика конфиденциальности
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                Условия использования
              </a>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="text-center text-gray-400 text-sm">
              <p className="mb-2">
                3GIS - это проект для русскоязычного сообщества в США 🇺🇸
              </p>
              <p className="flex items-center justify-center flex-wrap gap-4">
                <span>📱 Telegram Mini App</span>
                <span>🗺️ Геолокация</span>
                <span>⭐ Отзывы на русском</span>
                <span>🚀 Быстрый поиск</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
