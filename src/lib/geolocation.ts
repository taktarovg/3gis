// Главный экспорт всех геолокационных компонентов и функций

// Компоненты карт
export { GoogleMap } from '@/components/maps/GoogleMap';
export { StaticMap } from '@/components/maps/StaticMap';

// Компоненты локации
export { NearbyButton, NearbyButtonCompact } from '@/components/location/NearbyButton';
export { AddressAutocomplete } from '@/components/location/AddressAutocomplete';

// Google Maps API функции
export { 
  getGoogleMapsApi,
  initializeMap,
  geocodeAddress,
  reverseGeocode,
  createBusinessMarker,
  getStaticMapUrl,
  getCurrentPosition,
  isGeolocationSupported,
  MAP_DEFAULTS
} from '@/lib/maps/google-maps';

// Расчет расстояний
export {
  DistanceCalculator
} from '@/lib/maps/distance-calculator';

// Хуки
export { useGeolocation } from '@/hooks/use-geolocation';
export { useDebounce } from '@/hooks/use-debounce';

// Типы
export type {
  Coordinates,
  BusinessLocation,
  BusinessWithDistance,
  GeolocationResult,
  AddressSuggestion,
  BusinessSearchParams,
  BusinessSearchResponse
} from '@/types/geolocation';
