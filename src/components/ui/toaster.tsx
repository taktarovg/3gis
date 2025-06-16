// src/components/ui/toaster.tsx

import { Toaster as Sonner } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        duration: 3000,
        className: "rounded-lg shadow-lg border opacity-95",
      }}
    />
  );
}