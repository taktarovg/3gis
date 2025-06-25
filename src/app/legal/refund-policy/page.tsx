// src/app/legal/refund-policy/page.tsx
import { Star, RefreshCw, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export const metadata = {
  title: 'Refund Policy | 3GIS',
  description: 'Политика возврата средств для премиум подписок и других платных услуг 3GIS',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Return and Refund Policy
          </h1>
          <p className="text-gray-600 mb-8">
            Политика возврата средств для премиум подписок и платных услуг
          </p>

          <div className="prose prose-lg max-w-none">
            {/* Overview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <Star className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    💫 Обзор политики
                  </h3>
                  <p className="text-blue-700 leading-relaxed">
                    3GIS стремится обеспечить справедливую политику возврата средств для 
                    всех наших платных услуг, включая премиум подписки через Telegram Stars, 
                    рекламные размещения и другие дополнительные сервисы.
                  </p>
                </div>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Типы платных услуг
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Данная политика применяется к следующим типам платных услуг 3GIS:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    💳 Премиум подписки
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Базовый план ($49/месяц)</li>
                    <li>• Стандартный план ($149/месяц)</li>
                    <li>• Премиум план ($299/месяц)</li>
                    <li>• Оплата через Telegram Stars</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    📱 Дополнительные услуги
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Дополнительные фотографии</li>
                    <li>• Приоритетное размещение</li>
                    <li>• Рекламные блоки</li>
                    <li>• Расширенная аналитика</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Политика возврата для подписок
              </h2>
              
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-800 mb-3">
                        ✅ Когда возврат возможен
                      </h3>
                      <ul className="text-green-700 space-y-2 text-sm">
                        <li>• <strong>Технические проблемы:</strong> Если наш сервис недоступен более 24 часов</li>
                        <li>• <strong>Двойное списание:</strong> Случайное повторное списание средств</li>
                        <li>• <strong>Неавторизованный платеж:</strong> Платеж, совершенный без вашего согласия</li>
                        <li>• <strong>Недоставка услуги:</strong> Премиум функции не активировались в течение 48 часов</li>
                        <li>• <strong>Первые 7 дней:</strong> Полный возврат при отмене в течение недели</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <XCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-red-800 mb-3">
                        ❌ Когда возврат НЕ предоставляется
                      </h3>
                      <ul className="text-red-700 space-y-2 text-sm">
                        <li>• <strong>Частичное использование:</strong> После использования премиум функций более 7 дней</li>
                        <li>• <strong>Изменение планов:</strong> Простое желание перейти на другой тариф</li>
                        <li>• <strong>Нарушения условий:</strong> При блокировке аккаунта за нарушения</li>
                        <li>• <strong>Неудовлетворенность результатами:</strong> Недостаточно звонков или просмотров</li>
                        <li>• <strong>Автоматическое продление:</strong> Если не отменили подписку заранее</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Временные рамки для возврата
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-blue-800 mb-2">7 дней</h3>
                  <p className="text-blue-700 text-sm">
                    Полный возврат без объяснения причин
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <RefreshCw className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-yellow-800 mb-2">30 дней</h3>
                  <p className="text-yellow-700 text-sm">
                    Частичный возврат при технических проблемах
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">После 30 дней</h3>
                  <p className="text-gray-700 text-sm">
                    Возврат только в исключительных случаях
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Как запросить возврат
              </h2>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Пошаговый процесс:</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-3">
                  <li>
                    <strong>Отправьте запрос:</strong> Напишите на 
                    <a href="mailto:refunds@3gis.us" className="text-blue-600 underline ml-1">
                      refunds@3gis.us
                    </a>
                  </li>
                  <li>
                    <strong>Укажите информацию:</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm">
                      <li>Telegram username или ID</li>
                      <li>Дата и сумма платежа</li>
                      <li>ID транзакции Telegram Stars</li>
                      <li>Причина запроса возврата</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Подтверждение личности:</strong> Мы можем запросить дополнительную верификацию
                  </li>
                  <li>
                    <strong>Рассмотрение:</strong> Ответ в течение 2-3 рабочих дней
                  </li>
                  <li>
                    <strong>Возврат средств:</strong> Обработка в течение 5-7 рабочих дней
                  </li>
                </ol>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Способы возврата средств
              </h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    ⭐ Telegram Stars
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Возврат в виде Telegram Stars на тот же аккаунт, с которого была произведена оплата. 
                    Обычно обрабатывается в течение 24-48 часов.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    💳 Кредит на аккаунт
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Зачисление средств на ваш аккаунт 3GIS для использования в будущих платежах. 
                    Доступен мгновенно после одобрения.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    🏦 Банковский возврат
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    В исключительных случаях возможен возврат на банковскую карту через 
                    оригинальную платежную систему. Может занять до 14 рабочих дней.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Особые случаи
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    🔒 Заблокированные аккаунты
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-2">
                    При блокировке аккаунта за нарушение условий использования возврат не предоставляется. 
                    Исключения составляют случаи ошибочной блокировки.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    🤝 Споры и медиация
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-2">
                    Если вы не согласны с решением о возврате, вы можете запросить пересмотр 
                    через службу поддержки или воспользоваться медиацией третьей стороны.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    📱 Проблемы с Telegram
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-2">
                    Если проблема связана с платежной системой Telegram, мы поможем вам 
                    связаться с их службой поддержки и предоставим необходимые документы.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Отмена подписки
              </h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-800 mb-3">
                  🔄 Как отменить автоматическое продление
                </h3>
                <p className="text-yellow-700 text-sm leading-relaxed mb-3">
                  Вы можете отменить автоматическое продление подписки в любое время:
                </p>
                <ol className="list-decimal list-inside text-yellow-700 text-sm space-y-2">
                  <li>Войдите в свой профиль в 3GIS</li>
                  <li>Перейдите в раздел "Подписки и платежи"</li>
                  <li>Нажмите "Отменить подписку"</li>
                  <li>Подтвердите отмену</li>
                </ol>
                <p className="text-yellow-700 text-sm leading-relaxed mt-3">
                  <strong>Важно:</strong> Отмена должна быть произведена минимум за 24 часа 
                  до даты следующего автоматического списания.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Контактная информация
              </h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-800 mb-3">Служба возвратов:</h3>
                <div className="text-blue-700 space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> 
                    <a href="mailto:refunds@3gis.us" className="underline ml-1">
                      refunds@3gis.us
                    </a>
                  </p>
                  <p>
                    <strong>Резервный контакт:</strong> 
                    <a href="mailto:support@3gis.us" className="underline ml-1">
                      support@3gis.us
                    </a>
                  </p>
                  <p>
                    <strong>Telegram поддержка:</strong> 
                    <a href="https://t.me/ThreeGIS_support" className="underline ml-1">
                      @ThreeGIS_support
                    </a>
                  </p>
                  <p>
                    <strong>Время ответа:</strong> 2-3 рабочих дня
                  </p>
                  <p>
                    <strong>Обработка возврата:</strong> 5-7 рабочих дней
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Изменения в политике
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Мы оставляем за собой право изменять данную политику возврата. 
                Существенные изменения будут уведомлены пользователям за 30 дней 
                до вступления в силу через:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Уведомления в Telegram Mini App</li>
                <li>Email рассылку (если предоставлен)</li>
                <li>Объявления на главной странице сайта</li>
              </ul>
            </section>

            {/* Last Updated */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                📅 Информация о документе
              </h3>
              <div className="text-gray-700 text-sm space-y-1">
                <p><strong>Последнее обновление:</strong> {new Date().toLocaleDateString('ru-RU')}</p>
                <p><strong>Версия:</strong> 1.0</p>
                <p><strong>Действует с:</strong> {new Date().toLocaleDateString('ru-RU')}</p>
                <p><strong>Применимо к:</strong> Всем платным услугам 3GIS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}