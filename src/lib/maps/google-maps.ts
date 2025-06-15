import { Loader, type LoaderOptions } from '@googlemaps/js-api-loader';

// Конфигурация Google Maps (используем только бесплатные ESSENTIALS API)
const GOOGLE_MAPS_CONFIG: LoaderOptions = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  version: 'weekly',
  libraries: ['places', 'geometry'],
  language: 'ru',
  region: 'US',
};

// Singleton loader для оптимизации
let mapLoader: Loader | null = null;

/**
 * Получение инициализированного Google Maps API
 */
export async function getGoogleMapsApi(): Promise<typeof google> {
  if (!mapLoader) {
    mapLoader = new Loader(GOOGLE_MAPS_CONFIG);
  }
  
  return await mapLoader.load();
}

/**
 * Инициализация карты на элементе
 */
export async function initializeMap(
  element: HTMLElement,
  options: google.maps.MapOptions = {}
): Promise<google.maps.Map> {
  const googleLib = await getGoogleMapsApi();
  
  const defaultOptions: google.maps.MapOptions = {
    zoom: 13,
    center: { lat: 40.7128, lng: -74.0060 }, // Нью-Йорк по умолчанию
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: true,
    mapTypeId: googleLib.maps.MapTypeId.ROADMAP,
    styles: [
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }] // Скрываем конкурирующие POI
      }
    ],
    ...options,
  };
  
  return new googleLib.maps.Map(element, defaultOptions);
}

/**
 * Геокодирование: адрес → координаты (использует Geocoding API - 10K бесплатно)
 */
export async function geocodeAddress(address: string): Promise<{
  lat: number;
  lng: number;
  formattedAddress: string;
} | null> {
  try {
    const googleLib = await getGoogleMapsApi();
    const geocoder = new googleLib.maps.Geocoder();
    
    const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode(
        { 
          address: address,
          region: 'US',
          componentRestrictions: { country: 'US' }
        },
        (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
    
    if (result.length > 0) {
      const location = result[0].geometry.location;
      return {
        lat: location.lat(),
        lng: location.lng(),
        formattedAddress: result[0].formatted_address,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Обратное геокодирование: координаты → адрес (использует Geocoding API)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<{
  address: string;
  city: string;
  state: string;
  zipCode?: string;
} | null> {
  try {
    const googleLib = await getGoogleMapsApi();
    const geocoder = new googleLib.maps.Geocoder();
    
    const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        }
      );
    });
    
    if (result.length > 0) {
      const addressComponents = result[0].address_components;
      
      let city = '';
      let state = '';
      let zipCode = '';
      
      addressComponents.forEach(component => {
        const types = component.types;
        if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        } else if (types.includes('postal_code')) {
          zipCode = component.long_name;
        }
      });
      
      return {
        address: result[0].formatted_address,
        city,
        state,
        zipCode,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Создание маркера заведения на карте
 */
export async function createBusinessMarker(
  map: google.maps.Map,
  business: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    category: { icon: string };
    premiumTier?: string;
  },
  onClick?: (business: any) => void
): Promise<google.maps.Marker> {
  const googleLib = await getGoogleMapsApi();
  
  // Цвет маркера в зависимости от статуса
  const markerColor = business.premiumTier && business.premiumTier !== 'FREE' ? '#FFD700' : '#3B82F6';
  
  const marker = new googleLib.maps.Marker({
    position: { lat: business.latitude, lng: business.longitude },
    map: map,
    title: business.name,
    icon: {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0z" fill="${markerColor}" stroke="white" stroke-width="2"/>
          <circle cx="16" cy="16" r="8" fill="white"/>
          <text x="16" y="20" font-family="Arial" font-size="12" fill="${markerColor}" text-anchor="middle">
            ${business.category.icon}
          </text>
        </svg>
      `)}`,
      scaledSize: new googleLib.maps.Size(32, 40),
      anchor: new googleLib.maps.Point(16, 40),
    },
  });
  
  if (onClick) {
    marker.addListener('click', () => onClick(business));
  }
  
  return marker;
}

/**
 * Статичная карта (использует Static Maps API - 10K бесплатно)
 */
export function getStaticMapUrl(
  latitude: number,
  longitude: number,
  options: {
    zoom?: number;
    width?: number;
    height?: number;
    markers?: Array<{ lat: number; lng: number; color?: string }>;
  } = {}
): string {
  const {
    zoom = 15,
    width = 400,
    height = 300,
    markers = []
  } = options;
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  let mapUrl = `https://maps.googleapis.com/maps/api/staticmap?`
    + `center=${latitude},${longitude}`
    + `&zoom=${zoom}`
    + `&size=${width}x${height}`
    + `&maptype=roadmap`
    + `&key=${apiKey}`;
  
  // Добавляем маркеры
  if (markers.length > 0) {
    markers.forEach(marker => {
      const color = marker.color || 'red';
      mapUrl += `&markers=color:${color}%7C${marker.lat},${marker.lng}`;
    });
  } else {
    // Основной маркер
    mapUrl += `&markers=color:red%7C${latitude},${longitude}`;
  }
  
  return mapUrl;
}

/**
 * Проверка поддержки геолокации
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Получение текущего местоположения пользователя
 */
export function getCurrentPosition(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('Геолокация не поддерживается'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMessage = 'Не удалось определить местоположение';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Доступ к геолокации запрещен';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Информация о местоположении недоступна';
            break;
          case error.TIMEOUT:
            errorMessage = 'Тайм-аут при определении местоположения';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 минут кэш
      }
    );
  });
}

/**
 * Константы для использования в приложении
 */
export const MAP_DEFAULTS = {
  NEW_YORK: { lat: 40.7128, lng: -74.0060 },
  LOS_ANGELES: { lat: 34.0522, lng: -118.2437 },
  CHICAGO: { lat: 41.8781, lng: -87.6298 },
  MIAMI: { lat: 25.7617, lng: -80.1918 },
  DEFAULT_ZOOM: 13,
  NEARBY_RADIUS: 10, // км
} as const;
