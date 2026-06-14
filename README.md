# Ripple — Mental Wellness AI Companion (Mobile App)

A mental wellness mobile app for Vietnamese users, combining an emotion journal with an AI companion chatbot named **Sora**. Built with React Native + Expo.

## Features

- **AI Chat (Sora)** — Conversational AI powered by Groq (Llama 3.3 70B), tone auto-adjusts based on PHQ-9 band
- **Emotion Journal** — Daily mood log with note, photo, and audio; NLP analysis runs async
- **E2E Media Encryption** — Photos and audio encrypted client-side with AES-256-GCM + PBKDF2 (600K iterations); server cannot decrypt
- **Habit Tracker** — Water, steps, sleep, meditation integrated with HealthKit (iOS) and Health Connect (Android)
- **Wellness Insights** — PHQ-9 score, DSM-5 criteria, severity level, mood chart, wellness report
- **Forgot Password OTP** — 6-digit code sent to email, no deep link required

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React Native 0.81 + Expo SDK 54 |
| Routing | expo-router 6 (file-based) |
| State | Zustand 5 |
| Networking | Axios + JWT interceptor |
| Storage | AsyncStorage (cache 7d) + expo-secure-store (PIN envelope) |
| Crypto | react-native-quick-crypto (AES-GCM + PBKDF2) |
| Health | react-native-health (iOS) + react-native-health-connect (Android) |
| Build | EAS Build |

## Project Structure

```
app/
├── auth/           # login, register, forgot-password, setup-pin, unlock-pin
└── tabs/
    ├── journal/    # journal list + entry detail
    ├── chat/       # Sora AI chat
    ├── tracker/    # water, steps, sleep, meditation
    └── profile/    # user profile + settings
components/         # shared UI components
services/
├── core/           # api, cache
├── journal/        # media-crypto, photo, audio
└── health/         # step/sleep sync
stores/             # auth, pin, todayJournal
styles/             # per-screen stylesheets
```

## Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`

### Install

```bash
git clone https://github.com/knguyencas/ripple.git
cd ripple
npm install
```

### Environment

Create `.env` in the project root:

```env
EXPO_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

### Run (Development)

```bash
# Start Metro bundler
npx expo start

# Run on iOS (Mac required)
npx expo run:ios --device

# Run on Android
npx expo run:android
```

### Build APK (EAS)

```bash
eas build -p android --profile preview
```

## Related Repos

- **Backend**: [ripple_be](https://github.com/knguyencas/ripple_be) — Node.js + Express + Prisma + Postgres
- **NLP Service**: [ripple-nlp](https://huggingface.co/spaces/knguyencas/ripple-nlp) — FastAPI + XLM-RoBERTa (HuggingFace Spaces)
