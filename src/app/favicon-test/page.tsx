'use client';

import Image from 'next/image';

/**
 * Тестовая страница для проверки всех favicon и иконок
 */
export default function FaviconTestPage() {
  const iconSizes = [
    { path: '/icons/favicon-16x16.png', size: '16x16', name: 'Favicon 16px' },
    { path: '/icons/favicon-32x32.png', size: '32x32', name: 'Favicon 32px' },
    { path: '/icons/icon-192.png', size: '192x192', name: 'Icon 192px' },
    { path: '/icons/icon-512.png', size: '512x512', name: 'Icon 512px' },
    { path: '/icons/apple-touch-icon.png', size: '180x180', name: 'Apple Touch Icon' },
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        3GIS - Тестирование иконок и favicon
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {iconSizes.map((icon) => (
          <div key={icon.path} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">{icon.name}</h3>
            <div className="flex items-center space-x-4">
              <Image
                src={icon.path}
                alt={icon.name}
                width={64}
                height={64}
                className="border rounded"
              />
              <div>
                <p className="text-sm text-gray-600">Размер: {icon.size}</p>
                <p className="text-sm text-gray-600">Путь: {icon.path}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Проверка конфигурации</h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 bg-green-500 rounded-full"></span>
            <span>favicon.ico в корне сайта</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 bg-green-500 rounded-full"></span>
            <span>PNG иконки в /icons/</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 bg-green-500 rounded-full"></span>
            <span>Apple Touch Icon для iOS</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="w-4 h-4 bg-green-500 rounded-full"></span>
            <span>Manifest.json для PWA</span>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <a 
          href="/tg" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          Перейти к Telegram App
        </a>
      </div>
    </div>
  );
}
