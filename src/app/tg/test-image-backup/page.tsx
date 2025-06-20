'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function TestImagePage() {
  const [imageStatus, setImageStatus] = useState<string>('loading');
  const [directUrl] = useState('https://3gis-photos.s3.us-east-2.amazonaws.com/user-avatars/80954049.webp');

  const handleImageLoad = () => {
    setImageStatus('✅ Изображение загружено успешно');
  };

  const handleImageError = () => {
    setImageStatus('❌ Ошибка загрузки изображения');
  };

  const testDirectAccess = async () => {
    try {
      const response = await fetch(directUrl, { method: 'HEAD' });
      if (response.ok) {
        setImageStatus('✅ Прямой доступ работает');
      } else {
        setImageStatus(`❌ Прямой доступ: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setImageStatus(`❌ Ошибка fetch: ${error}`);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Тест изображения S3</h1>
      
      {/* Информация */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <p><strong>URL:</strong> {directUrl}</p>
        <p><strong>Статус:</strong> {imageStatus}</p>
      </div>

      {/* Кнопка тестирования */}
      <button 
        onClick={testDirectAccess}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Проверить прямой доступ
      </button>

      {/* Тест через img tag */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Тест через img tag (без Next.js Image)</h2>
        <Image 
          src={directUrl}
          alt="Test avatar"
          width={64}
          height={64}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="border rounded"
          unoptimized
        />
      </div>

      {/* Тест через Next.js Image с unoptimized */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Тест через Next.js Image (unoptimized)</h2>
        <Image 
          src={directUrl}
          alt="Test avatar optimized"
          width={64}
          height={64}
          className="border rounded"
          unoptimized
        />
      </div>

      {/* Fallback изображение */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Fallback изображение</h2>
        <Image 
          src="https://avatar.iran.liara.run/public/80954049"
          alt="Fallback avatar"
          width={64}
          height={64}
          className="border rounded"
          unoptimized
        />
      </div>
    </div>
  );
}
