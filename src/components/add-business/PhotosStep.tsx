import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';
import type { BusinessFormData } from '@/app/tg/add-business/page';

interface PhotosStepProps {
  formData: BusinessFormData;
  setFormData: (data: BusinessFormData) => void;
  isOwnerType: boolean;
}

export function PhotosStep({ formData, setFormData, isOwnerType }: PhotosStepProps) {
  return (
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
  );
}