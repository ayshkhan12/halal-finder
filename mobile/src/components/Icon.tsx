import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

/** Semantic icon names mapped to SF Symbols (iOS) and Material Symbols (Android/web). */
const ICONS = {
  explore: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
  map: { ios: 'map', android: 'map', web: 'map' },
  products: { ios: 'basket', android: 'shopping_basket', web: 'shopping_basket' },
  saved: { ios: 'heart', android: 'favorite', web: 'favorite' },
  savedFill: { ios: 'heart.fill', android: 'favorite', web: 'favorite' },
  account: { ios: 'person.crop.circle', android: 'account_circle', web: 'account_circle' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  location: { ios: 'location.fill', android: 'location_on', web: 'location_on' },
  myLocation: { ios: 'location.circle', android: 'my_location', web: 'my_location' },
  verified: { ios: 'checkmark.seal.fill', android: 'verified', web: 'verified' },
  expiring: { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' },
  expired: { ios: 'xmark.octagon.fill', android: 'gpp_bad', web: 'gpp_bad' },
  unverified: { ios: 'questionmark.circle', android: 'help', web: 'help' },
  clock: { ios: 'clock', android: 'schedule', web: 'schedule' },
  star: { ios: 'star.fill', android: 'star', web: 'star' },
  filters: { ios: 'slider.horizontal.3', android: 'tune', web: 'tune' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  chevronDown: { ios: 'chevron.down', android: 'expand_more', web: 'expand_more' },
  back: { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  call: { ios: 'phone.fill', android: 'call', web: 'call' },
  directions: { ios: 'arrow.triangle.turn.up.right.diamond.fill', android: 'directions', web: 'directions' },
  website: { ios: 'globe', android: 'public', web: 'public' },
  report: { ios: 'flag', android: 'flag', web: 'flag' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
  scan: { ios: 'barcode.viewfinder', android: 'barcode_scanner', web: 'barcode_scanner' },
  noAlcohol: { ios: 'nosign', android: 'no_drinks', web: 'no_drinks' },
  alcohol: { ios: 'wineglass', android: 'wine_bar', web: 'wine_bar' },
  hand: { ios: 'hand.raised', android: 'front_hand', web: 'front_hand' },
  prayer: { ios: 'moon.stars', android: 'mosque', web: 'mosque' },
  wheelchair: { ios: 'figure.roll', android: 'accessible', web: 'accessible' },
  family: { ios: 'figure.2.and.child.holdinghands', android: 'family_restroom', web: 'family_restroom' },
  delivery: { ios: 'bicycle', android: 'delivery_dining', web: 'delivery_dining' },
  takeaway: { ios: 'bag', android: 'takeout_dining', web: 'takeout_dining' },
  dineIn: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
  parking: { ios: 'parkingsign', android: 'local_parking', web: 'local_parking' },
  leaf: { ios: 'leaf', android: 'eco', web: 'eco' },
  list: { ios: 'list.bullet', android: 'list', web: 'list' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
  share: { ios: 'square.and.arrow.up', android: 'share', web: 'share' },
  external: { ios: 'arrow.up.right.square', android: 'open_in_new', web: 'open_in_new' },
  keyboard: { ios: 'keyboard', android: 'keyboard', web: 'keyboard' },
  torch: { ios: 'flashlight.on.fill', android: 'flashlight_on', web: 'flashlight_on' },
  shield: { ios: 'checkmark.shield', android: 'verified_user', web: 'verified_user' },
  building: { ios: 'building.columns', android: 'account_balance', web: 'account_balance' },
  sort: { ios: 'arrow.up.arrow.down', android: 'sort', web: 'sort' },
  city: { ios: 'building.2', android: 'location_city', web: 'location_city' },
  store: { ios: 'storefront', android: 'storefront', web: 'storefront' },
  offline: { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' },
  refresh: { ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' },
  mail: { ios: 'envelope', android: 'mail', web: 'mail' },
  lock: { ios: 'lock', android: 'lock', web: 'lock' },
  eye: { ios: 'eye', android: 'visibility', web: 'visibility' },
  eyeOff: { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' },
  appearance: { ios: 'circle.lefthalf.filled', android: 'contrast', web: 'contrast' },
  ruler: { ios: 'ruler', android: 'straighten', web: 'straighten' },
  cafe: { ios: 'cup.and.saucer', android: 'local_cafe', web: 'local_cafe' },
  dessert: { ios: 'birthday.cake', android: 'cake', web: 'cake' },
  butcher: { ios: 'scalemass', android: 'set_meal', web: 'set_meal' },
  grocery: { ios: 'cart', android: 'local_grocery_store', web: 'local_grocery_store' },
  all: { ios: 'square.grid.2x2', android: 'grid_view', web: 'grid_view' },
} as const satisfies Record<string, SymbolName>;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color: ColorValue;
  style?: StyleProp<ViewStyle>;
};

/** Decorative by default: icons are hidden from screen readers; the surrounding control carries the label. */
export function Icon({ name, size = 22, color, style }: Props) {
  return (
    <SymbolView
      name={ICONS[name]}
      size={size}
      tintColor={color}
      style={style}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    />
  );
}
