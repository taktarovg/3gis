// Экспорт всех компонентов и библиотек для работы с геолокацией

// Компоненты карт (находятся в src/components/maps)
export { GoogleMap, SimpleMap } from '../../components/maps/GoogleMap';
export { StaticMapPreview, MapThumbnail } from '../../components/maps/StaticMapPreview';

// Компоненты локации (находятся в src/components/location)
export { NearbyButton, NearbyButtonCompact } from '../../components/location/NearbyButton';
export { AddressAutocomplete } from '../../components/location/AddressAutocomplete';

// Основные функции Google Maps
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
} from './google-maps';

// Утилиты для расчета расстояний
export {
  DistanceCalculator,
  DISTANCE_RANGES,
  enrichWithDistanceInfo
} from '../distance-calculator';

// Хуки
export { useGeolocation } from '../../hooks/use-geolocation';
export { useDebounce } from '../../hooks/use-debounce';
