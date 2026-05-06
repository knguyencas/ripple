import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const FAIL_COUNT_KEY = 'ripple.pin.failCount';
const LOCKED_UNTIL_KEY = 'ripple.pin.lockedUntil';

interface LockState {
  failCount: number;
  lockedUntil: number; // epoch ms; 0 nếu chưa khoá
}

const storage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') return localStorage.getItem(key);
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

function lockMsForFails(failCount: number): number {
  if (failCount < 5) return 0;
  if (failCount < 8) return 1 * 60 * 1000; // 1 phút
  if (failCount < 10) return 5 * 60 * 1000; // 5 phút
  return 15 * 60 * 1000; // 15 phút
}

export async function getPinLockState(): Promise<LockState> {
  const fc = await storage.get(FAIL_COUNT_KEY);
  const lu = await storage.get(LOCKED_UNTIL_KEY);
  return {
    failCount: fc ? parseInt(fc, 10) || 0 : 0,
    lockedUntil: lu ? parseInt(lu, 10) || 0 : 0,
  };
}

export async function isPinLocked(): Promise<{ locked: boolean; remainingMs: number }> {
  const state = await getPinLockState();
  const now = Date.now();
  if (state.lockedUntil > now) {
    return { locked: true, remainingMs: state.lockedUntil - now };
  }
  return { locked: false, remainingMs: 0 };
}

export async function recordPinFail(): Promise<{ failCount: number; lockedMs: number }> {
  const state = await getPinLockState();
  const newFailCount = state.failCount + 1;
  const lockMs = lockMsForFails(newFailCount);
  const lockedUntil = lockMs > 0 ? Date.now() + lockMs : 0;
  await storage.set(FAIL_COUNT_KEY, String(newFailCount));
  await storage.set(LOCKED_UNTIL_KEY, String(lockedUntil));
  return { failCount: newFailCount, lockedMs: lockMs };
}

export async function resetPinFailState() {
  await storage.delete(FAIL_COUNT_KEY);
  await storage.delete(LOCKED_UNTIL_KEY);
}

export function formatRemainingTime(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  if (totalSec < 60) return `${totalSec} giây`;
  const min = Math.ceil(totalSec / 60);
  return `${min} phút`;
}
