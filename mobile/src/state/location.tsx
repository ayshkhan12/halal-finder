import * as Location from 'expo-location';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import type { Area } from '@/api/types';
import { readJSON, writeJSON } from '@/lib/storage';

export type Origin = { lat: number; lng: number };
type Source = 'device' | 'area';
type Status = 'idle' | 'locating' | 'ready' | 'denied' | 'unavailable';

type LocationContext = {
  origin: Origin | null;
  label: string | null;
  source: Source | null;
  status: Status;
  /** Asks for permission if needed. Resolves true when a position was found. */
  requestDeviceLocation: () => Promise<boolean>;
  chooseArea: (area: Area) => void;
};

type Saved = { source: Source; area?: Area };
const KEY = 'hf.location';

const Ctx = createContext<LocationContext>({
  origin: null,
  label: null,
  source: null,
  status: 'idle',
  requestDeviceLocation: async () => false,
  chooseArea: () => {},
});

const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))]);

async function nearestPlaceName(origin: Origin) {
  if (Platform.OS === 'web') return null;
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude: origin.lat, longitude: origin.lng });
    return place?.city ?? place?.subregion ?? null;
  } catch {
    return null;
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [source, setSource] = useState<Source | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  const locate = async (): Promise<boolean> => {
    setStatus('locating');
    try {
      const last = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 }).catch(() => null);
      const position = last ?? (await withTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), 12000));
      const next = { lat: position.coords.latitude, lng: position.coords.longitude };
      setOrigin(next);
      setSource('device');
      setLabel('Your location');
      setStatus('ready');
      writeJSON(KEY, { source: 'device' } satisfies Saved);
      nearestPlaceName(next).then((name) => name && setLabel(name));
      return true;
    } catch {
      setStatus('unavailable');
      return false;
    }
  };

  const requestDeviceLocation = async () => {
    const current = await Location.getForegroundPermissionsAsync().catch(() => null);
    let granted = current?.granted ?? false;
    if (!granted && current?.canAskAgain !== false) {
      const asked = await Location.requestForegroundPermissionsAsync().catch(() => null);
      granted = asked?.granted ?? false;
    }
    if (!granted) {
      setStatus('denied');
      return false;
    }
    return locate();
  };

  const chooseArea = (area: Area) => {
    setOrigin({ lat: area.lat, lng: area.lng });
    setLabel(area.city);
    setSource('area');
    setStatus('ready');
    writeJSON(KEY, { source: 'area', area } satisfies Saved);
  };

  // Restore the last choice. Only re-uses device location if permission is already granted.
  useEffect(() => {
    readJSON<Saved>(KEY).then(async (saved) => {
      if (saved?.source === 'area' && saved.area) {
        chooseArea(saved.area);
      } else if (saved?.source === 'device') {
        const perm = await Location.getForegroundPermissionsAsync().catch(() => null);
        if (perm?.granted) locate();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Ctx.Provider value={{ origin, label, source, status, requestDeviceLocation, chooseArea }}>{children}</Ctx.Provider>
  );
}

export const useLocation = () => useContext(Ctx);
