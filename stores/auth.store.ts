import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import {
  API_BASE_URL,
  isApiBackendAvailable,
} from '../services/core/api-connectivity';
import {
  clearStoredMediaKey,
  hydrateMediaKeyFromStorage,
  type MediaKeyEnvelope,
} from '../services/journal/media-crypto.service';

export interface User extends MediaKeyEnvelope {
  id: string;
  email?: string;
  username: string;
  displayName?: string | null;
  avatar?: string | null;
  ageGroup?: string | null;
}

interface AuthStore {
  token: string | null;
  user: User | null;
  streak: number;
  lastStreakDate: string | null;
  setAuth: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
  touchActivity: () => Promise<void>;
  pingStreak: () => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<void>;
}

const INACTIVITY_LIMIT_MS = 30 * 24 * 60 * 60 * 1000;

const storage = {
  async get(key: string) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async delete(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: null,
  user: null,
  streak: 0,
  lastStreakDate: null,

  setAuth: async (token, user) => {
    await storage.set('token', token);
    await storage.set('user', JSON.stringify(user));
    await storage.set('lastActivity', Date.now().toString());
    set({ token, user });
    await get().pingStreak();
  },

  logout: async () => {
    await storage.delete('token');
    await storage.delete('user');
    await storage.delete('lastActivity');
    await storage.delete('streak');
    await storage.delete('lastStreakDate');
    await clearStoredMediaKey();
    set({ token: null, user: null, streak: 0, lastStreakDate: null });
  },

  loadToken: async () => {
    const token = await storage.get('token');
    const userStr = await storage.get('user');
    const lastActivityStr = await storage.get('lastActivity');

    if (!token || !userStr) return;

    const lastActivity = lastActivityStr ? parseInt(lastActivityStr, 10) : 0;
    const inactiveMs = Date.now() - lastActivity;

    if (!lastActivity || inactiveMs > INACTIVITY_LIMIT_MS) {
      await storage.delete('token');
      await storage.delete('user');
      await storage.delete('lastActivity');
      await storage.delete('streak');
      await storage.delete('lastStreakDate');
      await clearStoredMediaKey();
      set({ token: null, user: null, streak: 0, lastStreakDate: null });
      return;
    }

    await storage.set('lastActivity', Date.now().toString());

    const streakStr = await storage.get('streak');
    const lastStreakDate = await storage.get('lastStreakDate');
    set({
      token,
      user: JSON.parse(userStr),
      streak: streakStr ? parseInt(streakStr, 10) : 0,
      lastStreakDate: lastStreakDate ?? null,
    });

    await hydrateMediaKeyFromStorage();
    await get().pingStreak();
  },

  touchActivity: async () => {
    await storage.set('lastActivity', Date.now().toString());
  },

  updateUser: async (patch) => {
    const current = get().user;
    if (!current) return;
    const merged = { ...current, ...patch };
    await storage.set('user', JSON.stringify(merged));
    set({ user: merged });
  },

  pingStreak: async () => {
    const { token } = get();
    if (!token) return;

    const today = todayKey();

    try {
      if (!(await isApiBackendAvailable())) return;
      const res = await axios.post(
        `${API_BASE_URL}/users/streak/ping`,
        { localDate: today },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
      );
      const currentStreak = Number(res.data?.currentStreak ?? 0);
      const newDate = res.data?.lastStreakDate ?? today;
      await storage.set('streak', currentStreak.toString());
      await storage.set('lastStreakDate', newDate);
      set({ streak: currentStreak, lastStreakDate: newDate });
    } catch (e) {
    }
  },
}));
