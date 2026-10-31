import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { api } from '@/api/client';
import type { FavouriteKey } from '@/api/types';
import { announce } from '@/lib/a11y';
import { readJSON, writeJSON } from '@/lib/storage';
import { useAuth } from './auth';

type ItemType = FavouriteKey['itemType'];
type FavouritesContext = {
  isSaved: (type: ItemType, id: string) => boolean;
  toggle: (type: ItemType, id: string, name: string) => void;
  ids: (type: ItemType) => string[];
  count: number;
};

const KEY = 'hf.favourites';
const keyOf = (type: ItemType, id: string) => `${type}:${id}`;

const Ctx = createContext<FavouritesContext>({ isSaved: () => false, toggle: () => {}, ids: () => [], count: 0 });

/**
 * Favourites always live on the device so guests can save places.
 * When signed in, they are merged with the account and every change is mirrored to the server.
 */
export function FavouritesProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [keys, setKeys] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    readJSON<string[]>(KEY).then((saved) => {
      if (saved) setKeys(saved);
      setLoaded(true);
    });
  }, []);

  const persist = (next: string[]) => {
    setKeys(next);
    writeJSON(KEY, next);
  };

  // On sign-in, push local favourites up and adopt the merged list.
  useEffect(() => {
    if (!token || !loaded) return;
    const items = keys.map((k) => {
      const [itemType, ...rest] = k.split(':');
      return { itemType: itemType as ItemType, itemId: rest.join(':') };
    });
    api<{ data: { items: FavouriteKey[] } }>('/favorites/sync', { method: 'POST', body: { items } })
      .then(({ data }) => persist(data.items.map((i) => keyOf(i.itemType, i.itemId))))
      .catch(() => {});
    // Only when the signed-in user changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, loaded]);

  const toggle = (type: ItemType, id: string, name: string) => {
    const k = keyOf(type, id);
    const saving = !keys.includes(k);
    persist(saving ? [k, ...keys] : keys.filter((x) => x !== k));
    announce(saving ? `${name} saved` : `${name} removed from saved`);
    if (token) {
      api(`/favorites/${type}/${encodeURIComponent(id)}`, { method: saving ? 'PUT' : 'DELETE' }).catch(() => {
        // Keep the local change; the next sign-in sync will reconcile it.
      });
    }
  };

  const value: FavouritesContext = {
    isSaved: (type, id) => keys.includes(keyOf(type, id)),
    toggle,
    ids: (type) => keys.filter((k) => k.startsWith(`${type}:`)).map((k) => k.slice(type.length + 1)),
    count: keys.length,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useFavourites = () => useContext(Ctx);
