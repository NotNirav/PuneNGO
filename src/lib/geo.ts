import { getArea, PUNE_CENTER } from "@/config/areas";

export type LatLng = { lat: number; lng: number };

/** Great-circle distance in kilometres (haversine formula). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Exact NGO coordinates if given, otherwise the approximate centre of its area. */
export function ngoLocation(ngo: { lat: number | null; lng: number | null; area: string }): LatLng & { approx: boolean } {
  if (ngo.lat != null && ngo.lng != null) return { lat: ngo.lat, lng: ngo.lng, approx: false };
  const area = getArea(ngo.area);
  return { ...(area ?? PUNE_CENTER), approx: true };
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

/**
 * Try to pull coordinates out of a Google Maps link, e.g.
 * .../@18.5074,73.8077,15z  or  ...?q=18.5074,73.8077  or  ...!3d18.5!4d73.8
 */
export function coordsFromMapsUrl(url: string | null | undefined): LatLng | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // 1. Raw coordinates like "18.5204, 73.8567" or "18.5204 73.8567"
  const raw = trimmed.match(/^(-?\d{1,2}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)$/);
  if (raw) {
    const lat = Number(raw[1]);
    const lng = Number(raw[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    decoded = trimmed;
  }

  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /[?&](?:q|query|ll|destination)=(?:loc:)?(-?\d+\.\d+)[,\s+](-?\d+\.\d+)/i,
    /(?:place|search|dir)\/(?:[^/]+\/)?(-?\d+\.\d+)[,\s+](-?\d+\.\d+)/i,
    /(-?\d{1,2}\.\d{3,})[,\s]+(-?\d{1,3}\.\d{3,})/,
  ];

  for (const p of patterns) {
    const m = decoded.match(p);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return null;
}
