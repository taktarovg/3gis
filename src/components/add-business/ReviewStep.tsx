import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Upload } from 'lucide-react';
import Link from 'next/link';
import type { BusinessFormData } from '@/app/tg/add-business/page';

interface ReviewStepProps {
  formData: BusinessFormData;
  isOwnerType: boolean;
}

export function ReviewStep({ formData, isOwnerType }: ReviewStepProps) {
  return (
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
  );
}