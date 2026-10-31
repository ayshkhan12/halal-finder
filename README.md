# Halal Finder

A cross-platform mobile app (iOS, Android and web) for finding **certified halal restaurants, takeaways, butchers and grocers** nearby, and for checking whether a **packaged food product** carries a current halal certificate.

```
HalalFinder/
├── mobile/       Expo (React Native) app — TypeScript, Expo Router
├── backend/      REST API — Node.js, Express 5, SQLite (built-in node:sqlite)
├── legacy-web/   The original website, kept unchanged for reference
└── scripts/      Dev helpers
```

## Quick start

Requirements: Node.js 22.13 or newer. For a phone, install **Expo Go** from the App Store or Play Store.

```bash
npm run setup     # installs backend and mobile dependencies
npm run dev       # starts the API (port 3000) and the Expo dev server together
```

Then either:

- **Phone:** scan the QR code in the terminal with the Camera app (iOS) or Expo Go (Android). Your phone must be on the same Wi-Fi as your computer; the app finds the API automatically.
- **Web:** press `w` in the Expo terminal, or run `npm run web`.
- **iOS Simulator:** press `i` (needs Xcode, see below).

Run things separately if you prefer: `npm run api` and `npm run app`.

### iOS Simulator setup (one-off)

Xcode is installed on this Mac but not selected and its licence hasn't been accepted. Run these once (they need your password):

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

## Features

| Area | What it does |
| --- | --- |
| Explore | Places sorted by distance, live search, place-type chips, quick filters, infinite scroll, pull to refresh |
| Map | Native maps on iOS/Android, OpenStreetMap on web. Pins show certificate status by shape and colour; a swipeable list mirrors the map |
| Verification | Each listing links to its certifier, certificate number and expiry. Status (certified, expiring within 30 days, expired) is worked out live. Expired listings are hidden by default |
| Halal details | Fully halal or halal options only, alcohol served or not, hand-slaughtered meat |
| Products | Search, categories, dietary filters (gelatine-free, vegetarian, vegan, hand-slaughtered), nearest stockists |
| Barcode scan | Camera scanning (EAN/UPC) with haptic feedback and a manual entry fallback |
| Saved | Works without an account; signing in syncs saved items to the server |
| Community | "Report a problem" on every listing goes to a review queue |
| Preferences | Miles or kilometres; system, light or dark appearance |

Demo barcodes: `2001000000050` (certified yoghurt) and `2001000000098` (expired certificate).

## Accessibility

Built to WCAG 2.2 AA:

- Every control has a role, a spoken label and its state (selected, checked, busy). Cards read as one sentence, e.g. *"Levant Kitchen. Syrian restaurant. 1.2 miles away. Rated 4.8 from 276 reviews. Open now, closes at 22:30. HMC certified."*
- Touch targets are at least 44–48 pt.
- Colour pairs meet 4.5:1 contrast in light and dark themes; status is never shown by colour alone.
- Text follows the system font size. The product grid switches to one column at large text sizes.
- Result counts, saves and form errors are announced to screen readers.
- The map has an equivalent list; the camera has a typed fallback.
- Loading placeholders don't animate, and web honours `prefers-reduced-motion`. Keyboard focus is clearly visible on web.

## API

Base URL `http://<host>:3000/api/v1`. Lists return `{ data, meta: { total, limit, offset } }`; errors return `{ error: { code, message, fields? } }`.

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/restaurants` | `lat`, `lng`, `radiusKm`, `q`, `category` (csv), `certifier`, `fullyHalal`, `alcoholFree`, `handSlaughtered`, `openNow`, `currentCertOnly`, `sort`, `limit`, `offset` |
| GET | `/restaurants/:id` | optional `lat`/`lng` for distance |
| GET | `/products` | `q`, `category`, `certifier`, `dietary` (csv) |
| GET | `/products/:id` | includes stockists, nearest first |
| GET | `/products/barcode/:code` | |
| GET | `/certifiers`, `/certifiers/:id` | |
| GET | `/meta` | categories, cuisines, product categories, cities |
| POST | `/auth/register`, `/auth/login` | returns `{ token, user }` |
| GET | `/auth/me` | Bearer token |
| GET / PUT / DELETE | `/favorites`, `/favorites/:type/:id` | Bearer token |
| POST | `/favorites/sync` | merges favourites saved before sign-in |
| POST | `/reports` | sign-in optional |

## Tests

```bash
npm test          # API tests (node:test) + mobile TypeScript check
```

## Architecture notes

- **Mobile:** Expo SDK 58, Expo Router (file-based routes in `mobile/src/app`), TanStack Query for caching and paging, React Context for location, auth, favourites, filters and preferences. Tokens live in the Keychain/Keystore via `expo-secure-store`.
- **Backend:** Routes call repositories (`backend/src/repositories`) that own all SQL, so moving from SQLite to Postgres only touches that layer. Input is validated with zod. Passwords are hashed with bcrypt, tokens are JWTs, and auth/report routes are rate limited.
- **Scaling:** the geo search uses an indexed bounding box followed by an exact distance check. At larger scale, swap in PostGIS (or a geohash index) and move opening-hours filtering into the query.

## Demo data

All venues, brands, certificate numbers and phone numbers are fictional (phone numbers use Ofcom's drama ranges). The certification bodies are real organisations but have not certified these sample listings. Dates are relative to when the database is first created, so the demo never goes stale. Run `npm --prefix backend run db:reset` to rebuild it.

## Deploying

- **API:** any Node 22+ host. Set `NODE_ENV=production`, `JWT_SECRET` and optionally `CORS_ORIGINS` and `DB_PATH` (see `backend/.env.example`).
- **App:** set `EXPO_PUBLIC_API_URL` to the API URL, then build with EAS: `npx eas-cli@latest build --platform ios|android`. Android release builds need a Google Maps API key (see the Expo `react-native-maps` docs).
