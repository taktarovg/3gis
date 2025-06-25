// src/components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Logo } from '@/components/branding/Logo';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Logo variant="white" size="lg" className="mb-4" />
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
              Современный справочник русскоязычных организаций в США. 
              Находите врачей, рестораны, юристов и другие услуги на родном языке.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-8 text-sm">
              <div>
                <div className="text-2xl font-bold text-blue-400">5.5M+</div>
                <div className="text-gray-400">Русскоговорящих в США</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">1000+</div>
                <div className="text-gray-400">Проверенных заведений</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">50+</div>
                <div className="text-gray-400">Городов США</div>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Быстрые ссылки</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Возможности
                </Link>
              </li>
              <li>
                <Link href="#categories" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Категории
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-blue-400 transition-colors">
                  О проекте
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Конфиденциальность
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Условия использования
                </Link>
              </li>
              <li>
                <Link href="/legal/disclaimer" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Отказ от ответственности
                </Link>
              </li>
              <li>
                <Link href="/legal/accessibility" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Доступность
                </Link>
              </li>
              <li>
                <Link href="/legal/do-not-sell" className="text-gray-300 hover:text-red-400 transition-colors font-medium">
                  Do Not Sell My Information
                </Link>
              </li>
              <li>
                <Link href="/legal/refund-policy" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Возврат средств
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-blue-400" />
                <a href="mailto:support@3gis.us" className="text-gray-300 hover:text-blue-400 transition-colors">
                  support@3gis.us
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-blue-400" />
                <a href="tel:+1234567890" className="text-gray-300 hover:text-blue-400 transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-3 text-blue-400 mt-0.5" />
                <span className="text-gray-300">
                  По всей территории США
                </span>
              </li>
            </ul>
            
            {/* Telegram Link */}
            <div className="mt-6">
              <Link
                href="https://t.me/ThreeGIS_bot/app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Открыть в Telegram
                <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 3GIS. Все права защищены.
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link href="/legal/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
                Конфиденциальность
              </Link>
              <Link href="/legal/terms" className="text-gray-400 hover:text-blue-400 transition-colors">
                Условия
              </Link>
              <Link href="/legal/do-not-sell" className="text-gray-400 hover:text-red-400 transition-colors font-medium">
                Do Not Sell My Information
              </Link>
              <Link href="/legal/refund-policy" className="text-gray-400 hover:text-blue-400 transition-colors">
                Возврат
              </Link>
              <Link href="/legal/accessibility" className="text-gray-400 hover:text-blue-400 transition-colors">
                Доступность
              </Link>
              <Link href="/legal/dmca" className="text-gray-400 hover:text-blue-400 transition-colors">
                DMCA
              </Link>
              <Link href="/legal/cookies" className="text-gray-400 hover:text-blue-400 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}