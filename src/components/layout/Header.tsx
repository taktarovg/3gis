// src/components/layout/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Menu, X, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  variant?: 'landing' | 'app';
  transparent?: boolean;
}

export function Header({ variant = 'landing', transparent = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = transparent && !isScrolled;

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isTransparent 
            ? "bg-transparent" 
            : "bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-sm"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center group transition-opacity hover:opacity-80"
            >
              {/* Логотип с fallback */}
              {!logoError ? (
                <Image
                  src="/logos/3gis-logo.png"
                  alt="3GIS - Русскоязычный справочник США"
                  width={180}
                  height={54}
                  className="h-10 md:h-12 w-auto transition-transform group-hover:scale-105"
                  priority
                  onError={() => setLogoError(true)}
                />
              ) : (
                // Fallback логотип
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl transition-colors",
                    isTransparent 
                      ? "bg-white/10 backdrop-blur-sm" 
                      : "bg-blue-600"
                  )}>
                    <MapPin className={cn(
                      "w-6 h-6 md:w-7 md:h-7",
                      isTransparent ? "text-white" : "text-white"
                    )} />
                  </div>
                  
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-xl md:text-2xl font-bold transition-colors",
                      isTransparent ? "text-white" : "text-gray-900"
                    )}>
                      3<span className="text-blue-600">GIS</span>
                    </span>
                    <span className={cn(
                      "text-xs text-gray-500 hidden md:block",
                      isTransparent ? "text-white/80" : "text-gray-500"
                    )}>
                      Твой проводник в Америке
                    </span>
                  </div>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {variant === 'landing' && (
                <>
                  <Link 
                    href="#features" 
                    className={cn(
                      "font-medium transition-colors hover:text-blue-600",
                      isTransparent ? "text-white hover:text-blue-200" : "text-gray-700"
                    )}
                  >
                    Возможности
                  </Link>
                  <Link 
                    href="#categories" 
                    className={cn(
                      "font-medium transition-colors hover:text-blue-600",
                      isTransparent ? "text-white hover:text-blue-200" : "text-gray-700"
                    )}
                  >
                    Категории
                  </Link>
                  <Link 
                    href="#about" 
                    className={cn(
                      "font-medium transition-colors hover:text-blue-600",
                      isTransparent ? "text-white hover:text-blue-200" : "text-gray-700"
                    )}
                  >
                    О проекте
                  </Link>
                </>
              )}
              
              {/* Contact Info */}
              <div className="flex items-center space-x-4 text-sm">
                <a 
                  href="tel:+1234567890" 
                  className={cn(
                    "flex items-center space-x-1 transition-colors hover:text-blue-600",
                    isTransparent ? "text-white/80 hover:text-blue-200" : "text-gray-600"
                  )}
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden lg:inline">+1 (234) 567-890</span>
                </a>
                <a 
                  href="mailto:support@3gis.us" 
                  className={cn(
                    "flex items-center space-x-1 transition-colors hover:text-blue-600",
                    isTransparent ? "text-white/80 hover:text-blue-200" : "text-gray-600"
                  )}
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden lg:inline">support@3gis.us</span>
                </a>
              </div>
            </nav>

            {/* CTA Button + Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Main CTA Button */}
              <Link
                href="https://t.me/ThreeGIS_bot/app"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "hidden sm:inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105",
                  isTransparent 
                    ? "bg-white text-blue-600 hover:bg-blue-50" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                <span className="hidden md:inline">Открыть приложение</span>
                <span className="md:hidden">Открыть</span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  "md:hidden p-2 rounded-lg transition-colors",
                  isTransparent 
                    ? "text-white hover:bg-white/10" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
            <div className="container mx-auto px-4 py-6">
              <nav className="space-y-4">
                {variant === 'landing' && (
                  <>
                    <Link 
                      href="#features"
                      className="block py-3 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Возможности
                    </Link>
                    <Link 
                      href="#categories"
                      className="block py-3 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Категории
                    </Link>
                    <Link 
                      href="#about"
                      className="block py-3 text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      О проекте
                    </Link>
                    <hr className="my-4" />
                  </>
                )}
                
                {/* Contact Links */}
                <div className="space-y-3">
                  <a 
                    href="tel:+1234567890" 
                    className="flex items-center space-x-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>+1 (234) 567-890</span>
                  </a>
                  <a 
                    href="mailto:support@3gis.us" 
                    className="flex items-center space-x-3 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <span>support@3gis.us</span>
                  </a>
                </div>

                {/* Mobile CTA */}
                <div className="pt-4">
                  <Link
                    href="https://t.me/ThreeGIS_bot/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Открыть приложение в Telegram
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content overlap */}
      <div className="h-16 md:h-20" />
    </>
  );
}