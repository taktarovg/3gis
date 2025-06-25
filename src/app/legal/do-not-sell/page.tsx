// src/app/legal/do-not-sell/page.tsx
'use client';

import { useState } from 'react';
import { Shield, CheckCircle, AlertCircle, Mail, Phone } from 'lucide-react';

export default function DoNotSellPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    requestType: 'opt-out-sale',
    additionalInfo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Здесь будет API вызов для обработки запроса
    try {
      const response = await fetch('/api/privacy/do-not-sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Запрос успешно отправлен
            </h1>
            <p className="text-gray-600 mb-6">
              Мы получили ваш запрос на отказ от продажи персональных данных. 
              Обработка займет до 15 рабочих дней. Вы получите подтверждение на указанный email.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Отправить еще один запрос
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <div className="flex items-center mb-6">
            <Shield className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Do Not Sell or Share My Personal Information
            </h1>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            {/* Information Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">
                🛡️ Ваши права согласно CCPA/CPRA
              </h2>
              <p className="text-blue-700 leading-relaxed mb-4">
                Как резидент Калифорнии, вы имеете право запросить прекращение продажи 
                или передачи ваших персональных данных третьим лицам согласно 
                Закону о конфиденциальности потребителей Калифорнии (CCPA) и 
                Закону о правах конфиденциальности Калифорнии (CPRA).
              </p>
              <ul className="list-disc list-inside text-blue-700 space-y-2 text-sm">
                <li><strong>Право на отказ:</strong> Запретить продажу ваших данных</li>
                <li><strong>Право на отказ от передачи:</strong> Запретить передачу данных для рекламы</li>
                <li><strong>Ограничение чувствительных данных:</strong> Контроль использования особых категорий данных</li>
                <li><strong>Отсутствие дискриминации:</strong> Мы не можем ухудшить качество услуг за отказ</li>
              </ul>
            </div>

            {/* What Data We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Какую информацию мы собираем и передаем
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    📊 Данные, которые мы собираем:
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Информация профиля Telegram</li>
                    <li>• Данные геолокации (с согласия)</li>
                    <li>• Отзывы и рейтинги заведений</li>
                    <li>• История поиска и предпочтения</li>
                    <li>• IP-адреса и данные устройства</li>
                    <li>• Информация о взаимодействии с сайтом</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    🔄 Кому мы можем передавать данные:
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Рекламным сетям для таргетинга</li>
                    <li>• Аналитическим сервисам (Google Analytics)</li>
                    <li>• Партнерам по интеграции карт</li>
                    <li>• Поставщикам облачных услуг</li>
                    <li>• Платежным системам (Telegram Stars)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Важно:</strong> Мы НЕ продаем персональные данные за деньги. 
                  Однако согласно CCPA, передача данных партнерам для таргетированной рекламы 
                  или аналитики также считается "продажей" или "передачей".
                </p>
              </div>
            </section>

            {/* Opt-Out Form */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Форма отказа от продажи/передачи данных
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      Имя *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Фамилия *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email адрес *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-2">
                    Тип запроса *
                  </label>
                  <select
                    id="requestType"
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="opt-out-sale">Отказ от продажи персональных данных</option>
                    <option value="opt-out-sharing">Отказ от передачи данных третьим лицам</option>
                    <option value="limit-sensitive">Ограничить использование чувствительных данных</option>
                    <option value="opt-out-all">Все вышеперечисленное</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                    Дополнительная информация (опционально)
                  </label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    rows={4}
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Укажите дополнительные детали вашего запроса..."
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Что произойдет после отправки:</h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Мы обработаем ваш запрос в течение 15 рабочих дней</li>
                    <li>• Отправим подтверждение на указанный email</li>
                    <li>• Прекратим продажу/передачу ваших данных согласно запросу</li>
                    <li>• Уведомим наших партнеров об отказе</li>
                    <li>• Ваш выбор будет действовать минимум 12 месяцев</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Отправить запрос на отказ
                </button>
              </form>
            </section>

            {/* Alternative Methods */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Альтернативные способы подачи запроса
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Mail className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Email</h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    Отправьте запрос на наш email для вопросов конфиденциальности:
                  </p>
                  <a 
                    href="mailto:privacy@3gis.us?subject=Do Not Sell My Personal Information Request"
                    className="text-blue-600 underline text-sm"
                  >
                    privacy@3gis.us
                  </a>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Phone className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">Телефон</h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    Позвоните в нашу службу поддержки:
                  </p>
                  <a 
                    href="tel:+1-234-567-890"
                    className="text-blue-600 underline text-sm"
                  >
                    +1 (234) 567-890
                  </a>
                  <p className="text-gray-600 text-xs mt-1">
                    Пн-Пт, 9:00-17:00 PST
                  </p>
                </div>
              </div>
            </section>

            {/* Important Notes */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Важные замечания
              </h2>
              
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-2">
                        Проверка личности НЕ требуется
                      </h3>
                      <p className="text-amber-700 text-sm">
                        Согласно CCPA, мы НЕ можем требовать подтверждение личности 
                        для запросов отказа от продажи данных. Достаточно указать 
                        базовую информацию для идентификации ваших данных.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-800 mb-2">
                        Отсутствие дискриминации
                      </h3>
                      <p className="text-green-700 text-sm">
                        Мы не будем дискриминировать вас за использование права отказа. 
                        Качество наших услуг останется прежним, цены не изменятся.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-800 mb-2">
                        Длительность отказа
                      </h3>
                      <p className="text-blue-700 text-sm">
                        Ваш отказ будет действовать минимум 12 месяцев. После этого 
                        мы можем предложить вам снова разрешить использование данных, 
                        но это полностью добровольно.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Info */}
            <section className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Контакты по вопросам конфиденциальности
              </h3>
              <div className="text-gray-700 space-y-2 text-sm">
                <p>
                  <strong>Email:</strong> 
                  <a href="mailto:privacy@3gis.us" className="text-blue-600 underline ml-1">
                    privacy@3gis.us
                  </a>
                </p>
                <p>
                  <strong>Телефон:</strong> 
                  <a href="tel:+1-234-567-890" className="text-blue-600 underline ml-1">
                    +1 (234) 567-890
                  </a>
                </p>
                <p>
                  <strong>Почтовый адрес:</strong> 
                  3GIS Privacy Office, [Address to be updated after LLC registration]
                </p>
                <p>
                  <strong>Время ответа:</strong> До 15 рабочих дней
                </p>
              </div>
            </section>

            {/* Last Updated */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
              <p>
                Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
              </p>
              <p className="mt-1">
                Данная страница соответствует требованиям CCPA и CPRA (California Privacy Rights Act)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}