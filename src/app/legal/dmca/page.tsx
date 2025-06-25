// src/app/legal/dmca/page.tsx
import { AlertTriangle, Mail, FileText, Clock, Shield } from 'lucide-react';

export const metadata = {
  title: 'DMCA Policy | 3GIS',
  description: 'Digital Millennium Copyright Act Policy - процедура уведомлений об авторских правах',
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            DMCA Policy
          </h1>
          <p className="text-gray-600 mb-8">
            Digital Millennium Copyright Act - Политика авторских прав
          </p>

          <div className="prose prose-lg max-w-none">
            {/* Overview */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    ⚖️ Важная информация
                  </h3>
                  <p className="text-yellow-700 leading-relaxed">
                    3GIS уважает права интеллектуальной собственности и соблюдает положения 
                    Digital Millennium Copyright Act (DMCA). Мы оперативно реагируем на 
                    уведомления о нарушении авторских прав.
                  </p>
                </div>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Наша политика
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                3GIS имеет политику прекращения учетных записей пользователей, которые 
                являются нарушителями авторских прав в соответствующих обстоятельствах. 
                Мы также можем по своему усмотрению ограничивать доступ к сайту любому 
                пользователю, который нарушает права интеллектуальной собственности других лиц.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Процедура уведомления о нарушении
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Если вы считаете, что ваши авторские права нарушены материалом на нашем сайте, 
                отправьте письменное уведомление нашему назначенному агенту DMCA со следующей информацией:
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Требуемая информация в уведомлении:</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-3">
                  <li>
                    <strong>Физическая или электронная подпись</strong> лица, уполномоченного 
                    действовать от имени владельца авторских прав
                  </li>
                  <li>
                    <strong>Описание защищенного авторским правом произведения</strong>, 
                    которое, по вашему мнению, было нарушено
                  </li>
                  <li>
                    <strong>Описание того, где на сайте находится материал</strong>, 
                    который вы считаете нарушающим (включая URL-адрес)
                  </li>
                  <li>
                    <strong>Ваша контактная информация</strong>, включая адрес, номер телефона и email
                  </li>
                  <li>
                    <strong>Заявление о добросовестности</strong>, что использование материала 
                    не разрешено владельцем авторских прав
                  </li>
                  <li>
                    <strong>Заявление под страхом наказания за лжесвидетельство</strong>, 
                    что информация в уведомлении является точной
                  </li>
                </ol>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Контактная информация DMCA агента
              </h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start">
                  <Mail className="w-6 h-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-3">Назначенный агент DMCA:</h3>
                    <div className="text-blue-700 space-y-2">
                      <p><strong>Email:</strong> dmca@3gis.us</p>
                      <p><strong>Субъект письма:</strong> DMCA Takedown Notice</p>
                      <p><strong>Почтовый адрес:</strong> [Будет указан после регистрации LLC]</p>
                      <p><strong>Телефон:</strong> +1 (234) 567-890</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Процедура встречного уведомления
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Если вы считаете, что ваш материал был удален ошибочно в результате 
                неправильной идентификации, вы можете отправить встречное уведомление 
                нашему агенту DMCA со следующей информацией:
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Требуемая информация во встречном уведомлении:</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-3">
                  <li>Ваша физическая или электронная подпись</li>
                  <li>Описание материала, который был удален, и места, где он появлялся</li>
                  <li>Заявление под страхом наказания за лжесвидетельство о добросовестности</li>
                  <li>Ваше имя, адрес и номер телефона</li>
                  <li>Заявление о согласии на юрисдикцию федерального суда</li>
                </ol>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Время реагирования
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-800">Уведомления о нарушении</h3>
                  </div>
                  <p className="text-green-700 text-sm">
                    Обрабатываются в течение 24-48 часов после получения полного уведомления
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-blue-800">Встречные уведомления</h3>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Материал может быть восстановлен через 10-14 рабочих дней
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Последствия нарушений
              </h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start">
                  <Shield className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-3">Нарушители авторских прав:</h3>
                    <ul className="text-red-700 space-y-2 text-sm">
                      <li>• <strong>Первое нарушение:</strong> Предупреждение и удаление контента</li>
                      <li>• <strong>Второе нарушение:</strong> Временная блокировка аккаунта (7 дней)</li>
                      <li>• <strong>Третье нарушение:</strong> Постоянная блокировка аккаунта</li>
                      <li>• <strong>Серьезные нарушения:</strong> Немедленная блокировка</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                📧 Контакты
              </h3>
              <p className="text-blue-700 text-sm leading-relaxed mb-3">
                Все уведомления DMCA должны быть отправлены исключительно на адрес: 
                <strong>dmca@3gis.us</strong>
              </p>
              <p className="text-blue-700 text-sm">
                Для других правовых вопросов используйте: legal@3gis.us
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}