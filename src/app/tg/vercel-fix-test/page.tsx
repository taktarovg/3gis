/** 
 * Тестовая компиляция для проверки исправления ошибок Vercel
 * После исправления этот файл должен компилироваться без ошибок
 */

import { FavoriteButton } from '@/components/favorites/FavoriteButton'
import { useHapticFeedback } from '@/hooks/use-haptic-feedback'

export default function VercelFixTest() {
  const haptic = useHapticFeedback()

  const handleTest = () => {
    haptic.success()
    console.log('Тест исправлений Vercel - все работает!')
  }

  return (
    <div className="p-4">
      <h1>Тест исправлений для Vercel</h1>
      <p>Кавычки экранированы: &quot;Избранное&quot;</p>
      
      <FavoriteButton 
        businessId={1} 
        showLabel={true}
      />
      
      <button onClick={handleTest} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Тест haptic feedback
      </button>
    </div>
  )
}
