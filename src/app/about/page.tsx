// src/app/about/page.tsx
import { ArrowLeft, Users, MapPin, Star, Heart } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'О проекте 3GIS',
  description: 'История создания русскоязычного справочника организаций в США. Наша миссия - помочь 5.5 миллионам русскоговорящих американцев найти качественные услуги на родном языке.',
};

export default function AboutPage() {
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            О проекте 3<span className="text-blue-600">GIS</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Мы создаем мост между русскоговорящими американцами и качественными услугами, 
            решая проблему языкового барьера в повседневной жизни.
          </p>
        </div>

        {/* Our Mission */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Наша миссия
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              В США живет более <strong>5.5 миллионов русскоговорящих</strong> - это огромное сообщество, 
              которое ежедневно сталкивается с необходимостью поиска качественных услуг. Языковой барьер 
              особенно критичен в таких сферах как медицина, юридические услуги и образование.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              3GIS решает эту проблему, предоставляя удобную современную платформу для поиска 
              русскоязычных специалистов и заведений с отзывами от сообщества на родном языке.
            </p>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Русскоязычная Америка в цифрах
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center bg-gray-50 rounded-xl p-6">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">5.5M</div>
              <div className="text-gray-600">Русскоговорящих в США</div>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-6">
              <MapPin className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">50+</div>
              <div className="text-gray-600">Крупных городов</div>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-6">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">$80K</div>
              <div className="text-gray-600">Медианный доход</div>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-6">
              <Heart className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">67%</div>
              <div className="text-gray-600">В профессиональной сфере</div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            История проекта
          </h2>
          <div className="prose prose-lg max-w-none">
            <div className="bg-white border-l-4 border-blue-600 pl-6 py-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Проблема</h3>
              <p className="text-gray-700 leading-relaxed">
                Поиск русскоязычных услуг в США — это настоящий квест. Люди часами ищут информацию 
                в десятках разрозненных Facebook-групп, Telegram-каналов и устаревших справочников. 
                Особенно сложно найти проверенных врачей, юристов и других специалистов, которые 
                говорят по-русски и понимают культурные особенности.
              </p>
            </div>

            <div className="bg-white border-l-4 border-green-600 pl-6 py-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Решение</h3>
              <p className="text-gray-700 leading-relaxed">
                3GIS объединяет все русскоязычные услуги в одном удобном приложении. Используя 
                современные технологии (Telegram Mini App, геолокация, отзывы сообщества), 
                мы делаем поиск быстрым, удобным и надежным.
              </p>
            </div>

            <div className="bg-white border-l-4 border-purple-600 pl-6 py-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Будущее</h3>
              <p className="text-gray-700 leading-relaxed">
                Наша цель — стать главным справочником для русскоговорящих американцев. 
                Мы планируем добавить онлайн-бронирование, систему лояльности, 
                интеграцию с доставкой еды и многие другие возможности.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Почему 3GIS?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🚀 Современные технологии
              </h3>
              <p className="text-gray-700">
                Telegram Mini App, геолокация, умный поиск — всё это работает 
                быстро и не требует установки дополнительных приложений.
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ✅ Проверенные заведения
              </h3>
              <p className="text-gray-700">
                Все организации проходят модерацию. Мы следим за качеством 
                и актуальностью информации.
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                💬 Отзывы на русском
              </h3>
              <p className="text-gray-700">
                Читайте честные отзывы от русскоговорящего сообщества. 
                Никакой языковой путаницы.
              </p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🌍 Вся Америка
              </h3>
              <p className="text-gray-700">
                От Нью-Йорка до Лос-Анджелеса — мы покрываем все крупные 
                города с русскоговорящим населением.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Присоединяйтесь к сообществу 3GIS
            </h2>
            <p className="text-xl opacity-90 mb-6">
              Помогите нам сделать жизнь русскоговорящих американцев проще и комфортнее
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://t.me/ThreeGIS_bot/app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                Открыть приложение
              </a>
              <Link
                href="/"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                На главную
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
