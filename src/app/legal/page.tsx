// src/app/legal/page.tsx
import Link from 'next/link';
import { FileText, Shield, Cookie, Phone, Building, AlertTriangle, Users, RefreshCw, UserX, Lock, Database } from 'lucide-react';

export const metadata = {
  title: 'Правовая информация | 3GIS',
  description: 'Центр правовых документов 3GIS - политики, условия использования и корпоративная информация',
};

export default function LegalPage() {
  const documents = [
    {
      title: 'Политика конфиденциальности',
      description: 'Как мы собираем, используем и защищаем ваши персональные данные. Соответствие GDPR и CCPA.',
      href: '/legal/privacy',
      icon: Shield,
      color: 'bg-blue-100 text-blue-600',
      updated: 'Обновлено сегодня'
    },
    {
      title: 'Условия использования',
      description: 'Правила и условия использования сервиса 3GIS. Права и обязанности пользователей.',
      href: '/legal/terms',
      icon: FileText,
      color: 'bg-green-100 text-green-600',
      updated: 'Обновлено сегодня'
    },
    {
      title: 'Отказ от ответственности',
      description: 'Важная информация об ограничениях ответственности и использовании информации.',
      href: '/legal/disclaimer',
      icon: AlertTriangle,
      color: 'bg-yellow-100 text-yellow-600',
      updated: 'Обновлено сегодня'
    },
    {
      title: 'Политика Cookies',
      description: 'Информация об использовании файлов cookie на нашем сайте и управление настройками.',
      href: '/legal/cookies',
      icon: Cookie,
      color: 'bg-purple-100 text-purple-600',
      updated: 'Обновлено сегодня'
    },
    {
      title: 'Информация о компании',
      description: 'Корпоративные данные, регистрационная информация и планы развития.',
      href: '/legal/business-info',
      icon: Building,
      color: 'bg-gray-100 text-gray-600',
      updated: 'Обновлено сегодня'
    },
    {
      title: 'Контактная информация',
      description: 'Способы связи с нами для технической поддержки, бизнес-вопросов и правовых запросов.',
      href: '/legal/contact',
      icon: Phone,
      color: 'bg-indigo-100 text-indigo-600',
      updated: 'Обновлено сегодня'
    },
    {
      title: 'Заявление о доступности',
      description: 'Наша приверженность обеспечению равного доступа к сайту для людей с ограниченными возможностями.',
      href: '/legal/accessibility',
      icon: Users,
      color: 'bg-emerald-100 text-emerald-600',
      updated: 'Обновлено сегодня'
    },
    {
      title: 'DMCA Policy',
      description: 'Политика реагирования на уведомления об авторских правах согласно DMCA.',
      href: '/legal/dmca',
      icon: FileText,
      color: 'bg-orange-100 text-orange-600',
      updated: 'Обновлено сегодня'
    },
    {
      title: 'Return & Refund Policy',
      description: 'Политика возврата средств для премиум подписок через Telegram Stars и других платных услуг.',
      href: '/legal/refund-policy',
      icon: RefreshCw,
      color: 'bg-teal-100 text-teal-600',
      updated: 'Обновлено сегодня'
    },
    {
      title: 'Do Not Sell My Personal Information',
      description: 'Отказ от продажи персональных данных согласно CCPA/CPRA. Управление правами конфиденциальности.',
      href: '/legal/do-not-sell',
      icon: UserX,
      color: 'bg-red-100 text-red-600',
      updated: 'Обновлено сегодня'
    },
    {
      title: 'Политика безопасности данных',
      description: 'Технические и организационные меры защиты персональных данных. Соответствие SOC 2.',
      href: '/legal/security',
      icon: Lock,
      color: 'bg-slate-100 text-slate-600',
      updated: 'Обновлено сегодня'
    },
    {
      title: 'Политика хранения данных',
      description: 'Сроки хранения персональных данных и процедуры удаления. CCPA/GDPR compliance.',
      href: '/legal/data-retention',
      icon: Database,
      color: 'bg-cyan-100 text-cyan-600',
      updated: 'Обновлено сегодня'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Правовая информация
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Центр правовых документов и корпоративной информации 3GIS. 
            Все документы соответствуют требованиям законодательства США.
          </p>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {documents.map((doc, index) => {
            const IconComponent = doc.icon;
            return (
              <Link key={index} href={doc.href}>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 h-full">
                  <div className="flex items-start">
                    <div className={`${doc.color} p-3 rounded-lg mr-4 flex-shrink-0`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {doc.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">
                        {doc.description}
                      </p>
                      <div className="text-xs text-blue-600 font-medium">
                        {doc.updated}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Compliance Section */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Соответствие требованиям
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🇺🇸</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">CCPA</h3>
              <p className="text-gray-600 text-sm">
                California Consumer Privacy Act
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🇪🇺</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">GDPR</h3>
              <p className="text-gray-600 text-sm">
                General Data Protection Regulation
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">SOC 2</h3>
              <p className="text-gray-600 text-sm">
                Безопасность данных
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚖️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">ADA</h3>
              <p className="text-gray-600 text-sm">
                Доступность сайта
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">
              Нужна помощь?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Правовые вопросы</h3>
                <p className="text-blue-100 text-sm mb-3">
                  GDPR/CCPA запросы, удаление данных
                </p>
                <a 
                  href="mailto:legal@3gis.us" 
                  className="text-white underline hover:text-blue-200"
                >
                  legal@3gis.us
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Техническая поддержка</h3>
                <p className="text-blue-100 text-sm mb-3">
                  Вопросы по использованию платформы
                </p>
                <a 
                  href="mailto:support@3gis.us" 
                  className="text-white underline hover:text-blue-200"
                >
                  support@3gis.us
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Бизнес-партнерство</h3>
                <p className="text-blue-100 text-sm mb-3">
                  Сотрудничество и премиум размещение
                </p>
                <a 
                  href="mailto:business@3gis.us" 
                  className="text-white underline hover:text-blue-200"
                >
                  business@3gis.us
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>
            Последнее обновление документов: {new Date().toLocaleDateString('ru-RU')}
          </p>
          <p className="mt-2">
            Мы регулярно обновляем наши правовые документы в соответствии с изменениями 
            в законодательстве и развитием сервиса.
          </p>
        </div>
      </div>
    </div>
  );
}