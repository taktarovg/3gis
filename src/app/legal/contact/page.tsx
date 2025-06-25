// src/app/legal/contact/page.tsx
import { Mail, Phone, MapPin, ExternalLink, Clock, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Контакты | 3GIS',
  description: 'Связаться с командой 3GIS - поддержка, партнерство, правовые вопросы',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Свяжитесь с нами
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Мы готовы помочь с любыми вопросами о 3GIS. Выберите наиболее удобный способ связи.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Methods */}
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Способы связи
            </h2>

            {/* General Support */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Общая поддержка
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Вопросы по использованию, технические проблемы, предложения
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <a href="mailto:support@3gis.us" className="text-blue-600 hover:underline">
                        support@3gis.us
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600 text-sm">Отвечаем в течение 24 часов</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Inquiries */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Бизнес и партнерство
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Премиум размещение, партнерские программы, корпоративные вопросы
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <a href="mailto:business@3gis.us" className="text-blue-600 hover:underline">
                        business@3gis.us
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <a href="tel:+1234567890" className="text-blue-600 hover:underline">
                        +1 (234) 567-890
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal & Privacy */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Правовые вопросы
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Конфиденциальность, GDPR/CCPA запросы, юридические вопросы
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <a href="mailto:legal@3gis.us" className="text-blue-600 hover:underline">
                        legal@3gis.us
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <a href="mailto:privacy@3gis.us" className="text-blue-600 hover:underline">
                        privacy@3gis.us
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Telegram */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-start">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg mr-4">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    Telegram Mini App
                  </h3>
                  <p className="text-blue-100 mb-4">
                    Используйте 3GIS прямо в Telegram для быстрого поиска заведений
                  </p>
                  <a
                    href="https://t.me/ThreeGIS_bot/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium rounded-lg transition-colors"
                  >
                    Открыть в Telegram
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Отправить сообщение
            </h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ваше имя"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ваша фамилия"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Тема обращения *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Выберите тему</option>
                  <option value="support">Техническая поддержка</option>
                  <option value="business">Бизнес вопросы</option>
                  <option value="partnership">Партнерство</option>
                  <option value="legal">Правовые вопросы</option>
                  <option value="feedback">Отзыв или предложение</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Сообщение *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  placeholder="Опишите ваш вопрос подробно..."
                ></textarea>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  required
                  className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="privacy" className="text-sm text-gray-600">
                  Я согласен с{' '}
                  <a href="/legal/privacy" className="text-blue-600 hover:underline">
                    политикой конфиденциальности
                  </a>{' '}
                  и{' '}
                  <a href="/legal/terms" className="text-blue-600 hover:underline">
                    условиями использования
                  </a>
                  *
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Отправить сообщение
              </button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Время ответа:</strong> Мы стремимся отвечать на все обращения в течение 24 часов в рабочие дни. 
                По сложным техническим вопросам может потребоваться до 48 часов.
              </p>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Информация о компании
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Юридическое название</h3>
              <p className="text-gray-600">[Будет указано после регистрации LLC]</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Юридический адрес</h3>
              <p className="text-gray-600">[Будет указан после регистрации LLC]</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">EIN</h3>
              <p className="text-gray-600">[Будет указан после получения от IRS]</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Штат регистрации</h3>
              <p className="text-gray-600">[Delaware или Wyoming]</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Веб-сайт</h3>
              <p className="text-gray-600">
                <a href="https://3gis.us" className="text-blue-600 hover:underline">
                  3gis.us
                </a>
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Telegram Bot</h3>
              <p className="text-gray-600">
                <a href="https://t.me/ThreeGIS_bot" className="text-blue-600 hover:underline">
                  @ThreeGIS_bot
                </a>
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Примечание:</strong> 3GIS находится в стадии развития. 
              Полная корпоративная информация будет добавлена после официальной 
              регистрации компании в США.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}