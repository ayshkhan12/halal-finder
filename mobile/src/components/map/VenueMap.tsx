import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { VenueMapProps } from './VenueMap.types';
import { Icon } from '@/components/Icon';
import { CERT_META, certSummary } from '@/lib/format';
import { palette } from '@/theme/tokens';

const statusColor = { verified: palette.emerald700, expiring: '#9A6700', expired: '#B42318', unverified: '#5B6470' };

const regionFor = (center: { lat: number; lng: number }, km: number) => ({
  latitude: center.lat,
  longitude: center.lng,
  latitudeDelta: (km * 2.2) / 111,
  longitudeDelta: (km * 2.2) / (111 * Math.cos((center.lat * Math.PI) / 180)),
});

/** Native map (Apple Maps on iOS, Google Maps on Android). */
export function VenueMap({ restaurants, center, focusKey, zoomKm, selectedId, onSelect, showUser, scheme }: VenueMapProps) {
  const ref = useRef<MapView>(null);

  useEffect(() => {
    ref.current?.animateToRegion(regionFor(center, zoomKm), 400);
    // Re-centre only when asked to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey]);

  // Frame all the pins whenever the set of places changes.
  const idsKey = restaurants.map((r) => r.id).join(',');
  useEffect(() => {
    if (restaurants.length === 0) return;
    ref.current?.fitToCoordinates(
      restaurants.map((r) => ({ latitude: r.location.lat, longitude: r.location.lng })),
      { edgePadding: { top: 120, right: 48, bottom: 260, left: 48 }, animated: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return (
    <MapView
      ref={ref}
      style={StyleSheet.absoluteFill}
      initialRegion={regionFor(center, zoomKm)}
      showsUserLocation={showUser}
      showsPointsOfInterests={false}
      userInterfaceStyle={scheme}
      accessibilityLabel="Map of halal places. The list below the map has the same places.">
      {restaurants.map((r) => {
        const selected = r.id === selectedId;
        const color = statusColor[r.certification.status];
        return (
          <Marker
            key={`${r.id}-${selected ? 's' : 'n'}`}
            coordinate={{ latitude: r.location.lat, longitude: r.location.lng }}
            onPress={() => onSelect(r.id)}
            tracksViewChanges={false}
            title={r.name}
            description={certSummary(r.certification)}
            accessibilityLabel={`${r.name}, ${certSummary(r.certification)}`}
            zIndex={selected ? 10 : 1}>
            <View style={[styles.pin, { backgroundColor: color, transform: [{ scale: selected ? 1.25 : 1 }] }, selected && styles.pinSelected]}>
              <Icon name={CERT_META[r.certification.status].icon} size={16} color="#FFFFFF" />
            </View>
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
  },
  pinSelected: { borderColor: palette.gold300, borderWidth: 3 },
});
