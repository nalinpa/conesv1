# 🌋 Cones

**Cones** is an Expo + React Native app that lets users explore and complete Auckland’s volcanic cones in the real world.  
Completion is verified using **GPS proximity** (with accuracy gating), and progress is tracked with **badges, stats, and reviews**.

The app is designed to be **battery-friendly, deterministic, and transparent** about how location is used.

---

## ✨ Core Features

- 📍 **GPS-verified cone completion**
  - Foreground-only location
  - Accuracy gating (no fake completions)
  - Multi-checkpoint support per cone

- 🗺 **Interactive map**
  - Shows all cones
  - Completed vs unclimbed cones rendered distinctly
  - Nearest unclimbed cone highlighted

- 📊 **Progress tracking**
  - Completion ring
  - Remaining vs completed stats
  - Share bonus count
  - Nearest unclimbed suggestions

- 🏅 **Badge system**
  - Core milestones (first cone, 5 cones, all cones)
  - Type-based (cone vs crater)
  - Region-based (North / Central / South / Harbour)
  - Social (share bonuses)

- ⭐ **Public reviews**
  - One review per cone per user
  - Rating + optional text
  - Live aggregation

---

## 🧱 Tech Stack

- **Framework:** Expo (React Native)
- **Navigation:** Expo Router
- **UI:** UI Kitten (Eva Design System)
- **State:** React hooks + Firestore listeners
- **Auth:** Firebase Auth
- **Database:** Firebase Firestore
- **Maps:** react-native-maps
- **Location:** expo-location
- **Language:** TypeScript (strict)

---

## 📁 Project Structure

app/
(tabs)/
cones/ # cone list + detail + reviews
progress/ # progress dashboard + badges
map.tsx # map screen
login.tsx # auth screen

components/
cone/ # cone UI (hero, status, completion, reviews)
progress/ # progress UI (charts, cards)
badges/ # badge UI
map/ # map + overlays
ui/ # shared primitives (CardShell, Pill, LoadingState)

lib/
hooks/ # data + location hooks
services/ # Firestore access + caching
mappers/ # Firestore → domain models
badges.ts # badge definitions + pure logic
checkpoints.ts # GPS + distance logic
routes.ts # centralised navigation helpers


---

## 📍 Location & GPS Philosophy

Location is the **core gameplay mechanic**, so its behaviour is explicit and conservative.

### Decisions

- ✅ Foreground location only
- ❌ No background location tracking (v1)
- ✅ Manual GPS refresh for accuracy-critical actions
- ✅ Accuracy gating (default ≤ 50m)
- ✅ Deterministic nearest-checkpoint logic

### Completion rules

A cone can only be completed when:

1. Location permission is granted
2. A GPS fix is available
3. Accuracy is acceptable
4. The user is within range of the nearest checkpoint
5. The user explicitly taps **Complete cone**

There are **no automatic completions** and **no background tracking**.

---

## 🏅 Badge System

Badges are **pure, deterministic, and data-driven**.

- Definitions live in `lib/badges.ts`
- Progress is computed by a pure function: `getBadgeState`
- Inputs:
  - Active cones
  - Completed cone IDs
  - Share bonus count
  - Completion timestamps
- Outputs:
  - Earned badge IDs
  - Progress labels
  - Next badge to earn
  - Recently unlocked badges

This makes the system easy to test, extend, and reason about.

---

## 🔥 Firestore Data Model

### Collections

- `cones`
- `coneCompletions`
- `coneReviews`

### Completion document IDs

{userId}_{coneId}


Guarantees:
- One completion per user per cone
- Simple lookups
- No duplicates

### Review document IDs

{userId}_{coneId}


Guarantees:
- One public review per user per cone

---

## 🧠 Caching Strategy

- Cone lists and individual cones are cached in memory
- Cache can be force-refreshed when needed
- Firestore listeners are used for:
  - Completions
  - Reviews
  - Badge progress

This keeps the app fast and battery-friendly.

---

## ▶️ Running the App

Install dependencies:

```bash
npm install
Start the dev server:

npm start
Platform-specific:

npm run ios
npm run android
npm run web
🔐 Environment Variables
Firebase config is provided via Expo config:

extra: {
  firebase: {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId
  }
}
Use .env files:

EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
🧪 Code Quality
TypeScript strict mode

ESLint + Prettier enforced

No implicit any

Hooks are single-purpose and composable

Deterministic, side-effect-aware logic

🚧 Roadmap (high level)
Improved GPS permission UX and copy

Map checkpoint highlighting

Badge detail views

Social sharing polish

Offline read-only mode

Accessibility improvements

📄 License
Private / internal project (update as needed).

🙌 Philosophy
This app prioritises:

User trust over cleverness

Explicit state over magic

Deterministic logic over heuristics

Battery life over background tracking

If the app says you completed a cone, it means it.
🌋