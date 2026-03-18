# HIIT App 🔥

A mobile high-intensity interval training (HIIT) app built with Expo and React Native. Designed for people with a strength training base who want to add structured cardio without friction.

---

## What does it do?

HIIT App is an interval training timer with three progressive routines. The experience is built for use during the workout itself: clear screen, haptic feedback, zero configuration.

The flow is straightforward: pick a routine, tap start, and the app guides you step by step — telling you which exercise is up, how much time is left, what's coming next, and vibrating at key moments so you don't have to look at the screen. When you finish, the session is saved automatically and you can review your history.

---

## Getting started

### Requirements

- Node.js 18 or higher
- Expo Go installed on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Steps

```bash
# 1. Clone or unzip the project
cd hiit-app

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start --clear
```

Scan the QR code with your camera (iOS) or with Expo Go (Android). The app loads in seconds.

### Simulators (optional)

```bash
npx expo start --ios      # Requires Xcode (Mac only)
npx expo start --android  # Requires Android Studio
```

---

## Technical overview

### Stack

| Technology | Version | Role |
|---|---|---|
| Expo SDK | 54 | Base framework and toolchain |
| React Native | 0.81 | Mobile runtime |
| React Navigation (Stack) | 6 | Screen navigation |
| Reanimated | 4 | Ring timer animation |
| react-native-svg | 15 | SVG ring rendering |
| expo-haptics | 15 | Haptic feedback |
| AsyncStorage | 2 | Session history persistence |
| Expo Google Fonts | — | Typography (Bebas Neue + DM Sans) |

### Architecture

The project follows a domain-based structure with clear separation of concerns:

```
hiit-app/
├── app/ 
│   ├── (tabs)  
│   └── _layout.tsx           # Tabs layout
│   └── index.tsx             # Routine list
│   └── history-screen.tsx        # Session history             
├── data/
│   └── routines.js           # Static data for the 3 routines
├── hooks/
│   └── use-workout.ts         # Timer logic (state + side effects)
├── core/
│   ├── domain
│       └── routines.ts           # Routine definition
│   ├── styles
│       └── colors.ts           # Colors definition
│       └── fonts.ts           # Fonts definition
│       └── radius.ts           # Radius definition
│       └── spacing.ts           # Spacing definition
│   └── data.ts               # Static data for the 3 routines
│   └── storage.ts           # AsyncStorage access layer
│   └── haptics.ts           #  Haptic pattern abstractions
├── components/
│   │   ├── ring-timer.js          # Animated ring with Reanimated + SVG
│   │   ├── routine-card.js        # Routine card in the list
│   │   └── step-list-item.js       # Step row with visual state
```


### Key technical decisions

**`useWorkout` as the single source of truth for the timer.** All timer logic lives in a custom hook: the interval, step sequencing, haptics, and session saving. Screens only consume state and call `togglePlay` / `reset`. This keeps the logic independently testable and makes `WorkoutScreen` purely presentational.

**Refs for mutable timer state.** The `setInterval` callback reads the current step and seconds through refs (`stepRef`, `secsRef`) rather than from React state. This avoids stale closures — a common problem in timers that rely on React state to know when to advance.

**Reanimated v4 for the ring.** The SVG ring uses `useSharedValue` + `useAnimatedProps` to animate `strokeDashoffset` directly on the UI thread, bypassing the JavaScript bridge. The result is smooth 60fps animation even while the timer is running.

**Data as configuration, not logic.** Routines are plain object arrays in `routines.js`. Adding a new routine requires no changes to any component — just append an object to the array with its steps. The hook and screens are fully agnostic to the specific routines.

**AsyncStorage capped at 50 sessions.** The history is truncated to the 50 most recent sessions on each write to prevent unbounded storage growth.

### Core types (TypeScript)

```typescript
interface RoutineStep {
  name: string;
  note: string;
  type: 'work' | 'rest' | 'prep';
  dur: number; // seconds
}

interface Routine {
  id: string;
  name: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  duration: string;       // human-readable label, e.g. "7 min"
  totalSeconds: number;
  description: string;
  color: string;          // hex, routine accent color
  exercises: number;
  steps: RoutineStep[];
}

interface Session {
  id: string;
  routineId: string;
  routineName: string;
  routineLevel: 'Principiante' | 'Intermedio' | 'Avanzado';
  completedAt: string;    // ISO 8601
  durationSeconds: number;
}
```

---

## Features

### Included routines

Three routines with a clear progression, designed to build a cardio base on top of existing strength training:

| Routine | Level | Duration | Format |
|---|---|---|---|
| **Arranque** | Beginner | 7 min | 6 exercises · 40s work / 20s rest |
| **Ignición** | Intermediate | 12 min | 8 exercises · 45s work / 15s rest |
| **Incendio** | Advanced | 20 min | Block Tabata · 20s work / 10s rest |

### Discover and choose a workout

- Routine list with a card per routine: name, level, duration, number of exercises and sets.
- Description and metadata to help decide before committing.
- Direct entry into any routine from its card.

### Full HIIT timer

- **Start / Pause / Resume** with a single button.
- **Reset** at any point without leaving the screen.
- Animated ring timer with visual progress for the current step.
- Global workout progress bar.
- Phase indicator with dynamic color: lime for work, blue for rest, orange for prep.
- Current exercise name with execution cue.
- "Up next" card showing the next step.
- Full program list with real-time state: done / active / upcoming.

### Haptic feedback

- Vibration on the last 3 seconds of each work step (countdown).
- Vibration on every phase change (work ↔ rest), with differentiated intensity.
- Success notification vibration on workout completion.

### Completion screen

- End-of-workout summary: total time, sets completed, and estimated calories.
- Option to repeat the workout from the finish screen.
- Option to return to the routine list.
- Session saved automatically on completion.

### History and statistics

- Chronological session list with routine, time, level, and date.
- Global summary: total sessions, accumulated minutes, estimated kcal.
- Breakdown by routine showing how many times each one has been completed.
- Empty state with a direct CTA to the routine list.
- Full history deletion with confirmation dialog.

---

## Adding a new routine

Open `src/data/routines.js` and add an object to the `ROUTINES` array:

```js
{
  id: 'my-routine',
  name: 'Name',
  level: 'Intermedio',
  duration: '10 min',
  totalSeconds: 600,
  description: 'Short description.',
  color: '#FF4D6D',
  exercises: 7,
  steps: [
    { name: 'Warm up',   note: '...', type: 'prep', dur: 10 },
    { name: 'Burpees',   note: '...', type: 'work', dur: 40 },
    { name: 'Rest',      note: '...', type: 'rest', dur: 20 },
    // ...
    { name: 'Cool down', note: '...', type: 'prep', dur: 30 },
  ],
}
```

No component changes needed. The routine appears automatically in the list.