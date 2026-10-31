export type CertStatus = 'verified' | 'expiring' | 'expired' | 'unverified';

export type Certification = {
  status: CertStatus;
  daysRemaining: number | null;
  number: string | null;
  expiresOn: string | null;
  lastVerified: string | null;
  certifier: { id: string; name: string; shortName: string } | null;
};

export type VenueCategory = 'restaurant' | 'takeaway' | 'cafe' | 'dessert' | 'butcher' | 'grocery';

export type Feature =
  | 'dine_in'
  | 'takeaway'
  | 'delivery'
  | 'family_friendly'
  | 'wheelchair_accessible'
  | 'prayer_space'
  | 'parking'
  | 'vegetarian_options';

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type OpenStatus = {
  isOpen: boolean;
  closesAt: string | null;
  opensAt: string | null;
  opensDay: 'today' | 'tomorrow' | DayKey | null;
};

export type Restaurant = {
  id: string;
  name: string;
  description: string;
  category: VenueCategory;
  cuisine: string;
  address: { line1: string; city: string; postcode: string | null; country: string };
  location: { lat: number; lng: number };
  distanceKm: number | null;
  phone: string | null;
  priceLevel: number;
  rating: number;
  reviewCount: number;
  halal: { status: 'fully_halal' | 'halal_options'; alcoholFree: boolean; handSlaughtered: boolean };
  features: Feature[];
  imageUrl: string | null;
  hours: Partial<Record<DayKey, [string, string][]>>;
  timezone: string;
  openStatus: OpenStatus;
  certification: Certification;
};

export type Dietary = 'alcohol_free' | 'gelatine_free' | 'vegetarian' | 'vegan' | 'hand_slaughtered';

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  size: string | null;
  barcode: string | null;
  imageUrl: string | null;
  dietary: Dietary[];
  certification: Certification;
};

export type ProductDetail = Product & { stockists: Restaurant[] };

export type Certifier = {
  id: string;
  name: string;
  shortName: string;
  country: string;
  website: string | null;
  description: string;
  slaughterPolicy: 'hand_only' | 'stunning_permitted' | 'varies';
  restaurantCount: number;
  productCount: number;
};

export type Area = { city: string; count: number; lat: number; lng: number };
export type Facet = { value: string; count: number };
export type Meta = { categories: Facet[]; cuisines: Facet[]; productCategories: Facet[]; areas: Area[] };

export type User = { id: string; name: string; email: string; createdAt: string };
export type FavouriteKey = { itemType: 'restaurant' | 'product'; itemId: string };

export type Page<T> = { data: T[]; meta: { total: number; limit: number; offset: number } };

export type ReportReason = 'not_halal' | 'certificate_expired' | 'permanently_closed' | 'wrong_details' | 'other';
