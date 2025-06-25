// src/app/legal/business-info/page.tsx
import { Building, MapPin, Phone, Mail, ExternalLink, FileText } from 'lucide-react';

export const metadata = {
  title: 'Информация о компании | 3GIS',
  description: 'Юридическая информация о компании 3GIS - регистрационные данные и корпоративные сведения',
};

export default function BusinessInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Информация о компании
          </h1>
          <p className="text-gray-600 mb-8">
            Корпоративные и регистрационные данные 3GIS
          </p>

          <div className="prose prose-lg max-w-none">
            {/* Current Status */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                📋 Текущий статус
              </h3>
              <p className="text-blue-700 leading-relaxed">
                3GIS находится в стадии активной разработки. Официальная регистрация 
                компании в США планируется после достижения стабильного дохода $5,000-10,000/месяц 
                для покрытия корпоративных расходов и визовых требований.
              </p>
            </div>

            {/* Planned Structure */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Планируемая корпоративная структура
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <Building className="w-5 h-5 text-gray-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Тип организации</h3>
                  </div>
                  <p className="text-gray-700">Limited Liability Company (LLC)</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <MapPin className="w-5 h-5 text-gray-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Штат регистрации</h3>
                  </div>
                  <p className="text-gray-700">Delaware или Wyoming</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <FileText className="w-5 h-5 text-gray-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Планируемое название</h3>
                  </div>
                  <p className="text-gray-700">3GIS LLC</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <ExternalLink className="w-5 h-5 text-gray-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Домен</h3>
                  </div>
                  <p className="text-gray-700">3gis.us</p>
                </div>
              </div>
            </section>

            {/* Current Contact Info */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Текущие контактные данные
              </h2>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Общие вопросы:</div>
                      <a href="mailto:support@3gis.us" className="text-blue-600 hover:underline">
                        support@3gis.us
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Бизнес вопросы:</div>
                      <a href="mailto:business@3gis.us" className="text-blue-600 hover:underline">
                        business@3gis.us
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-purple-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Правовые вопросы:</div>
                      <a href="mailto:legal@3gis.us" className="text-blue-600 hover:underline">
                        legal@3gis.us
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">Телефон:</div>
                      <a href="tel:+1234567890" className="text-blue-600 hover:underline">
                        +1 (234) 567-890
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <ExternalLink className="w-5 h-5 text-gray-600 mr-3 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">Telegram Bot:</div>
                      <a href="https://t.me/ThreeGIS_bot" className="text-blue-600 hover:underline">
                        @ThreeGIS_bot
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Timeline */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Timeline регистрации
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Q1 2025 - MVP Launch</h3>
                    <p className="text-gray-600">Запуск минимального продукта через Telegram Stars</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Q2-Q3 2025 - Накопление капитала</h3>
                    <p className="text-gray-600">Достижение $5,000-10,000/месяц через Telegram Stars</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Q4 2025 - Регистрация LLC</h3>
                    <p className="text-gray-600">Официальная регистрация компании в США</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">2026 - Переход на USD</h3>
                    <p className="text-gray-600">Интеграция Stripe, переход с Telegram Stars на долларовые платежи</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Compliance */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Соответствие требованиям
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">CCPA Compliance</h3>
                  <p className="text-gray-600 text-sm">
                    Соблюдение California Consumer Privacy Act для защиты данных пользователей из Калифорнии
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">GDPR Ready</h3>
                  <p className="text-gray-600 text-sm">
                    Готовность к работе с европейскими пользователями согласно GDPR
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Terms of Service</h3>
                  <p className="text-gray-600 text-sm">
                    Подробные условия использования для защиты интересов пользователей и компании
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Privacy Policy</h3>
                  <p className="text-gray-600 text-sm">
                    Прозрачная политика конфиденциальности с описанием обработки данных
                  </p>
                </div>
              </div>
            </section>

            {/* Future Plans */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                После регистрации LLC
              </h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 mb-3">
                  Будет добавлена следующая информация:
                </h3>
                <ul className="space-y-2 text-green-700">
                  <li>• Полное юридическое название компании</li>
                  <li>• EIN (Employer Identification Number)</li>
                  <li>• Официальный юридический адрес</li>
                  <li>• Registered Agent информация</li>
                  <li>• Certificate of Formation номер</li>
                  <li>• State of Delaware/Wyoming регистрационные данные</li>
                </ul>
              </div>
            </section>

            {/* Contact for Updates */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                📬 Уведомления об обновлениях
              </h3>
              <p className="text-blue-700 mb-3">
                Мы будем обновлять эту страницу по мере развития компании. 
                Все изменения в корпоративной структуре будут отражены здесь.
              </p>
              <p className="text-blue-700">
                По вопросам корпоративной информации: 
                <a href="mailto:legal@3gis.us" className="underline ml-1">legal@3gis.us</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}