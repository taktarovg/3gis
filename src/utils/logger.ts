// src/utils/logger.ts

/**
 * Сервис для управляемого логирования 3GIS
 * Позволяет централизованно включать/отключать логи для разных окружений
 */
class Logger {
  private isProduction = process.env.NODE_ENV === 'production';
  
  private isEnabled = true;
  
  /**
   * Обычное логирование (только в development)
   */
  public log(...args: any[]): void {
    if (this.isEnabled && !this.isProduction) {
      console.log(...args);
    }
  }
  
  /**
   * Логирование предупреждений (во всех режимах)
   */
  public warn(...args: any[]): void {
    if (this.isEnabled) {
      console.warn(...args);
    }
  }
  
  /**
   * Логирование ошибок (во всех режимах)
   */
  public error(...args: any[]): void {
    if (this.isEnabled) {
      console.error(...args);
    }
  }
  
  /**
   * Отключение всех логов
   */
  public disable(): void {
    this.isEnabled = false;
  }
  
  /**
   * Включение всех логов
   */
  public enable(): void {
    this.isEnabled = true;
  }

  /**
   * Логирование информации о Telegram
   */
  public logTelegram(message: string, ...args: any[]): void {
    if (this.isEnabled && !this.isProduction) {
      console.log(`🔔 3GIS Telegram: ${message}`, ...args);
    }
  }

  /**
   * Логирование информации об авторизации
   */
  public logAuth(message: string, ...args: any[]): void {
    if (this.isEnabled && !this.isProduction) {
      console.log(`🔑 3GIS Auth: ${message}`, ...args);
    }
  }

  /**
   * Логирование информации о состоянии приложения
   */
  public logApp(message: string, ...args: any[]): void {
    if (this.isEnabled && !this.isProduction) {
      console.log(`📱 3GIS App: ${message}`, ...args);
    }
  }

  /**
   * Логирование геолокации
   */
  public logGeo(message: string, ...args: any[]): void {
    if (this.isEnabled && !this.isProduction) {
      console.log(`📍 3GIS Geo: ${message}`, ...args);
    }
  }

  /**
   * Логирование бизнес-операций
   */
  public logBusiness(message: string, ...args: any[]): void {
    if (this.isEnabled && !this.isProduction) {
      console.log(`🏢 3GIS Business: ${message}`, ...args);
    }
  }
}

// Экспортируем единственный экземпляр логгера
export const logger = new Logger();
