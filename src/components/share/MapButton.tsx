'use client';

import { Navigation } from 'lucide-react';

interface MapButtonProps {
  address: string;
  cityName: string;
  className?: string;
}

export function MapButton({ address, cityName, className }: MapButtonProps) {
  const handleClick = () => {
    const fullAddress = encodeURIComponent(`${address}, ${cityName}`);
    window.open(`https://maps.google.com/maps?q=${fullAddress}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      type="button"
    >
      <Navigation className="w-4 h-4 mr-2" />
      Маршрут
    </button>
  );
}