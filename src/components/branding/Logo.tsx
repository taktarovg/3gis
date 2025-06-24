// src/components/branding/Logo.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'default' | 'white' | 'dark' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  href?: string;
  className?: string;
}

export function Logo({ 
  variant = 'default', 
  size = 'md', 
  showTagline = false, 
  href = '/',
  className 
}: LogoProps) {
  
  // Размеры и пути для разных вариантов
  const sizeConfig = {
    sm: {
      width: 120,
      height: 36,
      className: 'h-8 w-auto',
      logoPath: '/logos/3gis-logo-small.png',
      whiteLogoPath: '/logos/3gis-logo-white.png'
    },
    md: {
      width: 180,
      height: 54,
      className: 'h-10 md:h-12 w-auto',
      logoPath: '/logos/3gis-logo.png',
      whiteLogoPath: '/logos/3gis-logo-white.png'
    },
    lg: {
      width: 240,
      height: 72,
      className: 'h-12 md:h-16 w-auto',
      logoPath: '/logos/3gis-logo.png',
      whiteLogoPath: '/logos/3gis-logo-white.png'
    },
    xl: {
      width: 320,
      height: 96,
      className: 'h-16 md:h-20 w-auto',
      logoPath: '/logos/3gis-logo.png',
      whiteLogoPath: '/logos/3gis-logo-white.png'
    }
  };

  const config = sizeConfig[size];

  const LogoContent = () => (
    <div className={cn("flex items-center group", className)}>
      {variant === 'icon-only' ? (
        // Только иконка без текста
        <div className={cn(
          "flex items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105 relative"
        )}>
          <Image
            src="/logos/3gis-icon.png"
            alt="3GIS"
            width={size === 'sm' ? 32 : size === 'xl' ? 64 : 48}
            height={size === 'sm' ? 32 : size === 'xl' ? 64 : 48}
            className={cn(
              "transition-transform group-hover:scale-110",
              size === 'sm' ? 'w-8 h-8' : size === 'xl' ? 'w-16 h-16' : 'w-10 h-10 md:w-12 md:h-12'
            )}
          />
        </div>
      ) : (
        // Полный логотип
        <Image
          src={variant === 'white' ? config.whiteLogoPath : config.logoPath}
          alt="3GIS - Русскоязычный справочник США"
          width={config.width}
          height={config.height}
          className={cn(
            config.className,
            "transition-transform group-hover:scale-105"
          )}
          priority={size === 'md' || size === 'lg'}
        />
      )}
      
      {/* Дополнительный tagline если нужен */}
      {showTagline && variant !== 'icon-only' && (
        <div className="ml-3 hidden md:block">
          <span className={cn(
            "text-sm font-medium",
            variant === 'white' ? 'text-white/80' : 'text-gray-600'
          )}>
            Твой проводник в Америке
          </span>
        </div>
      )}
    </div>
  );

  // Если есть href, оборачиваем в Link
  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}

// Специализированные компоненты для разных случаев
export function HeaderLogo({ transparent = false, ...props }: LogoProps & { transparent?: boolean }) {
  return (
    <Logo 
      variant={transparent ? 'white' : 'default'}
      size="md"
      {...props}
    />
  );
}

export function FooterLogo(props: LogoProps) {
  return (
    <Logo 
      variant="white"
      size="lg"
      {...props}
    />
  );
}

export function FaviconLogo(props: LogoProps) {
  return (
    <Logo 
      variant="icon-only"
      size="sm"
      {...props}
    />
  );
}

// Fallback компонент для случаев когда изображение не загружается
export function LogoFallback({ 
  variant = 'default', 
  size = 'md',
  className 
}: Pick<LogoProps, 'variant' | 'size' | 'className'>) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl',
    xl: 'text-3xl md:text-4xl'
  };

  const colorClasses = {
    default: 'text-gray-900',
    white: 'text-white',
    dark: 'text-gray-100',
    'icon-only': 'text-gray-900'
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn(
        "flex items-center justify-center rounded-xl",
        size === 'sm' ? 'w-8 h-8' : size === 'xl' ? 'w-16 h-16' : 'w-10 h-10 md:w-12 md:h-12',
        variant === 'white' ? 'bg-white/10' : 'bg-blue-600'
      )}>
        <MapPin className={cn(
          "text-white",
          size === 'sm' ? 'w-4 h-4' : size === 'xl' ? 'w-8 h-8' : 'w-6 h-6'
        )} />
      </div>
      
      {variant !== 'icon-only' && (
        <span className={cn(
          "font-bold",
          sizeClasses[size],
          colorClasses[variant]
        )}>
          3<span className="text-blue-600">GIS</span>
        </span>
      )}
    </div>
  );
}