import { Coordinates, LocalzItem, PharmacyDutyShift } from '../types';

/**
 * Calculates great-circle distance between two coordinates using Haversine formula
 */
export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats distance cleanly (e.g. "350 m" or "2,4 km")
 */
export function formatDistance(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) {
    return '';
  }
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1).replace('.', ',')} km`;
}

/**
 * Checks if a business or place is currently open right now according to its schedule
 */
export function isCurrentlyOpen(item: LocalzItem): boolean {
  if (item.type === 'event') {
    return item.eventStatus === 'happening_now';
  }

  if (item.type === 'business' && item.is24h) {
    return true;
  }

  const openingHours = (item as any).openingHours;
  if (!openingHours || !Array.isArray(openingHours) || openingHours.length === 0) {
    return false;
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ...
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const daySchedule = openingHours.find((h) => h.dayOfWeek === currentDay);
  if (!daySchedule || !daySchedule.isOpen) {
    return false;
  }

  if (daySchedule.is24h) {
    return true;
  }

  if (!daySchedule.periods || daySchedule.periods.length === 0) {
    return false;
  }

  for (const period of daySchedule.periods) {
    const [openH, openM] = period.open.split(':').map(Number);
    const [closeH, closeM] = period.close.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    let closeMinutes = closeH * 60 + closeM;

    // Handle closing after midnight (e.g., 18:00 to 02:00)
    if (closeMinutes < openMinutes) {
      if (currentMinutes >= openMinutes || currentMinutes <= closeMinutes) {
        return true;
      }
    } else {
      if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks if a pharmacy shift is active right now
 */
export function isShiftActiveNow(shift: PharmacyDutyShift): boolean {
  const now = new Date().getTime();
  const start = new Date(shift.startDateTime).getTime();
  const end = new Date(shift.endDateTime).getTime();
  return now >= start && now <= end && shift.status === 'confirmed';
}

/**
 * Generates turn-by-turn navigation URLs for external map apps
 */
export function getDirectionsUrl(lat: number, lng: number, title?: string): { google: string; waze: string } {
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${title ? `&destination_place_id=${encodeURIComponent(title)}` : ''}`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  };
}

/**
 * Requests browser geolocation with user-friendly error messages
 */
export function getCurrentPosition(
  onSuccess: (coords: Coordinates) => void,
  onError: (errorMessage: string) => void
): void {
  if (!navigator.geolocation) {
    onError('Seu navegador não suporta geolocalização.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      onSuccess({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    (error) => {
      let message = 'Não foi possível obter sua localização atual.';
      if (error.code === error.PERMISSION_DENIED) {
        message = 'Permissão de localização negada. Você pode escolher a cidade manualmente.';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        message = 'Sinal de GPS indisponível no momento.';
      } else if (error.code === error.TIMEOUT) {
        message = 'Tempo limite esgotado ao buscar localização.';
      }
      onError(message);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }
  );
}
