// Типы для геолокации и карт

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BusinessLocation extends Coordinates {
  address: string;
  city: string;
  state: string;
}

export interface BusinessWithDistance {
  id: number;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  address: string;
  phone?: string | null;
  website?: string | null;
  rating: number;
  reviewCount: number;
  languages: string[];
  hasParking: boolean;
  premiumTier: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // Расстояние в км
  category: {
    name: string;
    icon: string;
  };
  city: {
    name: string;
    state: string;
  };
  photos: {
    url: string;
  }[];
  _count: {
    reviews: number;
    favorites: number;
  };
}

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface AddressSuggestion {
  address: string;
  city: string;
  state: string;
}

export interface BusinessSearchParams {
  category?: string;
  search?: string;
  filter?: string;
  city?: string;
  lat?: string;
  lng?: string;
  radius?: string;
}

export interface BusinessSearchResponse {
  businesses: BusinessWithDistance[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  userLocation?: Coordinates;
  radius?: number;
  nearbyCount?: number;
}
