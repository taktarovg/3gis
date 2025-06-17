'use client'

import { FavoritesList } from '@/components/favorites/FavoritesList'
import { useFavorites } from '@/hooks/use-favorites'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function FavoritesPage() {
  const { data } = useFavorites()
  const favoritesCount = data?.count || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <Link 
            href="/tg"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Избранное
            </h1>
            {favoritesCount > 0 && (
              <p className="text-sm text-gray-500">
                {favoritesCount} {getPlural(favoritesCount, ['место', 'места', 'мест'])}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <FavoritesList showActions={true} />
      </div>
    </div>
  )
}

// Утилита для склонения слов
function getPlural(count: number, words: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2]
  return words[(count % 100 > 4 && count % 100 < 20) 
    ? 2 
    : cases[Math.min(count % 10, 5)]
  ]
}
