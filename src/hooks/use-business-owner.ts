'use client';

import { useQuery } from '@tanstack/react-query';
import { useTelegramAuth } from './use-telegram-auth';

interface OwnerCheckResult {
  isOwner: boolean;
  businessId: number;
  userId: number;
}

export function useBusinessOwner(businessId: number) {
  const { token, isAuthenticated } = useTelegramAuth();
  
  return useQuery<OwnerCheckResult>({
    queryKey: ['business-owner', businessId, token],
    queryFn: async () => {
      // ✅ ИСПРАВЛЕНО: Отправляем запрос даже без токена
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/businesses/${businessId}/owner-check`, {
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ошибка проверки владельца');
      }

      return response.json();
    },
    enabled: !!businessId, // ✅ ИСПРАВЛЕНО: Убрали проверку на token и isAuthenticated
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: false
  });
}
