import type { Restaurant } from '@/api/types';
import type { Origin } from '@/state/location';

export type VenueMapProps = {
  restaurants: Restaurant[];
  /** Where to centre the map. Changing `focusKey` re-centres even if the point is the same. */
  center: Origin;
  focusKey: number;
  zoomKm: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  showUser: boolean;
  scheme: 'light' | 'dark';
};

export const UK_CENTRE: Origin = { lat: 53.4, lng: -1.9 };
