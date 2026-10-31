import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { api } from './client';
import type { Certifier, Meta, Page, Product, ProductDetail, ReportReason, Restaurant } from './types';
import type { Origin } from '@/state/location';

const PAGE_SIZE = 20;

export type RestaurantFilters = {
  q?: string;
  category?: string[];
  certifier?: string;
  cuisine?: string;
  fullyHalal?: boolean;
  alcoholFree?: boolean;
  handSlaughtered?: boolean;
  openNow?: boolean;
  currentCertOnly?: boolean;
  radiusKm?: number;
  sort?: 'distance' | 'rating' | 'name';
};

const originParams = (origin: Origin | null) => (origin ? { lat: origin.lat, lng: origin.lng } : {});

export function useRestaurants(filters: RestaurantFilters, origin: Origin | null) {
  const params = { ...filters, ...originParams(origin), radiusKm: origin ? filters.radiusKm : undefined };
  return useInfiniteQuery({
    queryKey: ['restaurants', params],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      api<Page<Restaurant>>('/restaurants', { params: { ...params, limit: PAGE_SIZE, offset: pageParam }, signal }),
    getNextPageParam: (last) => {
      const next = last.meta.offset + last.meta.limit;
      return next < last.meta.total ? next : undefined;
    },
  });
}

/** Everything matching the filters in one request, for the map. */
export function useRestaurantsForMap(filters: RestaurantFilters, origin: Origin | null) {
  const params = { ...filters, ...originParams(origin), radiusKm: origin ? filters.radiusKm : undefined, limit: 100 };
  return useQuery({
    queryKey: ['restaurants-map', params],
    queryFn: ({ signal }) => api<Page<Restaurant>>('/restaurants', { params, signal }),
  });
}

/** Just the match count, for the "Show N places" button in filters. */
export function useRestaurantCount(filters: RestaurantFilters, origin: Origin | null) {
  const params = { ...filters, ...originParams(origin), radiusKm: origin ? filters.radiusKm : undefined, limit: 1 };
  return useQuery({
    queryKey: ['restaurants-count', params],
    queryFn: ({ signal }) => api<Page<Restaurant>>('/restaurants', { params, signal }),
    select: (page) => page.meta.total,
  });
}

export function useRestaurant(id: string, origin: Origin | null) {
  return useQuery({
    queryKey: ['restaurant', id, origin],
    queryFn: ({ signal }) => api<{ data: Restaurant }>(`/restaurants/${encodeURIComponent(id)}`, { params: originParams(origin), signal }),
    select: (r) => r.data,
  });
}

export function useRestaurantsByIds(ids: string[], origin: Origin | null) {
  return useQuery({
    queryKey: ['restaurants-by-id', ids, origin],
    enabled: ids.length > 0,
    queryFn: ({ signal }) =>
      api<Page<Restaurant>>('/restaurants', { params: { ids, ...originParams(origin), sort: 'name', limit: 100 }, signal }),
    select: (page) => page.data,
  });
}

export type ProductFilters = { q?: string; category?: string; dietary?: string[]; certifier?: string };

export function useProducts(filters: ProductFilters) {
  return useInfiniteQuery({
    queryKey: ['products', filters],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      api<Page<Product>>('/products', { params: { ...filters, limit: PAGE_SIZE, offset: pageParam }, signal }),
    getNextPageParam: (last) => {
      const next = last.meta.offset + last.meta.limit;
      return next < last.meta.total ? next : undefined;
    },
  });
}

export function useProductsByIds(ids: string[]) {
  return useQuery({
    queryKey: ['products-by-id', ids],
    enabled: ids.length > 0,
    queryFn: ({ signal }) => api<Page<Product>>('/products', { params: { ids, limit: 100 }, signal }),
    select: (page) => page.data,
  });
}

export function useProduct(id: string, origin: Origin | null) {
  return useQuery({
    queryKey: ['product', id, origin],
    queryFn: ({ signal }) => api<{ data: ProductDetail }>(`/products/${encodeURIComponent(id)}`, { params: originParams(origin), signal }),
    select: (r) => r.data,
  });
}

export const fetchProductByBarcode = (code: string) =>
  api<{ data: Product }>(`/products/barcode/${encodeURIComponent(code)}`).then((r) => r.data);

export function useCertifiers() {
  return useQuery({
    queryKey: ['certifiers'],
    queryFn: ({ signal }) => api<{ data: Certifier[] }>('/certifiers', { signal }),
    select: (r) => r.data,
    staleTime: 60 * 60 * 1000,
  });
}

export function useCertifier(id: string) {
  return useQuery({
    queryKey: ['certifier', id],
    queryFn: ({ signal }) => api<{ data: Certifier }>(`/certifiers/${encodeURIComponent(id)}`, { signal }),
    select: (r) => r.data,
  });
}

export function useMeta() {
  return useQuery({
    queryKey: ['meta'],
    queryFn: ({ signal }) => api<{ data: Meta }>('/meta', { signal }),
    select: (r) => r.data,
    staleTime: 60 * 60 * 1000,
  });
}

export function useSubmitReport() {
  return useMutation({
    mutationFn: (body: { itemType: 'restaurant' | 'product'; itemId: string; reason: ReportReason; details?: string }) =>
      api<{ data: { id: string } }>('/reports', { method: 'POST', body }),
  });
}
