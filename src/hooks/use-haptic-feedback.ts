'use client'

import { 
  hapticFeedbackImpactOccurred, 
  hapticFeedbackNotificationOccurred, 
  hapticFeedbackSelectionChanged 
} from '@telegram-apps/sdk-react'

/**
 * Hook для удобного использования haptic feedback в 3GIS
 * Совместим с Telegram SDK v3.x
 */
export function useHapticFeedback() {
  const impactOccurred = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    try {
      if (hapticFeedbackImpactOccurred.isAvailable()) {
        hapticFeedbackImpactOccurred(style)
      }
    } catch (error) {
      console.debug('Haptic feedback impact not available:', error)
    }
  }

  const notificationOccurred = (type: 'error' | 'success' | 'warning') => {
    try {
      if (hapticFeedbackNotificationOccurred.isAvailable()) {
        hapticFeedbackNotificationOccurred(type)
      }
    } catch (error) {
      console.debug('Haptic feedback notification not available:', error)
    }
  }

  const selectionChanged = () => {
    try {
      if (hapticFeedbackSelectionChanged.isAvailable()) {
        hapticFeedbackSelectionChanged()
      }
    } catch (error) {
      console.debug('Haptic feedback selection not available:', error)
    }
  }

  return {
    /**
     * Вызывает haptic feedback при столкновении/ударе
     * @param style - интенсивность: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
     */
    impactOccurred,
    
    /**
     * Вызывает haptic feedback для уведомления
     * @param type - тип: 'error' | 'success' | 'warning'
     */
    notificationOccurred,
    
    /**
     * Вызывает haptic feedback при изменении выбора
     */
    selectionChanged,

    // Алиасы для упрощения использования
    /** Легкий удар при нажатии кнопки */
    buttonPress: () => impactOccurred('light'),
    /** Средний удар при важном действии */
    actionPress: () => impactOccurred('medium'),
    /** Уведомление об успехе */
    success: () => notificationOccurred('success'),
    /** Уведомление об ошибке */
    error: () => notificationOccurred('error'),
    /** Уведомление о предупреждении */
    warning: () => notificationOccurred('warning')
  }
}
