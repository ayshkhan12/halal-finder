import { createContext, useContext, useState, type ReactNode } from 'react';

import type { RestaurantFilters } from '@/api/queries';
import type { VenueCategory } from '@/api/types';
import { KM_PER_MILE, type DistanceUnit } from '@/lib/format';
import { usePreferences } from './preferences';

/** Radius choices per unit; the filter stores an index so switching units keeps a sensible value. */
export const RADIUS_STEPS: Record<DistanceUnit, number[]> = {
  mi: [1, 3, 5, 10, 25],
  km: [2, 5, 10, 15, 40],
};

export type VenueFilters = {
  category: VenueCategory[];
  certifier?: string;
  fullyHalal: boolean;
  alcoholFree: boolean;
  handSlaughtered: boolean;
  openNow: boolean;
  currentCertOnly: boolean;
  radiusStep: number;
  sort?: 'distance' | 'rating' | 'name';
};

export const DEFAULT_FILTERS: VenueFilters = {
  category: [],
  fullyHalal: false,
  alcoholFree: false,
  handSlaughtered: false,
  openNow: false,
  currentCertOnly: true,
  radiusStep: 3,
};

type FiltersContext = {
  filters: VenueFilters;
  setFilters: (patch: Partial<VenueFilters>) => void;
  reset: () => void;
  /** Filters in API form, with the radius converted to km. */
  apiFilters: RestaurantFilters;
  /** How many non-default filters are on (shown as a badge). */
  activeCount: number;
};

const Ctx = createContext<FiltersContext | null>(null);

export function radiusKm(step: number, unit: DistanceUnit) {
  const value = RADIUS_STEPS[unit][step] ?? RADIUS_STEPS[unit][3];
  return unit === 'mi' ? value * KM_PER_MILE : value;
}

export function FiltersProvider({ children }: { children: ReactNode }) {
  const { distanceUnit } = usePreferences();
  const [filters, set] = useState<VenueFilters>(DEFAULT_FILTERS);

  const apiFilters: RestaurantFilters = {
    category: filters.category,
    certifier: filters.certifier,
    fullyHalal: filters.fullyHalal,
    alcoholFree: filters.alcoholFree,
    handSlaughtered: filters.handSlaughtered,
    openNow: filters.openNow,
    currentCertOnly: filters.currentCertOnly,
    radiusKm: Math.round(radiusKm(filters.radiusStep, distanceUnit) * 100) / 100,
    sort: filters.sort,
  };

  const activeCount = [
    filters.certifier,
    filters.fullyHalal,
    filters.alcoholFree,
    filters.handSlaughtered,
    filters.openNow,
    !filters.currentCertOnly,
    filters.radiusStep !== DEFAULT_FILTERS.radiusStep,
    filters.sort,
  ].filter(Boolean).length;

  return (
    <Ctx.Provider
      value={{
        filters,
        setFilters: (patch) => set((prev) => ({ ...prev, ...patch })),
        reset: () => set((prev) => ({ ...DEFAULT_FILTERS, category: prev.category })),
        apiFilters,
        activeCount,
      }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useFilters must be used inside FiltersProvider');
  return ctx;
}
