'use client';

import { useCallback } from 'react';
import { openInvoice, isInvoiceOpened } from '@telegram-apps/sdk';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import { PremiumPlan, DonationType } from '@/lib/telegram-stars/plans';

export function useTelegramStars() {
  const launchParams = useLaunchParams(true); // SSR-safe для Next.js
  const user = launchParams.tgWebAppData?.user;
  
  const openBusinessSubscription = useCallback(async (params: {
    businessId: number;
    plan: PremiumPlan;
  }) => {
    if (!user?.id) {
      throw new Error('Пользователь не авторизован');
    }
    
    try {
      // Создаем счет через наш API
      const response = await fetch('/api/payments/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: params.businessId,
          plan: params.plan,
          telegramUserId: user.id.toString()
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Ошибка создания счета');
      }
      
      // Проверяем доступность openInvoice в текущей версии Telegram
      if (!openInvoice.isAvailable()) {
        throw new Error('Оплата недоступна в вашей версии Telegram. Обновите приложение.');
      }
      
      // Открываем счет через Telegram SDK v3.x
      const status = await openInvoice(data.invoiceLink, 'url');
      
      return {
        status,
        subscriptionId: data.subscriptionId,
        planDetails: data.planDetails
      };
      
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }, [user?.id]);
  
  const openDonation = useCallback(async (params: {
    type: DonationType;
    starsAmount?: number;
    message?: string;
  }) => {
    if (!user?.id) {
      throw new Error('Пользователь не авторизован');
    }
    
    try {
      // Создаем счет для доната через наш API
      const response = await fetch('/api/donations/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: params.type,
          starsAmount: params.starsAmount,
          message: params.message,
          telegramUserId: user.id.toString()
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Ошибка создания доната');
      }
      
      // Проверяем доступность openInvoice
      if (!openInvoice.isAvailable()) {
        throw new Error('Оплата недоступна в вашей версии Telegram. Обновите приложение.');
      }
      
      // Открываем счет через Telegram SDK v3.x
      const status = await openInvoice(data.invoiceLink, 'url');
      
      return {
        status,
        donationId: data.donationId,
        donationDetails: data.donationDetails
      };
      
    } catch (error) {
      console.error('Donation error:', error);
      throw error;
    }
  }, [user?.id]);
  
  const isPaymentInProgress = useCallback(() => {
    return isInvoiceOpened();
  }, []);
  
  return {
    openBusinessSubscription,
    openDonation,
    isPaymentInProgress,
    userId: user?.id,
    isAuthenticated: !!user?.id
  };
}
