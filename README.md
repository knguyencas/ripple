# Ripple - Mental Wellness AI Companion

A mental wellness mobile app for Vietnamese users, combining an emotion journal with an AI companion chatbot named Sora. Built with React Native + Expo.

## Features

- AI Chat powered by Groq, tone auto-adjusts based on PHQ-9 band
- Daily mood journal with note, photo, and audio; NLP analysis runs async
- E2E media encryption with AES-256-GCM + PBKDF2 600K iterations; server cannot decrypt
- Habit tracker for water, steps, sleep, meditation integrated with HealthKit and Health Connect
- Wellness insights including PHQ-9 score, DSM-5 criteria, severity level, mood chart
- Forgot password with 6-digit OTP sent to email

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React Native 0.81 + Expo SDK 54 |
| Routing | expo-router 6 |
| State | Zustand 5 |
| Networking | Axios + JWT interceptor |
| Storage | AsyncStorage + expo-secure-store |
| Crypto | react-native-quick-crypto |
| Health | react-native-health + react-native-health-connect |
| Build | EAS Build |

## Project Structure

```
app/
├── auth/           login, register, forgot-password, setup-pin, unlock-pin
└── tabs/
    ├── journal/    journal list + entry detail
    ├── chat/       AI chat
    ├── tracker/    water, steps, sleep, meditation
    └── profile/    user profile + settings
components/         shared UI components
services/
├── core/           api, cache
├── journal/        media-crypto, photo, audio
└── health/         step/sleep sync
stores/             auth, pin, todayJournal
styles/             per-screen stylesheets
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

### Run

```bash
npx expo start

npx expo run:ios --device

npx expo run:android
```

### Build APK

```bash
eas build -p android --profile preview
```

## Related Repos

- Backend: [ripple_be](https://github.com/knguyencas/ripple_be) - Node.js + Express + Prisma + Postgres
- NLP Service: [ripple_nlp](https://huggingface.co/spaces/knguyencas/ripple_nlp) - FastAPI + XLM-RoBERTa
