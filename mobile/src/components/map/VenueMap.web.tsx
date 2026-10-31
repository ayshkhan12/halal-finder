import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

import type { VenueMapProps } from './VenueMap.types';
import { certSummary } from '@/lib/format';
import { palette } from '@/theme/tokens';

const statusColor = { verified: palette.emerald700, expiring: '#9A6700', expired: '#B42318', unverified: '#5B6470' };
const statusGlyph = { verified: '✓', expiring: '!', expired: '×', unverified: '?' };

const zoomFor = (km: number) => Math.max(5, Math.min(15, Math.round(14 - Math.log2(Math.max(km, 0.5)))));

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Web map using Leaflet + OpenStreetMap tiles. Markers are keyboard-focusable buttons. */
export function VenueMap({ restaurants, center, focusKey, zoomKm, selectedId, onSelect, showUser, scheme }: VenueMapProps) {
  const host = useRef<HTMLDivElement | null>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const userLayer = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  useEffect(() => {
    if (!host.current || map.current) return;
    map.current = L.map(host.current, { zoomControl: false, attributionControl: true }).setView([center.lat, center.lng], zoomFor(zoomKm));
    L.control.zoom({ position: 'topright' }).addTo(map.current);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    userLayer.current = L.layerGroup().addTo(map.current);
    return () => {
      map.current?.remove();
      map.current = null;
    };
    // Create once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    map.current?.flyTo([center.lat, center.lng], zoomFor(zoomKm), { duration: 0.5 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey]);

  // Frame all the pins whenever the set of places changes.
  const idsKey = restaurants.map((r) => r.id).join(',');
  useEffect(() => {
    if (!map.current || restaurants.length === 0) return;
    const bounds = L.latLngBounds(restaurants.map((r) => [r.location.lat, r.location.lng] as [number, number]));
    map.current.fitBounds(bounds, { paddingTopLeft: [48, 96], paddingBottomRight: [48, 240], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  useEffect(() => {
    if (!layer.current) return;
    layer.current.clearLayers();
    for (const r of restaurants) {
      const selected = r.id === selectedId;
      const size = selected ? 38 : 30;
      const icon = L.divIcon({
        className: 'hf-pin',
        iconSize: [size, size],
        html: `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:${statusColor[r.certification.status]};color:#fff;font:700 ${selected ? 18 : 15}px system-ui;border:${selected ? 3 : 2}px solid ${selected ? palette.gold300 : '#fff'};box-shadow:0 1px 4px rgba(0,0,0,.35);box-sizing:border-box">${statusGlyph[r.certification.status]}</span>`,
      });
      const label = `${r.name}, ${certSummary(r.certification)}`;
      L.marker([r.location.lat, r.location.lng], { icon, title: label, alt: label, keyboard: true, zIndexOffset: selected ? 1000 : 0, riseOnHover: true })
        .on('click', () => onSelectRef.current(r.id))
        .bindTooltip(escape(r.name), { direction: 'top', offset: [0, -size / 2] })
        .addTo(layer.current);
    }
  }, [restaurants, selectedId]);

  useEffect(() => {
    if (!userLayer.current) return;
    userLayer.current.clearLayers();
    if (showUser) {
      L.circleMarker([center.lat, center.lng], { radius: 8, color: '#fff', weight: 3, fillColor: '#1A73E8', fillOpacity: 1 })
        .bindTooltip('Your location')
        .addTo(userLayer.current);
    }
  }, [showUser, center.lat, center.lng]);

  return (
    <View style={{ position: 'absolute', inset: 0 }} accessibilityLabel="Map of halal places. The list below the map has the same places.">
      <div ref={host} style={{ width: '100%', height: '100%', filter: scheme === 'dark' ? 'brightness(0.8) contrast(1.1)' : undefined }} />
    </View>
  );
}
