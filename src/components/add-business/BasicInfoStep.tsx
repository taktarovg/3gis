import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Crown } from 'lucide-react';

interface BasicInfoStepProps {
  formData: any;
  setFormData: (data: any) => void;
  isOwnerType: boolean;
}

export function BasicInfoStep({ formData, setFormData, isOwnerType }: BasicInfoStepProps) {
  return (
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
  );
}