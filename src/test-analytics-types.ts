// Тест типизации после исправления Google Analytics
// Этот файл можно удалить после успешного деплоя

export function testAnalyticsTypes() {
  if (typeof window !== 'undefined') {
    // Проверяем, что gtag определена правильно
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID');
      window.gtag('event', 'test_event', { value: 1 });
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
    
    // Проверяем dataLayer
    if (window.dataLayer) {
      window.dataLayer.push(['test', 'value']);
    }
  }
}

// Экспорт для удаления неиспользуемых переменных
export default testAnalyticsTypes;
