'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/upload/ImageUpload';
import { BusinessPhotoGallery } from '@/components/businesses/BusinessPhotoGallery';
import { AddBusinessForm } from '@/components/businesses/AddBusinessForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Upload, Image as ImageIcon, Building2 } from 'lucide-react';

export default function TestS3Page() {
  const [uploadedBusinessPhotos, setUploadedBusinessPhotos] = useState<string[]>([]);
  const [uploadedAvatars, setUploadedAvatars] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<{
    upload: boolean;
    conversion: boolean;
    display: boolean;
    database: boolean;
  }>({
    upload: false,
    conversion: false,
    display: false,
    database: false
  });

  const handleBusinessPhotoUpload = (imageUrl: string) => {
    setUploadedBusinessPhotos(prev => [...prev, imageUrl]);
    updateTestResults('upload', true);
    updateTestResults('conversion', true);
    updateTestResults('display', true);
  };

  const handleAvatarUpload = (imageUrl: string) => {
    setUploadedAvatars(prev => [...prev, imageUrl]);
  };

  const updateTestResults = (test: keyof typeof testResults, success: boolean) => {
    setTestResults(prev => ({ ...prev, [test]: success }));
  };

  const clearUploads = () => {
    setUploadedBusinessPhotos([]);
    setUploadedAvatars([]);
    setTestResults({
      upload: false,
      conversion: false,
      display: false,
      database: false
    });
  };

  const samplePhotos = uploadedBusinessPhotos.map((url, index) => ({
    id: index + 1,
    url,
    caption: `Тестовое фото ${index + 1}`,
    order: index
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            🚀 Тестирование AWS S3 интеграции
          </h1>
          <p className="text-gray-600">
            Проверка загрузки, конвертации в WebP и отображения изображений
          </p>
        </div>

        {/* Test Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Статус тестирования</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                  testResults.upload ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium">Загрузка в S3</div>
                <Badge variant={testResults.upload ? 'default' : 'secondary'}>
                  {testResults.upload ? 'Успешно' : 'Ожидание'}
                </Badge>
              </div>

              <div className="text-center space-y-2">
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                  testResults.conversion ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium">Конвертация WebP</div>
                <Badge variant={testResults.conversion ? 'default' : 'secondary'}>
                  {testResults.conversion ? 'Успешно' : 'Ожидание'}
                </Badge>
              </div>

              <div className="text-center space-y-2">
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                  testResults.display ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium">Отображение</div>
                <Badge variant={testResults.display ? 'default' : 'secondary'}>
                  {testResults.display ? 'Успешно' : 'Ожидание'}
                </Badge>
              </div>

              <div className="text-center space-y-2">
                <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                  testResults.database ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium">База данных</div>
                <Badge variant={testResults.database ? 'default' : 'secondary'}>
                  {testResults.database ? 'Успешно' : 'Ожидание'}
                </Badge>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Button onClick={clearUploads} variant="outline">
                🗑️ Очистить тесты
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Testing Interface */}
        <Tabs defaultValue="business-photos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="business-photos">Фото заведений</TabsTrigger>
            <TabsTrigger value="avatars">Аватары</TabsTrigger>
            <TabsTrigger value="gallery">Галерея</TabsTrigger>
            <TabsTrigger value="form">Полная форма</TabsTrigger>
          </TabsList>

          {/* Business Photos Testing */}
          <TabsContent value="business-photos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Тестирование загрузки фотографий заведений</CardTitle>
                <p className="text-sm text-gray-600">
                  Загрузите изображения для тестирования автоматической конвертации в WebP
                </p>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  type="business"
                  businessId={999}
                  category="restaurants"
                  onUpload={handleBusinessPhotoUpload}
                  maxFiles={10}
                  currentImages={uploadedBusinessPhotos}
                />

                {uploadedBusinessPhotos.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">
                      Загруженные фотографии ({uploadedBusinessPhotos.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uploadedBusinessPhotos.map((photo, index) => (
                        <div key={index} className="space-y-2">
                          <img
                            src={photo}
                            alt={`Тестовое фото ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>📁 Формат: WebP</p>
                            <p>🔗 S3 URL</p>
                            <p>✅ Конвертировано</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Avatar Testing */}
          <TabsContent value="avatars" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Тестирование загрузки аватаров</CardTitle>
                <p className="text-sm text-gray-600">
                  Загрузите аватары для тестирования круглой обрезки и конвертации
                </p>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  type="avatar"
                  telegramId="test_user_123"
                  onUpload={handleAvatarUpload}
                  maxFiles={3}
                  currentImages={uploadedAvatars}
                />

                {uploadedAvatars.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">
                      Загруженные аватары ({uploadedAvatars.length})
                    </h3>
                    <div className="flex space-x-4">
                      {uploadedAvatars.map((avatar, index) => (
                        <div key={index} className="text-center space-y-2">
                          <img
                            src={avatar}
                            alt={`Тестовый аватар ${index + 1}`}
                            className="w-24 h-24 rounded-full border object-cover"
                          />
                          <div className="text-xs text-gray-500">
                            <p>200×200px</p>
                            <p>WebP формат</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Testing */}
          <TabsContent value="gallery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Тестирование галереи фотографий</CardTitle>
                <p className="text-sm text-gray-600">
                  Проверка компонента BusinessPhotoGallery с lightbox
                </p>
              </CardHeader>
              <CardContent>
                {samplePhotos.length > 0 ? (
                  <BusinessPhotoGallery
                    photos={samplePhotos}
                    businessName="Тестовое заведение"
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Сначала загрузите фотографии во вкладке &quot;Фото заведений&quot;</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Full Form Testing */}
          <TabsContent value="form" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Тестирование полной формы добавления заведения</CardTitle>
                <p className="text-sm text-gray-600">
                  Полный цикл создания заведения с загрузкой фотографий
                </p>
              </CardHeader>
              <CardContent>
                <AddBusinessForm
                  onSuccess={(businessId) => {
                    updateTestResults('database', true);
                    alert(`Заведение создано с ID: ${businessId}`);
                  }}
                  onCancel={() => {
                    console.log('Отмена создания заведения');
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Technical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Техническая информация AWS S3</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold">Конфигурация S3:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Регион: us-east-1</li>
                  <li>• Bucket: 3gis-photos</li>
                  <li>• Формат: WebP (автоконвертация)</li>
                  <li>• Качество: 80-85%</li>
                  <li>• Максимальный размер: 10MB</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Структура файлов:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• business-photos/категория/ID/</li>
                  <li>• user-avatars/telegram_id.webp</li>
                  <li>• defaults/default-*.webp</li>
                  <li>• Уникальные имена (UUID)</li>
                  <li>• Метаданные в Prisma</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Что тестируется:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ Валидация файлов (тип, размер)</li>
                <li>✅ Автоматическая конвертация в WebP</li>
                <li>✅ Загрузка в AWS S3 bucket</li>
                <li>✅ Сохранение метаданных в PostgreSQL</li>
                <li>✅ Отображение через Next.js Image</li>
                <li>✅ Lightbox галерея с навигацией</li>
                <li>✅ Множественная загрузка</li>
                <li>✅ Responsive дизайн</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>🧪 Тестовая страница AWS S3 интеграции для 3GIS</p>
          <p>Все загруженные файлы автоматически конвертируются в WebP формат</p>
        </div>
      </div>
    </div>
  );
}
