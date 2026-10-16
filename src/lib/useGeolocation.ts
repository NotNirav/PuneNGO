"use client";

import { useCallback, useEffect, useState } from "react";
import type { LatLng } from "./geo";

export type GeoState =
  | { status: "idle" | "locating" | "unsupported" }
  | { status: "denied" | "error"; message: string }
  | { status: "ready"; coords: LatLng };

/**
 * Browser location, ONLY on request. Kept in memory for this page view —
 * never stored, never sent to our server.
 * If permission was already granted earlier, `autoIfGranted` fetches it silently.
 */
export function useGeolocation({ autoIfGranted = false } = {}) {
  const [state, setState] = useState<GeoState>({ status: "idle" });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState({ status: "unsupported" });
      return;
    }
    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setState({ status: "ready", coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      (err) =>
        setState(
          err.code === err.PERMISSION_DENIED
            ? { status: "denied", message: "Location permission was denied." }
            : { status: "error", message: "We couldn't get your location. Please try again." },
        ),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  useEffect(() => {
    if (!autoIfGranted || !navigator.permissions?.query) return;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((p) => {
        if (p.state === "granted") request();
      })
      .catch(() => {});
  }, [autoIfGranted, request]);

  return { state, request };
}
