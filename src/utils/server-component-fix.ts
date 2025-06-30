// src/utils/server-component-fix.ts

/**
 * Утилиты для исправления проблем с Server Components
 */

/**
 * Проверяет, является ли компонент Server Component
 */
export function isServerComponent(): boolean {
  return typeof window === 'undefined';
}

/**
 * Безопасно создает props для передачи в Client Components
 * Убирает все функции из props
 */
export function sanitizePropsForClient<T extends Record<string, any>>(props: T): Partial<T> {
  if (isServerComponent()) {
    const sanitized: Partial<T> = {};
    
    for (const [key, value] of Object.entries(props)) {
      // Пропускаем функции
      if (typeof value === 'function') {
        console.warn(`Removing function prop '${key}' from Server Component`);
        continue;
      }
      
      // Пропускаем undefined значения
      if (value === undefined) {
        continue;
      }
      
      // Безопасно копируем остальные значения
      (sanitized as any)[key] = value;
    }
    
    return sanitized;
  }
  
  return props;
}

/**
 * Создает безопасные props для передачи в Client Components
 * Убирает функции и undefined значения
 */
export function createSafeProps<T extends Record<string, any>>(props: T): Partial<T> {
  return sanitizePropsForClient(props);
}

/**
 * Проверяет, безопасен ли prop для передачи в Client Component
 */
export function isSafeProp(value: any): boolean {
  return typeof value !== 'function' && value !== undefined;
}
