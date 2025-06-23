'use client';

import { useQuery } from '@tanstack/react-query';
import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react';

interface OwnerCheckResult {
  isOwner: boolean;
  currentSubscription: {
    tier: string;
    endDate: string;
    status: string;
  } | null;
  user: {
    id: number;
    firstName: string;
    role: string;
  };
}

export function useBusinessOwner(businessId: number) {
  const launchParams = useLaunchParams(); // SDK v3.x
  const rawInitData = useRawInitData(); // Получаем сырые данные инициализации
  
  return useQuery<OwnerCheckResult>({
    queryKey: ['business-owner', businessId, rawInitData],
    queryFn: async () => {
      if (!rawInitData) {
        throw new Error('Нет данных авторизации');
      }

      const response = await fetch(`/api/businesses/${businessId}/owner-check`, {
        headers: {
          'Authorization': `tma ${rawInitData}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ошибка проверки владельца');
      }

      return response.json();
    },
    enabled: !!rawInitData && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: false
  });
}
