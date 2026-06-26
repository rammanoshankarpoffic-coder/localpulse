# 📍 LocalPulse — Hyperlocal Civic App
DevFusion 3.0 | IIT Bombay | Problem Statement #26ENLP4 | Solo Build

## Problem
Residents in Tier-2/3 Indian towns have no structured way to report civic
issues (potholes, water leaks, broken streetlights), discover local
community events, or find reliable local service providers.

## Solution
LocalPulse is a geo-aware community app where residents report issues with
a photo and exact location, upvote problems that matter to them, and track
resolution status — all filtered to a radius they choose. Authorities get
a dedicated dashboard to move issues through Open → Under Review →
In Progress → Resolved.

## Tech Stack
| Layer | Tech |
|-------|------|
| Mobile | React Native (Expo, SDK 54) |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Email/Password) |
| Photo Storage | Cloudinary (unsigned upload preset) |
| Maps | Leaflet.js via WebView + OpenStreetMap tiles |
| Icons | lucide-react-native |
| Navigation | Custom tab state (no router library) |

## Features
- [x] Email/password auth with persistent display name
- [x] Live location detection + reverse geocoding (city/region display)
- [x] Issue reporting with camera photo + automatic geotagging
- [x] "Report on behalf of" — submit on behalf of someone without a smartphone
- [x] Community feed sorted by recency, filterable by radius (1/3/5/10 km)
- [x] Real-time distance calculation (Haversine formula)
- [x] Map view with colour-coded, category-based issue pins
- [x] Upvote toggle (one vote per user, tracked via Firestore array)
- [x] Full Issue Detail screen with larger photo and "Get Directions"
- [x] Owner-only delete on issue reports
- [x] Local events board
- [x] Service provider directory with category filters + tap-to-call
- [x] Issue status flow: Open → Under Review → In Progress → Resolved
- [x] Role-based Authority Admin Dashboard (hidden from regular users)

## Setup
```bash
git clone https://github.com/rammanoshankarpoffic-coder/localpulse.git
cd localpulse
npm install
# Add your own firebaseConfig.js in the project root (see firebaseConfig.example.js)
npx expo start
```

To build a standalone Android APK:
```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

## Known Limitations
- Radius filter is client-side (sufficient at demo scale; would move to a
  geo-indexed query for production scale)
- Push notifications not implemented (time constraint)
- Map uses OpenStreetMap tiles via WebView instead of native Google Maps,
  to avoid requiring a billing-enabled Google Cloud account for the API key
- Firestore security rules are in open/test mode for the demo period

## Solo Developer
Built entirely solo for DevFusion 3.0, IIT Bombay.
