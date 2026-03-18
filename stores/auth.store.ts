import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthStore {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  loadToken: () => Promise<void>;
}

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

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,

  setAuth: async (token, user) => {
    await storage.set('token', token);
    await storage.set('user', JSON.stringify(user));
    set({ token, user });
  },

  logout: async () => {
    await storage.delete('token');
    await storage.delete('user');
    set({ token: null, user: null });
  },

  loadToken: async () => {
    const token = await storage.get('token');
    const userStr = await storage.get('user');
    if (token && userStr) {
      set({ token, user: JSON.parse(userStr) });
    }
  },
}));