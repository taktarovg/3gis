/**
 * Тестовая страница для загрузки изображений
 * Можно удалить после тестирования
 */

'use client';

import { useState } from 'react';
import { ImageUpload } from '@/components/upload/ImageUpload';

export default function TestUploadPage() {
  const [businessImages, setBusinessImages] = useState<string[]>([]);
  const [avatarImages, setAvatarImages] = useState<string[]>([]);

  const handleBusinessImageUpload = (imageUrl: string) => {
    setBusinessImages(prev => [...prev, imageUrl]);
  };

  const handleAvatarUpload = (imageUrl: string) => {
    setAvatarImages([imageUrl]); // Только один аватар
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">🧪 Тестирование загрузки изображений AWS S3</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Тестирование загрузки фото заведения */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">🏢 Фото заведения</h2>
          <p className="text-gray-600">Тестируем загрузку фотографий для заведений</p>
          
          <ImageUpload
            type="business"
            businessId={1}
            category="restaurants"
            onUpload={handleBusinessImageUpload}
            currentImages={businessImages}
            maxFiles={5}
          />
          
          {businessImages.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Загруженные изображения:</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {businessImages.map((url, index) => (
                  <div key={index} className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded">
                    {url}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Тестирование загрузки аватара */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">👤 Аватар пользователя</h2>
          <p className="text-gray-600">Тестируем загрузку аватаров пользователей</p>
          
          <ImageUpload
            type="avatar"
            telegramId="test_user_123"
            onUpload={handleAvatarUpload}
            currentImages={avatarImages}
            maxFiles={1}
          />
          
          {avatarImages.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Загруженный аватар:</h3>
              <div className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded">
                {avatarImages[0]}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Информация о конфигурации */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">🔧 Конфигурация AWS S3:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Bucket:</span> {process.env.NEXT_PUBLIC_S3_BASE_URL}
          </div>
          <div>
            <span className="font-medium">Регион:</span> {process.env.AWS_REGION || 'us-east-2'}
          </div>
          <div>
            <span className="font-medium">Формат:</span> WebP (автоконвертация)
          </div>
          <div>
            <span className="font-medium">Качество:</span> 80% (аватары), 85% (заведения)
          </div>
        </div>
      </div>

      {/* Инструкции */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">📝 Инструкции:</h3>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>• Все изображения автоматически конвертируются в WebP формат</li>
          <li>• Аватары ресайзятся до 200x200px, фото заведений до 800x600px</li>
          <li>• Поддерживаются форматы: JPEG, PNG, WebP (до 10MB)</li>
          <li>• Изображения сохраняются в папки: user-avatars/, business-photos/</li>
        </ul>
      </div>
    </div>
  );
}
