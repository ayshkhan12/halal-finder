import type { CertStatus, Certification, DayKey, Dietary, Feature, OpenStatus, VenueCategory } from '@/api/types';
import type { IconName } from '@/components/Icon';

export type DistanceUnit = 'mi' | 'km';
export const KM_PER_MILE = 1.609344;

export function formatDistance(km: number | null, unit: DistanceUnit) {
  if (km == null) return null;
  const value = unit === 'mi' ? km / KM_PER_MILE : km;
  const label = unit === 'mi' ? 'mi' : 'km';
  if (value < 0.1) return `<0.1 ${label}`;
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${label}`;
}

/** Spoken form for screen readers, e.g. "1.2 miles away". */
export function spokenDistance(km: number | null, unit: DistanceUnit) {
  if (km == null) return '';
  const value = unit === 'mi' ? km / KM_PER_MILE : km;
  const rounded = value < 10 ? Number(value.toFixed(1)) : Math.round(value);
  const word = unit === 'mi' ? (rounded === 1 ? 'mile' : 'miles') : rounded === 1 ? 'kilometre' : 'kilometres';
  return `${rounded} ${word} away`;
}

export const priceLabel = (level: number) => '£'.repeat(Math.max(1, Math.min(level, 4)));
export const spokenPrice = (level: number) =>
  ['', 'Inexpensive', 'Moderately priced', 'Expensive', 'Very expensive'][Math.max(1, Math.min(level, 4))];

export const DAY_NAMES: Record<DayKey, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
};
export const WEEK: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export function openLabel(s: OpenStatus) {
  if (s.isOpen) return s.closesAt ? `Open · closes ${s.closesAt}` : 'Open now';
  if (!s.opensAt) return 'Closed';
  if (s.opensDay === 'today') return `Closed · opens ${s.opensAt}`;
  if (s.opensDay === 'tomorrow') return `Closed · opens tomorrow ${s.opensAt}`;
  return `Closed · opens ${DAY_NAMES[s.opensDay as DayKey].slice(0, 3)} ${s.opensAt}`;
}

export function spokenOpen(s: OpenStatus) {
  if (s.isOpen) return s.closesAt ? `Open now, closes at ${s.closesAt}` : 'Open now';
  if (!s.opensAt) return 'Closed';
  if (s.opensDay === 'today') return `Closed, opens at ${s.opensAt}`;
  if (s.opensDay === 'tomorrow') return `Closed, opens tomorrow at ${s.opensAt}`;
  return `Closed, opens ${DAY_NAMES[s.opensDay as DayKey]} at ${s.opensAt}`;
}

export function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const CERT_META: Record<CertStatus, { label: string; icon: IconName; tone: 'success' | 'warning' | 'danger' | 'muted' }> = {
  verified: { label: 'Certified', icon: 'verified', tone: 'success' },
  expiring: { label: 'Expiring soon', icon: 'expiring', tone: 'warning' },
  expired: { label: 'Certificate expired', icon: 'expired', tone: 'danger' },
  unverified: { label: 'Not certified', icon: 'unverified', tone: 'muted' },
};

export function certSummary(c: Certification) {
  const body = c.certifier?.shortName;
  switch (c.status) {
    case 'verified':
      return `${body} certified`;
    case 'expiring':
      return c.daysRemaining === 0 ? `${body} · expires today` : `${body} · expires in ${c.daysRemaining} days`;
    case 'expired':
      return `${body} certificate expired`;
    default:
      return 'No certificate on record';
  }
}

export function certSentence(c: Certification) {
  const body = c.certifier?.name ?? 'a certification body';
  switch (c.status) {
    case 'verified':
      return `Certified halal by ${body}. Certificate valid until ${formatDate(c.expiresOn)}.`;
    case 'expiring':
      return `Certified halal by ${body}, but the certificate expires on ${formatDate(c.expiresOn)}. Renewal is usually routine.`;
    case 'expired':
      return `The certificate from ${body} expired on ${formatDate(c.expiresOn)}. Check with the business directly before relying on it.`;
    default:
      return 'We have no halal certificate on record for this listing.';
  }
}

export const CATEGORY_META: Record<VenueCategory, { label: string; plural: string; icon: IconName }> = {
  restaurant: { label: 'Restaurant', plural: 'Restaurants', icon: 'dineIn' },
  takeaway: { label: 'Takeaway', plural: 'Takeaways', icon: 'takeaway' },
  cafe: { label: 'Café', plural: 'Cafés', icon: 'cafe' },
  dessert: { label: 'Desserts', plural: 'Desserts', icon: 'dessert' },
  butcher: { label: 'Butcher', plural: 'Butchers', icon: 'butcher' },
  grocery: { label: 'Grocer', plural: 'Grocers', icon: 'grocery' },
};

export const FEATURE_META: Record<Feature, { label: string; icon: IconName }> = {
  dine_in: { label: 'Dine in', icon: 'dineIn' },
  takeaway: { label: 'Takeaway', icon: 'takeaway' },
  delivery: { label: 'Delivery', icon: 'delivery' },
  family_friendly: { label: 'Family friendly', icon: 'family' },
  wheelchair_accessible: { label: 'Step-free access', icon: 'wheelchair' },
  prayer_space: { label: 'Prayer space', icon: 'prayer' },
  parking: { label: 'Parking', icon: 'parking' },
  vegetarian_options: { label: 'Vegetarian options', icon: 'leaf' },
};

export const DIETARY_META: Record<Dietary, { label: string; icon: IconName }> = {
  alcohol_free: { label: 'Alcohol-free', icon: 'noAlcohol' },
  gelatine_free: { label: 'Gelatine-free', icon: 'check' },
  vegetarian: { label: 'Vegetarian', icon: 'leaf' },
  vegan: { label: 'Vegan', icon: 'leaf' },
  hand_slaughtered: { label: 'Hand-slaughtered', icon: 'hand' },
};

export const pluralise = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
