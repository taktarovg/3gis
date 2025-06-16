// src/store/auth-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, City, Prisma } from '@prisma/client';
import { AUTH_CONSTANTS } from '@/lib/auth';
import { logger } from '@/utils/logger';

// Используем Prisma.UserGetPayload для правильного типирования
const userWithRelationsPayload = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    city: true,
    businesses: {
      include: {
        category: true,
        city: true
      }
    },
    favorites: {
      include: {
        business: {
          include: {
            category: true
          }
        }
      }
    }
  }
});

// Правильный тип пользователя с отношениями
type UserWithRelations = Prisma.UserGetPayload<typeof userWithRelationsPayload> & {
  // Для совместимости с кодом страниц
  favoriteBusinesses?: Array<{ id: number; name: string }>;
  ownedBusinesses?: Array<{ id: number; name: string; status: string }>;
};

interface AuthState {
  user: UserWithRelations | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean; // Флаг для отслеживания гидратации

  // Действия (actions)
  setAuth: (user: UserWithRelations, token: string) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  updateUser: (userData: Partial<UserWithRelations>) => void;
  setHydrated: (state: boolean) => void;
  
  // 3GIS специфичные действия
  updateUserLocation: (latitude: number, longitude: number) => void;
  addFavoriteBusiness: (business: { id: number; name: string }) => void;
  removeFavoriteBusiness: (businessId: number) => void;
  updateBusinessCount: (count: number) => void;
}

// Создаем функцию для проверки доступности localStorage
const isBrowser = typeof window !== 'undefined';

// Проверка доступности localStorage
const isLocalStorageAvailable = () => {
  try {
    if (!isBrowser) return false;
    
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    logger.warn('localStorage is not available:', e);
    return false;
  }
};

// Создаем хранилище с промежуточным ПО persist для сохранения в localStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      error: null,
      isHydrated: false,

      setAuth: (user, token) => {
        logger.logAuth('Setting 3GIS authentication data');
        
        // Сохраняем токен в localStorage с правильным ключом
        if (isBrowser && isLocalStorageAvailable()) {
          try {
            // Сохраняем токен в основной ключ
            localStorage.setItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY, token);
            // Для совместимости сохраняем и в старый ключ
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(user));
          } catch (error) {
            logger.error('Error saving auth data to localStorage:', error);
          }
        }
        
        set({ user, token, isLoading: false, error: null });
      },

      logout: () => {
        // Удаляем данные из localStorage при выходе
        if (isBrowser && isLocalStorageAvailable()) {
          try {
            localStorage.removeItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY);
            localStorage.removeItem(AUTH_CONSTANTS.TOKEN_REFRESH_KEY);
            localStorage.removeItem('auth_token'); // старый ключ
            localStorage.removeItem('user');
            localStorage.removeItem('telegramInitData');
            logger.logAuth('3GIS Authentication data removed from localStorage');
          } catch (error) {
            logger.error('Error removing items from localStorage:', error);
          }
        }
        logger.logAuth('3GIS User logged out');
        set({ user: null, token: null, isLoading: false, error: null });
      },

      setError: (error) => {
        if (error) {
          logger.error('3GIS Auth error set:', error);
        } else {
          logger.logAuth('3GIS Auth error cleared');
        }
        set({ error, isLoading: false });
      },

      setLoading: (isLoading) => {
        logger.logAuth(`3GIS Loading state set to: ${isLoading}`);
        set({ isLoading });
      },

      updateUser: (userData) => {
        logger.logAuth('Updating 3GIS user data');
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      },

      setHydrated: (state) => {
        logger.logAuth(`3GIS Hydration state set to: ${state}`);
        set({ isHydrated: state });
      },

      // 3GIS специфичные действия
      updateUserLocation: (latitude, longitude) => {
        logger.logAuth('Updating user location in 3GIS');
        set((state) => ({
          user: state.user ? { ...state.user, latitude, longitude } : null
        }));
      },

      addFavoriteBusiness: (business) => {
        logger.logAuth(`Adding business ${business.name} to favorites`);
        set((state) => {
          if (!state.user) return state;
          
          const currentFavorites = state.user.favoriteBusinesses || [];
          const isAlreadyFavorite = currentFavorites.some(fav => fav.id === business.id);
          
          if (isAlreadyFavorite) return state;
          
          return {
            user: {
              ...state.user,
              favoriteBusinesses: [...currentFavorites, business]
            }
          };
        });
      },

      removeFavoriteBusiness: (businessId) => {
        logger.logAuth(`Removing business ${businessId} from favorites`);
        set((state) => {
          if (!state.user) return state;
          
          const currentFavorites = state.user.favoriteBusinesses || [];
          const updatedFavorites = currentFavorites.filter(fav => fav.id !== businessId);
          
          return {
            user: {
              ...state.user,
              favoriteBusinesses: updatedFavorites
            }
          };
        });
      },

      updateBusinessCount: (count) => {
        logger.logAuth(`Updating owned business count to ${count}`);
        set((state) => ({
          user: state.user ? { ...state.user, businessCount: count } : null
        }));
      },
    }),
    {
      name: '3gis-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      // Используем своё хранилище, чтобы избежать ошибок гидратации
      storage: createJSONStorage(() => {
        // В случае ошибок при взаимодействии с localStorage, возвращаем фиктивное хранилище
        if (!isBrowser || !isLocalStorageAvailable()) {
          logger.warn('Using mock storage since localStorage is not available');
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        
        return {
          getItem: (key) => {
            try {
              const item = localStorage.getItem(key);
              return item;
            } catch (error) {
              logger.error(`Error getting item ${key} from localStorage:`, error);
              return null;
            }
          },
          setItem: (key, value) => {
            try {
              localStorage.setItem(key, value);
            } catch (error) {
              logger.error(`Error setting item ${key} in localStorage:`, error);
            }
          },
          removeItem: (key) => {
            try {
              localStorage.removeItem(key);
            } catch (error) {
              logger.error(`Error removing item ${key} from localStorage:`, error);
            }
          },
        };
      }),
      // Отключаем async при использовании с сервер-компонентами
      skipHydration: true,
    }
  )
);

