// src/app/about/page.tsx
import { Users, MapPin, Shield, Zap, Target, Heart } from 'lucide-react';

export const metadata = {
  title: 'О проекте | 3GIS',
  description: 'О проекте 3GIS - современный справочник русскоязычных организаций в США',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            О проекте 3GIS
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
            Современный справочник русскоязычных организаций в США, созданный для упрощения 
            адаптации и поиска услуг на родном языке.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-16">
        {/* Mission */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Наша миссия
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Помочь 5,5 миллионам русскоговорящих американцев легко находить качественные услуги 
            на родном языке, создавая мост между сообществом и бизнесом.
          </p>
        </div>

        {/* Problem & Solution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Проблема
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Русскоговорящие жители США вынуждены искать услуги через десятки разрозненных 
              Facebook-групп и устаревших справочников. Языковые барьеры усложняют использование 
              обычных американских платформ типа Yelp или Google Maps.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Решение
            </h3>
            <p className="text-gray-600 leading-relaxed">
              3GIS объединяет всю информацию о русскоязычных заведениях в одной современной 
              платформе через Telegram Mini App с автоматической авторизацией, геолокацией 
              и системой отзывов.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Ключевые особенности
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Telegram интеграция
              </h3>
              <p className="text-gray-600">
                Автоматическая авторизация через Telegram без регистрации и паролей
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Геолокация
              </h3>
              <p className="text-gray-600">
                Поиск заведений "рядом со мной" с точным расчетом расстояний и маршрутов
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Верификация
              </h3>
              <p className="text-gray-600">
                Система проверки заведений и отзывов для гарантии качества информации
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Категории услуг
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🍽️', name: 'Рестораны' },
              { icon: '⚕️', name: 'Медицина' },
              { icon: '⚖️', name: 'Юристы' },
              { icon: '💄', name: 'Красота' },
              { icon: '🔧', name: 'Автосервисы' },
              { icon: '🏦', name: 'Финансы' },
              { icon: '🎓', name: 'Образование' },
              { icon: '🏠', name: 'Недвижимость' },
            ].map((category, index) => (
              <div key={index} className="text-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium text-gray-700">{category.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Для кого создан 3GIS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                👥 Для пользователей
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Новые иммигранты из России, Украины и стран СНГ
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Русскоговорящие американцы второго поколения
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Туристы и временные резиденты
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Люди, предпочитающие общение на русском языке
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                🏢 Для бизнеса
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Врачи и медицинские центры
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Рестораны с русской/восточноевропейской кухней
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Юристы по иммиграционному праву
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Салоны красоты и мастера индустрии красоты
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Масштаб рынка
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5.5M</div>
              <div className="text-blue-100">Русскоговорящих в США</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$80K</div>
              <div className="text-blue-100">Медианный доход семьи</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Крупных городов с сообществами</div>
            </div>
          </div>
        </div>

        {/* Development Status */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Статус разработки
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center mr-4">
                  <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">MVP готов (Q1 2025)</h3>
                  <p className="text-gray-600 text-sm">Базовый функционал поиска и добавления заведений через Telegram</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mr-4">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Монетизация (Q2 2025)</h3>
                  <p className="text-gray-600 text-sm">Telegram Stars для премиум-подписок заведений</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-4">
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Масштабирование (Q3-Q4 2025)</h3>
                  <p className="text-gray-600 text-sm">Расширение на все крупные города, партнерские программы</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Технологии
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Next.js 14', description: 'React фреймворк' },
              { name: 'Telegram SDK', description: 'Mini App интеграция' },
              { name: 'PostgreSQL', description: 'База данных' },
              { name: 'Supabase', description: 'Backend-as-a-Service' },
              { name: 'Google Maps', description: 'Геолокация' },
              { name: 'Vercel', description: 'Хостинг и деплой' },
              { name: 'TypeScript', description: 'Типизированный код' },
              { name: 'Tailwind CSS', description: 'Современный дизайн' },
            ].map((tech, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center border border-gray-200">
                <div className="font-semibold text-gray-900 text-sm">{tech.name}</div>
                <div className="text-xs text-gray-500 mt-1">{tech.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Команда
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
            3GIS создается опытным разработчиком с пониманием потребностей русскоязычного 
            сообщества в США и технической экспертизой для создания современных решений.
          </p>
          
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-red-500 mr-2" />
              <span className="text-gray-600">Создано с любовью к сообществу</span>
            </div>
            <p className="text-gray-600 text-sm">
              Мы понимаем проблемы адаптации в новой стране и стремимся сделать жизнь 
              русскоговорящих американцев комфортнее через технологии.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}