'use client'

/**
 * Тест исправления TypeScript ошибки в FavoritesList
 * Этот файл должен компилироваться без ошибок
 */

import { FavoritesList } from '@/components/favorites/FavoritesList'
import { FavoriteItem } from '@/hooks/use-favorites'

export default function FavoritesTypeTest() {
  // Тестовые данные с правильными типами
  const testFavorite: FavoriteItem = {
    id: 1,
    addedAt: new Date().toISOString(),
    business: {
      id: 1,
      name: 'Тестовое заведение',
      nameEn: 'Test Business',
      description: 'Описание заведения',
      address: '123 Test Street',
      phone: '+1234567890',
      website: 'https://test.com',
      rating: 4.5,
      reviewCount: 10,
      latitude: 40.7128,
      longitude: -74.0060,
      languages: ['ru', 'en'],
      hasParking: true,
      premiumTier: 'STANDARD',
      isFavorite: true,
      favoriteCount: 5,
      distance: 1.5,
      category: {
        id: 1,
        name: 'Рестораны',
        nameEn: 'Restaurants',
        slug: 'restaurants',
        icon: '🍽️'
      },
      city: {
        id: 1,
        name: 'Нью-Йорк',
        state: 'NY'
      },
      photos: [{
        id: 1,
        url: 'https://example.com/photo.jpg',
        caption: 'Фото заведения'
      }],
      _count: {
        reviews: 10,
        favorites: 5
      }
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">✅ FavoritesList TypeScript исправлен</h1>
      <p className="mb-4">Этот компонент теперь компилируется без ошибок</p>
      
      <div className="bg-green-100 p-4 rounded-lg mb-4">
        <h2 className="font-semibold mb-2">✅ Исправленные поля в Business:</h2>
        <ul className="space-y-1 text-sm">
          <li>• languages: {JSON.stringify(testFavorite.business.languages)}</li>
          <li>• hasParking: {testFavorite.business.hasParking.toString()}</li>
          <li>• premiumTier: {testFavorite.business.premiumTier}</li>
          <li>• latitude: {testFavorite.business.latitude}</li>
          <li>• longitude: {testFavorite.business.longitude}</li>
        </ul>
      </div>
      
      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold mb-4">Пример работы FavoritesList:</h2>
        <FavoritesList 
          showActions={true}
          limit={1}
        />
      </div>
    </div>
  )
}
