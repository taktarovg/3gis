'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  Crown, 
  Award,
  MapPin,
  Phone,
  Globe,
  Camera,
  Clock,
  Star,
  CheckCircle,
  Upload,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

function AddBusinessContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'community'; // 'owner' | 'community'
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    website: '',
    languages: ['ru'],
    hours: {},
    photos: []
  });

  const isOwnerType = type === 'owner';

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // TODO: Отправка данных на сервер
    console.log('Submitting:', { type, formData });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link href="/tg/my-business">
          <Button variant="ghost" size="sm" className="mr-3">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        
        <div>
          <div className="flex items-center gap-3 mb-2">
            {isOwnerType ? (
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Добавить мой бизнес</h1>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-900">Добавить в каталог</h1>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 text-sm">
            {isOwnerType 
              ? 'Зарегистрируйте свое заведение и получите доступ к премиум функциям'
              : 'Помогите сообществу - добавьте место, которое вы знаете'
            }
          </p>
        </div>
      </div>

      {/* Benefits Card */}
      <Card className={`mb-6 ${isOwnerType ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}`}>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3 flex items-center">
            {isOwnerType ? (
              <>
                <Crown className="w-5 h-5 mr-2 text-blue-600" />
                Преимущества владельца
              </>
            ) : (
              <>
                <Award className="w-5 h-5 mr-2 text-green-600" />
                За вашу помощь
              </>
            )}
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            {isOwnerType ? (
              <>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-2 text-blue-500" />
                  <span>Верификация заведения с зеленой галочкой</span>
                </div>
                <div className="flex items-center text-sm">
                  <Building className="w-4 h-4 mr-2 text-blue-500" />
                  <span>Приоритет в результатах поиска</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  <span>Ответы на отзывы клиентов</span>
                </div>
                <div className="flex items-center text-sm">
                  <Crown className="w-4 h-4 mr-2 text-blue-500" />
                  <span>Аналитика просмотров и звонков</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center text-sm">
                  <Award className="w-4 h-4 mr-2 text-green-500" />
                  <span>+5 баллов за каждое добавленное место</span>
                </div>
                <div className="flex items-center text-sm">
                  <Camera className="w-4 h-4 mr-2 text-green-500" />
                  <span>+2 балла за каждое загруженное фото</span>
                </div>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 mr-2 text-green-500" />
                  <span>Значки достижений в профиле</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2 text-green-500" />
                  <span>Позиция в лидерборде сообщества</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Шаг {step} из 4
          </span>
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i <= step ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Основная информация
            </CardTitle>
            <CardDescription>
              Расскажите о заведении
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название заведения *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Например: Ресторан Русский дом"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Выберите категорию</option>
                <option value="restaurants">🍽️ Рестораны и кафе</option>
                <option value="healthcare">⚕️ Медицина</option>
                <option value="legal">⚖️ Юридические услуги</option>
                <option value="beauty">💄 Красота и здоровье</option>
                <option value="auto">🔧 Автосервисы</option>
                <option value="finance">🏦 Финансовые услуги</option>
                <option value="education">🎓 Образование</option>
                <option value="realestate">🏠 Недвижимость</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Краткое описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Кратко опишите заведение, кухню, специализацию..."
              />
            </div>

            {/* Language selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Языки обслуживания
              </label>
              <div className="flex flex-wrap gap-2">
                {['ru', 'en', 'es', 'zh'].map((lang) => {
                  const labels = {ru: '🇷🇺 Русский', en: '🇺🇸 English', es: '🇪🇸 Español', zh: '🇨🇳 中文'};
                  const isSelected = formData.languages.includes(lang);
                  
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setFormData({
                            ...formData,
                            languages: formData.languages.filter(l => l !== lang)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            languages: [...formData.languages, lang]
                          });
                        }
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        isSelected 
                          ? 'bg-blue-100 border-blue-500 text-blue-700' 
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {labels[lang]}
                    </button>
                  );
                })}
              </div>
            </div>

            {isOwnerType && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <Crown className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Подтверждение владения</h4>
                    <p className="text-sm text-blue-700">
                      На следующем шаге мы попросим документы, подтверждающие, что вы являетесь владельцем или представителем заведения.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Address & Contacts */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Адрес и контакты
            </CardTitle>
            <CardDescription>
              Где находится заведение
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Полный адрес *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1273 Brighton Beach Ave, Brooklyn, NY 11235"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Город *
              </label>
              <select 
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Выберите город</option>
                <option value="new-york">Нью-Йорк</option>
                <option value="los-angeles">Лос-Анджелес</option>
                <option value="chicago">Чикаго</option>
                <option value="miami">Майами</option>
                <option value="san-francisco">Сан-Франциско</option>
                <option value="boston">Бостон</option>
                <option value="seattle">Сиэтл</option>
                <option value="philadelphia">Филадельфия</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(718) 555-0123"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Веб-сайт
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>

            {/* Additional features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Дополнительные удобства
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'parking', label: '🅿️ Парковка', icon: '🅿️' },
                  { key: 'wifi', label: '📶 Wi-Fi', icon: '📶' },
                  { key: 'delivery', label: '🚚 Доставка', icon: '🚚' },
                  { key: 'takeout', label: '🥡 На вынос', icon: '🥡' },
                  { key: 'cards', label: '💳 Карты', icon: '💳' },
                  { key: 'accessible', label: '♿ Доступность', icon: '♿' }
                ].map((feature) => (
                  <label key={feature.key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Photos & Hours */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Фотографии и часы работы
            </CardTitle>
            <CardDescription>
              Добавьте фото и укажите время работы
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Фотографии заведения
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Перетащите фотографии сюда или нажмите для выбора
                </p>
                <p className="text-xs text-gray-500">
                  {isOwnerType ? 'До 10 фотографий' : 'До 5 фотографий'} • PNG, JPG до 10MB
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  Выбрать файлы
                </Button>
              </div>
              
              {isOwnerType && (
                <p className="text-xs text-blue-600 mt-2">
                  💡 Качественные фото увеличивают количество клиентов на 40%
                </p>
              )}
            </div>

            {/* Business Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Часы работы
              </label>
              <div className="space-y-3">
                {[
                  'Понедельник', 'Вторник', 'Среда', 'Четверг', 
                  'Пятница', 'Суббота', 'Воскресенье'
                ].map((day, index) => (
                  <div key={day} className="flex items-center space-x-3">
                    <div className="w-24 text-sm font-medium text-gray-700">
                      {day}
                    </div>
                    <input
                      type="time"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="09:00"
                    />
                    <span className="text-gray-500">до</span>
                    <input
                      type="time"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="18:00"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Выходной</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Проверка и отправка
            </CardTitle>
            <CardDescription>
              Проверьте данные перед отправкой
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">{formData.name || 'Название не указано'}</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Категория:</span> {formData.category || 'Не выбрана'}</div>
                <div><span className="font-medium">Адрес:</span> {formData.address || 'Не указан'}</div>
                <div><span className="font-medium">Город:</span> {formData.city || 'Не выбран'}</div>
                {formData.phone && <div><span className="font-medium">Телефон:</span> {formData.phone}</div>}
                {formData.website && <div><span className="font-medium">Сайт:</span> {formData.website}</div>}
                <div><span className="font-medium">Языки:</span> {formData.languages.join(', ')}</div>
              </div>
            </div>

            {/* Owner verification for business owners */}
            {isOwnerType && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Подтверждение владения</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Для получения статуса владельца загрузите один из документов:
                </p>
                <ul className="text-xs text-blue-600 space-y-1 mb-4">
                  <li>• Бизнес-лицензия</li>
                  <li>• Документы о регистрации компании</li>
                  <li>• Налоговые документы</li>
                  <li>• Договор аренды на имя компании</li>
                </ul>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Загрузить документ
                </Button>
              </div>
            )}

            {/* Terms */}
            <div className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                />
                <div className="text-sm">
                  <span>Я согласен с </span>
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    условиями использования
                  </Link>
                  <span> и </span>
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    политикой конфиденциальности
                  </Link>
                  <div className="text-xs text-gray-500 mt-1">
                    {isOwnerType 
                      ? 'Заведение будет проверено модераторами в течение 24 часов'
                      : 'Информация будет проверена перед публикацией'
                    }
                  </div>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-6 pb-20">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={handlePrev}
            className="flex-1"
          >
            Назад
          </Button>
        )}
        
        {step < 4 ? (
          <Button
            onClick={handleNext}
            className="flex-1"
            disabled={
              (step === 1 && (!formData.name || !formData.category)) ||
              (step === 2 && (!formData.address || !formData.city))
            }
          >
            Далее
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isOwnerType ? (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Зарегистрировать бизнес
              </>
            ) : (
              <>
                <Award className="w-4 h-4 mr-2" />
                Добавить в каталог
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function AddBusinessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    }>
      <AddBusinessContent />
    </Suspense>
  );
}