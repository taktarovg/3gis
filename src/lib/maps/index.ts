// Экспорт всех компонентов и библиотек для работы с геолокацией
export { GoogleMap } from './maps/GoogleMap';
export { StaticMap } from './maps/StaticMap';
export { NearbyButton, NearbyButtonCompact } from './location/NearbyButton';
export { AddressAutocomplete } from './location/AddressAutocomplete';

// Библиотеки
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
} from './lib/maps/google-maps';

export {
  DistanceCalculator
} from './lib/maps/distance-calculator';

// Хуки
export { useGeolocation, useDebounce } from './hooks/use-geolocation';
