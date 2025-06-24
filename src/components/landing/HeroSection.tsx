// src/components/landing/HeroSection.tsx
'use client';

import { ArrowRight, MapPin, Users, Star } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      {/* Header с прозрачным фоном */}
      <Header variant="landing" transparent={true} />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8">
              <Users className="w-4 h-4 mr-2" />
              Более 5.5 млн русскоговорящих американцев доверяют нам
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              3<span className="text-blue-600">GIS</span>
              <br />
              <span className="text-3xl md:text-5xl font-normal text-gray-600">
                Твой проводник в Америке
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Находите <strong>рестораны</strong>, <strong>врачей</strong>, <strong>юристов</strong>, 
              <strong> салоны красоты</strong> и другие русскоязычные услуги по всей Америке. 
              Современный справочник в Telegram.
            </p>
            
            {/* Key Features */}
            <div className="flex flex-wrap justify-center gap-6 mb-10 text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                <span>Геолокация</span>
              </div>
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                <span>Отзывы на русском</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                <span>Проверенные заведения</span>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              {/* Главная CTA кнопка - ссылка на Telegram Mini App */}
              <Link
                href="https://t.me/ThreeGIS_bot/app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Открыть приложение
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              {/* Вторичная кнопка */}
              <Link
                href="#categories"
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 font-semibold rounded-xl transition-all duration-200"
              >
                Посмотреть категории
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Telegram Mini App
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Бесплатно для пользователей
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Проверенные заведения
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      
      {/* Background Decoration */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-yellow-200 rounded-full opacity-20 blur-3xl"></div>
    </section>
  );
}