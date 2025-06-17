'use client'

import { useState } from 'react'
import { FavoriteButton } from '@/components/favorites/FavoriteButton'
import { FavoritesList } from '@/components/favorites/FavoritesList'
import { useFavorites, useFavoriteStatus } from '@/hooks/use-favorites'
import { useToggleFavorite, useClearFavorites } from '@/hooks/use-toggle-favorite'
import { Heart, TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestFavoritesPage() {
  const [testBusinessId, setTestBusinessId] = useState(1)
  const { data: favorites, isLoading: favoritesLoading } = useFavorites()
  const { data: favoriteStatus } = useFavoriteStatus(testBusinessId)
  const toggleFavorite = useToggleFavorite()
  const clearFavorites = useClearFavorites()

  const testBusinesses = [
    { id: 1, name: 'Ресторан "Русский дом"' },
    { id: 2, name: 'Доктор Иванов' },
    { id: 3, name: 'Юрист Петров' },
    { id: 4, name: 'Салон "Красота"' },
    { id: 5, name: 'Автосервис "Мастер"' }
  ]

  const handleToggleTest = async () => {
    try {
      await toggleFavorite.mutateAsync(testBusinessId)
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  const handleClearAll = async () => {
    try {
      await clearFavorites.mutateAsync()
    } catch (error) {
      console.error('Clear error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <TestTube className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Тестирование функционала "Избранное"
            </h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              {favoritesLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <span>API подключения</span>
            </div>
            
            <div className="flex items-center gap-2">
              {favorites ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span>Загрузка избранного</span>
            </div>
            
            <div className="flex items-center gap-2">
              {favoriteStatus ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span>Статус избранного</span>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Управление тестами</h2>
          
          <div className="space-y-4">
            {/* Business Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Выберите тестовое заведение:
              </label>
              <select
                value={testBusinessId}
                onChange={(e) => setTestBusinessId(parseInt(e.target.value))}
                className="block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {testBusinesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name} (ID: {business.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Display */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                Статус заведения ID {testBusinessId}:
              </h3>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  favoriteStatus?.isFavorite 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {favoriteStatus?.isFavorite ? 'В избранном' : 'Не в избранном'}
                </span>
                
                {favoriteStatus?.addedAt && (
                  <span className="text-sm text-gray-600">
                    Добавлено: {new Date(favoriteStatus.addedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleToggleTest}
                disabled={toggleFavorite.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {toggleFavorite.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className="w-4 h-4" />
                )}
                {favoriteStatus?.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
              </button>

              <button
                onClick={handleClearAll}
                disabled={clearFavorites.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {clearFavorites.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Очистить все избранное
              </button>
            </div>
          </div>
        </div>

        {/* Favorite Button Tests */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Тест компонентов кнопок</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Small buttons */}
            <div>
              <h3 className="font-medium mb-3">Маленькие кнопки</h3>
              <div className="flex gap-2">
                <FavoriteButton 
                  businessId={testBusinessId} 
                  size="sm" 
                  variant="default"
                />
                <FavoriteButton 
                  businessId={testBusinessId} 
                  size="sm" 
                  variant="outline"
                />
                <FavoriteButton 
                  businessId={testBusinessId} 
                  size="sm" 
                  variant="ghost"
                />
              </div>
            </div>

            {/* Medium buttons */}
            <div>
              <h3 className="font-medium mb-3">Средние кнопки</h3>
              <div className="flex gap-2">
                <FavoriteButton 
                  businessId={testBusinessId} 
                  size="md" 
                  variant="default"
                />
                <FavoriteButton 
                  businessId={testBusinessId} 
                  size="md" 
                  variant="outline"
                />
                <FavoriteButton 
                  businessId={testBusinessId} 
                  size="md" 
                  variant="ghost"
                />
              </div>
            </div>

            {/* Large buttons */}
            <div>
              <h3 className="font-medium mb-3">Большие кнопки</h3>
              <div className="flex gap-2">
                <FavoriteButton 
                  businessId={testBusinessId} 
                  size="lg" 
                  variant="default"
                />
                <FavoriteButton 
                  businessId={testBusinessId} 
                  size="lg" 
                  variant="outline"
                />
                <FavoriteButton 
                  businessId={testBusinessId} 
                  size="lg" 
                  variant="ghost"
                />
              </div>
            </div>

            {/* With labels */}
            <div className="md:col-span-2 lg:col-span-3">
              <h3 className="font-medium mb-3">С подписями</h3>
              <div className="flex flex-wrap gap-3">
                <FavoriteButton 
                  businessId={testBusinessId} 
                  showLabel={true}
                  variant="default"
                />
                <FavoriteButton 
                  businessId={testBusinessId} 
                  showLabel={true}
                  variant="outline"
                />
                <FavoriteButton 
                  businessId={testBusinessId} 
                  showLabel={true}
                  variant="ghost"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Favorites List */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Список избранного</h2>
          
          <FavoritesList showActions={true} />
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Отладочная информация</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Данные избранного:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(favorites, null, 2)}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Статус текущего заведения:</h3>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(favoriteStatus, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
