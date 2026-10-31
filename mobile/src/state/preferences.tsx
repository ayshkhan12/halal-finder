import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import type { DistanceUnit } from '@/lib/format';
import { readJSON, writeJSON } from '@/lib/storage';

export type Appearance = 'system' | 'light' | 'dark';
type Prefs = { distanceUnit: DistanceUnit; appearance: Appearance };
type PrefsContext = Prefs & {
  ready: boolean;
  setDistanceUnit: (u: DistanceUnit) => void;
  setAppearance: (a: Appearance) => void;
};

const KEY = 'hf.preferences';
const DEFAULTS: Prefs = { distanceUnit: 'mi', appearance: 'system' };

const Ctx = createContext<PrefsContext>({ ...DEFAULTS, ready: false, setDistanceUnit: () => {}, setAppearance: () => {} });

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    readJSON<Prefs>(KEY).then((saved) => {
      if (saved) setPrefs({ ...DEFAULTS, ...saved });
      setReady(true);
    });
  }, []);

  const update = (patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      writeJSON(KEY, next);
      return next;
    });
  };

  return (
    <Ctx.Provider
      value={{
        ...prefs,
        ready,
        setDistanceUnit: (distanceUnit) => update({ distanceUnit }),
        setAppearance: (appearance) => update({ appearance }),
      }}>
      {children}
    </Ctx.Provider>
  );
}

export const usePreferences = () => useContext(Ctx);
