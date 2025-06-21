// Адаптация логотипа для разных контекстов
export const LogoConfig = {
  // Полный логотип для больших размеров
  full: {
    src: '/logo-main.png',
    sizes: ['192x192', '512x512'],
    contexts: ['app-icon', 'social-media', 'marketing']
  },
  
  // Упрощенный для favicon
  simplified: {
    src: '/favicon-simple.svg',
    sizes: ['32x32', '64x64'],
    contexts: ['browser-tab', 'bookmarks']
  },
  
  // Минимальный для очень маленьких размеров
  minimal: {
    src: '/favicon-minimal.ico',
    sizes: ['16x16'],
    contexts: ['system-tray', 'tiny-icons']
  }
};

// Компонент для автоматического выбора версии логотипа
export function AdaptiveLogo({ size, context }: { size: number; context?: string }) {
  const getLogoVersion = (size: number) => {
    if (size >= 128) return LogoConfig.full;
    if (size >= 32) return LogoConfig.simplified;
    return LogoConfig.minimal;
  };
  
  const logo = getLogoVersion(size);
  return <img src={logo.src} alt="3GIS" width={size} height={size} />;
}