/**
 * Инициализация хранилища аутентификации после гидратации
 * Вызывается в ClientProvider для предотвращения ошибок гидратации
 */
export const initAuthStore = () => {
  // Выполняем только на стороне клиента
  if (!isBrowser) return;

  // Получаем состояние хранилища
  const state = useAuthStore.getState();

  // Проверяем, было ли хранилище уже гидратировано
  if (state.isHydrated) {
    logger.logApp('3GIS Auth store already hydrated, skipping initialization');
    return;
  }

  logger.logApp('Initializing 3GIS auth store from localStorage');
  
  // Загружаем данные из localStorage
  try {
    if (isLocalStorageAvailable()) {
      // Проверяем разные ключи для совместимости
      const storedToken = localStorage.getItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY) || 
                         localStorage.getItem('auth_token');
      const storedUserJson = localStorage.getItem('user');

      if (storedToken && storedUserJson) {
        try {
          const storedUser = JSON.parse(storedUserJson) as UserWithRelations;
          state.setAuth(storedUser, storedToken);
          logger.logAuth('3GIS User data loaded from localStorage');
        } catch (parseError) {
          logger.error('Error parsing user data from localStorage:', parseError);
          
          // Если JSON невалидный, очищаем оба значения
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY);
          
          state.logout();
        }
      } else if (storedToken || storedUserJson) {
        // Если одно из значений присутствует, а другое нет - очищаем оба
        logger.warn('Inconsistent auth data in localStorage - clearing');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem(AUTH_CONSTANTS.TOKEN_STORAGE_KEY);
      } else {
        logger.logAuth('No stored auth data found');
      }
    }
  } catch (error) {
    logger.error('Error initializing 3GIS auth store:', error);
    state.logout();
  } finally {
    // Устанавливаем флаг гидратации и завершаем загрузку
    state.setHydrated(true);
    state.setLoading(false);
    logger.logApp('3GIS Auth store hydration complete');
  }
};

/**
 * Хук для проверки гидратации в компонентах
 * Возвращает fallback во время SSR и до гидратации на клиенте
 */
export const useHydration = <T>(
  selector: (state: AuthState) => T,
  fallback: T
): T => {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const value = useAuthStore(selector);

  return isHydrated ? value : fallback;
};

/**
 * Хук для работы с избранными заведениями
 */
export const useFavorites = () => {
  const user = useAuthStore((state) => state.user);
  const addFavoriteBusiness = useAuthStore((state) => state.addFavoriteBusiness);
  const removeFavoriteBusiness = useAuthStore((state) => state.removeFavoriteBusiness);
  
  const favorites = user?.favoriteBusinesses || [];
  
  const isFavorite = (businessId: number) => {
    return favorites.some(fav => fav.id === businessId);
  };
  
  const toggleFavorite = async (business: { id: number; name: string }) => {
    const token = useAuthStore.getState().token;
    
    if (!token) {
      logger.error('No auth token available for favorites operation');
      return;
    }
    
    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId: business.id }),
      });
      
      if (response.ok) {
        const { isFavorite: newState } = await response.json();
        
        if (newState) {
          addFavoriteBusiness(business);
        } else {
          removeFavoriteBusiness(business.id);
        }
        
        logger.logAuth(`Business ${business.name} ${newState ? 'added to' : 'removed from'} favorites`);
      } else {
        logger.error('Failed to toggle favorite status');
      }
    } catch (error) {
      logger.error('Error toggling favorite:', error);
    }
  };
  
  return {
    favorites,
    isFavorite,
    toggleFavorite,
    favoritesCount: favorites.length,
  };
};
