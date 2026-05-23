import { Platform } from 'react-native';
import api from '../core/api';
import { isApiBackendAvailable } from '../core/api-connectivity';
import { toDateKey } from '../../utils/shared/date.utils';
import { setHealthSyncStatus } from './health-sync-preference.service';

export interface StepsToday {
  steps: number;
  date: string;
}

export interface SleepToday {
  durationMin: number;
  bedtime: string;
  wakeTime: string;
  date: string;
}

const todayKey = () => toDateKey(new Date());

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

let healthKitStepsReady = false;
let healthKitSleepReady = false;
let healthConnectStepsReady = false;
let healthConnectSleepReady = false;

async function ensureIosStepsPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  if (healthKitStepsReady) return true;
  try {
    const AppleHealthKit = require('react-native-health').default;
    const permissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.Steps,
        ],
        write: [],
      },
    };
    await new Promise<void>((resolve, reject) => {
      AppleHealthKit.initHealthKit(permissions, (err: string | null) => {
        if (err) reject(new Error(err));
        else resolve();
      });
    });
    healthKitStepsReady = true;
    return true;
  } catch (e) {
    console.warn('HealthKit steps init failed:', e);
    return false;
  }
}

async function ensureIosSleepPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  if (healthKitSleepReady) return true;
  try {
    const AppleHealthKit = require('react-native-health').default;
    const permissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.SleepAnalysis,
        ],
        write: [],
      },
    };
    await new Promise<void>((resolve, reject) => {
      AppleHealthKit.initHealthKit(permissions, (err: string | null) => {
        if (err) reject(new Error(err));
        else resolve();
      });
    });
    healthKitSleepReady = true;
    return true;
  } catch (e) {
    console.warn('HealthKit sleep init failed:', e);
    return false;
  }
}

async function initAndroidHC(): Promise<{ HC: any } | null> {
  if (Platform.OS !== 'android') return null;
  try {
    const HC = require('react-native-health-connect');
    const available = await HC.getSdkStatus();
    if (available !== HC.SdkAvailabilityStatus.SDK_AVAILABLE) return null;
    const init = await HC.initialize();
    if (!init) return null;
    return { HC };
  } catch {
    return null;
  }
}

// Kiểm tra quyền đã cấp (không show dialog) — an toàn gọi lúc app mount
async function checkAndroidStepsPermission(): Promise<boolean> {
  if (healthConnectStepsReady) return true;
  const ctx = await initAndroidHC();
  if (!ctx) return false;
  try {
    const already = await ctx.HC.getGrantedPermissions();
    healthConnectStepsReady = already?.some((p: any) => p.recordType === 'Steps') ?? false;
    return healthConnectStepsReady;
  } catch {
    return false;
  }
}

async function checkAndroidSleepPermission(): Promise<boolean> {
  if (healthConnectSleepReady) return true;
  const ctx = await initAndroidHC();
  if (!ctx) return false;
  try {
    const already = await ctx.HC.getGrantedPermissions();
    healthConnectSleepReady = already?.some((p: any) => p.recordType === 'SleepSession') ?? false;
    return healthConnectSleepReady;
  } catch {
    return false;
  }
}

// Xin quyền (show dialog) — chỉ gọi từ user action, không gọi lúc mount
async function requestAndroidStepsPermission(): Promise<boolean> {
  const ctx = await initAndroidHC();
  if (!ctx) return false;
  try {
    const granted = await ctx.HC.requestPermission([
      { accessType: 'read', recordType: 'Steps' },
    ]);
    healthConnectStepsReady = granted?.some((item: any) => item.recordType === 'Steps') ?? false;
    return healthConnectStepsReady;
  } catch (e) {
    console.warn('Health Connect steps requestPermission failed:', e);
    return false;
  }
}

async function requestAndroidSleepPermission(): Promise<boolean> {
  const ctx = await initAndroidHC();
  if (!ctx) return false;
  try {
    const granted = await ctx.HC.requestPermission([
      { accessType: 'read', recordType: 'SleepSession' },
    ]);
    healthConnectSleepReady = granted?.some((item: any) => item.recordType === 'SleepSession') ?? false;
    return healthConnectSleepReady;
  } catch (e) {
    console.warn('Health Connect sleep requestPermission failed:', e);
    return false;
  }
}

async function ensureAndroidStepsPermission(): Promise<boolean> {
  // Kiểm tra trước, chỉ xin nếu chưa có — tránh crash lateinit khi gọi lúc mount
  const already = await checkAndroidStepsPermission();
  if (already) return true;
  return requestAndroidStepsPermission();
}

async function ensureAndroidSleepPermission(): Promise<boolean> {
  const already = await checkAndroidSleepPermission();
  if (already) return true;
  return requestAndroidSleepPermission();
}

// Chỉ kiểm tra quyền đã cấp chưa, không show dialog — dùng khi auto-check lúc mount
export async function checkStepsPermission(): Promise<boolean> {
  if (Platform.OS === 'android') return checkAndroidStepsPermission();
  return ensureStepsPermission(); // iOS: initHealthKit luôn safe
}

export async function checkSleepPermission(): Promise<boolean> {
  if (Platform.OS === 'android') return checkAndroidSleepPermission();
  return ensureSleepPermission();
}

export async function ensureStepsPermission(): Promise<boolean> {
  const ok = Platform.OS === 'ios'
    ? await ensureIosStepsPermission()
    : Platform.OS === 'android'
      ? await ensureAndroidStepsPermission()
      : false;
  await setHealthSyncStatus('steps', ok ? 'enabled' : 'disabled');
  return ok;
}

export async function ensureSleepPermission(): Promise<boolean> {
  const ok = Platform.OS === 'ios'
    ? await ensureIosSleepPermission()
    : Platform.OS === 'android'
      ? await ensureAndroidSleepPermission()
      : false;
  await setHealthSyncStatus('sleep', ok ? 'enabled' : 'disabled');
  return ok;
}

export async function requestSleepPermissionAndSync(): Promise<SleepToday | null> {
  const ok = await ensureSleepPermission();
  if (!ok) return null;
  return syncSleepToBackend();
}

export async function requestStepsPermissionAndSync(): Promise<StepsToday | null> {
  const ok = await ensureStepsPermission();
  if (!ok) return null;
  return syncStepsToBackend();
}

export async function syncManualSleepToBackend(data: {
  bedtime: string;
  wakeTime: string;
  durationMin: number;
}): Promise<SleepToday | null> {
  const localDate = todayKey();
  try {
    await api.post('/health/sleep', {
      bedtime: data.bedtime,
      wakeTime: data.wakeTime,
      duration: data.durationMin,
      source: 'manual',
    });
    return { ...data, date: localDate };
  } catch {
    try {
      await api.post('/health/sleep', {
        bedtime: data.bedtime,
        wakeTime: data.wakeTime,
        duration: data.durationMin,
      });
      return { ...data, date: localDate };
    } catch {
      return null;
    }
  }
}

export function buildManualSleepSession(
  bedHour: number,
  bedMinute: number,
  wakeHour: number,
  wakeMinute: number
): { bedtime: string; wakeTime: string; durationMin: number } {
  const now = new Date();
  const wake = new Date(now);
  wake.setHours(wakeHour, wakeMinute, 0, 0);
  if (wake.getTime() > now.getTime()) {
    wake.setDate(wake.getDate() - 1);
  }

  const bed = new Date(wake);
  bed.setHours(bedHour, bedMinute, 0, 0);
  if (bed.getTime() >= wake.getTime()) {
    bed.setDate(bed.getDate() - 1);
  }

  const durationMin = Math.max(0, Math.round((wake.getTime() - bed.getTime()) / 60000));
  return {
    bedtime: bed.toISOString(),
    wakeTime: wake.toISOString(),
    durationMin,
  };
}

export function canReadStepsFromHealth(): boolean {
  return healthKitStepsReady || healthConnectStepsReady;
}

export function canReadSleepFromHealth(): boolean {
  return healthKitSleepReady || healthConnectSleepReady;
}

async function readStepsToday(): Promise<number | null> {
  if (Platform.OS === 'ios') {
    try {
      const AppleHealthKit = require('react-native-health').default;
      return await new Promise<number | null>((resolve) => {
        AppleHealthKit.getStepCount(
          { date: new Date().toISOString() },
          (err: string | null, res: { value: number } | null) => {
            if (err) resolve(null);
            else resolve(Math.round(res?.value ?? 0));
          }
        );
      });
    } catch {
      return null;
    }
  }
  if (Platform.OS === 'android') {
    if (!healthConnectStepsReady) return null;
    try {
      const HC = require('react-native-health-connect');
      const start = startOfDay(new Date()).toISOString();
      const end = new Date().toISOString();
      const res = await HC.readRecords('Steps', {
        timeRangeFilter: { operator: 'between', startTime: start, endTime: end },
      });
      const total = (res.records ?? []).reduce((acc: number, r: any) => acc + (r.count ?? 0), 0);
      return Math.round(total);
    } catch {
      return null;
    }
  }
  return null;
}

async function readSleepLastNight(): Promise<{ bedtime: string; wakeTime: string; durationMin: number } | null> {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 1);
  start.setHours(18, 0, 0, 0);

  if (Platform.OS === 'ios') {
    try {
      const AppleHealthKit = require('react-native-health').default;
      const samples: Array<{ startDate: string; endDate: string; value: string }> = await new Promise((resolve) => {
        AppleHealthKit.getSleepSamples(
          { startDate: start.toISOString(), endDate: end.toISOString(), limit: 100 },
          (err: string | null, res: any[]) => resolve(err ? [] : res ?? [])
        );
      });
      const asleep = samples.filter(
        (s) => s.value === 'ASLEEP' || s.value === 'CORE' || s.value === 'DEEP' || s.value === 'REM'
      );
      if (asleep.length === 0) return null;
      const bedtime = asleep.reduce((min, s) => (s.startDate < min ? s.startDate : min), asleep[0].startDate);
      const wakeTime = asleep.reduce((max, s) => (s.endDate > max ? s.endDate : max), asleep[0].endDate);
      const durationMin = asleep.reduce(
        (acc, s) => acc + (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / 60000,
        0
      );
      return { bedtime, wakeTime, durationMin: Math.round(durationMin) };
    } catch {
      return null;
    }
  }
  if (Platform.OS === 'android') {
    if (!healthConnectSleepReady) return null;
    try {
      const HC = require('react-native-health-connect');
      const res = await HC.readRecords('SleepSession', {
        timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: end.toISOString() },
      });
      const records: any[] = res.records ?? [];
      if (records.length === 0) return null;
      const latest = records.sort((a, b) => (a.endTime < b.endTime ? 1 : -1))[0];
      const bedtime = latest.startTime;
      const wakeTime = latest.endTime;
      const durationMin = Math.round(
        (new Date(wakeTime).getTime() - new Date(bedtime).getTime()) / 60000
      );
      return { bedtime, wakeTime, durationMin };
    } catch {
      return null;
    }
  }
  return null;
}

export async function syncStepsToBackend(): Promise<StepsToday | null> {
  const ok = await ensureStepsPermission();
  if (!ok) return null;
  const steps = await readStepsToday();
  if (steps == null) return null;
  const localDate = todayKey();
  try {
    await api.post('/health/steps', { date: localDate, steps });
    return { steps, date: localDate };
  } catch {
    return { steps, date: localDate };
  }
}

export async function syncSleepToBackend(): Promise<SleepToday | null> {
  const ok = await ensureSleepPermission();
  if (!ok) return null;
  const data = await readSleepLastNight();
  if (!data) return null;
  const localDate = todayKey();
  try {
    await api.post('/health/sleep', {
      bedtime: data.bedtime,
      wakeTime: data.wakeTime,
      duration: data.durationMin,
    });
    return { ...data, date: localDate };
  } catch {
    return { ...data, date: localDate };
  }
}

export async function fetchHealthSummary(days = 7) {
  try {
    if (!(await isApiBackendAvailable())) return null;
    const res = await api.get('/health/summary', { params: { days } });
    return res.data as {
      days: number;
      dailyData: Array<{ date: string; steps: number | null; sleepMinutes: number | null; sleepSessions: number }>;
      averages: { steps: number | null; sleepMinutes: number | null };
    };
  } catch {
    return null;
  }
}

export async function fetchHealthToday() {
  try {
    if (!(await isApiBackendAvailable())) return null;
    const res = await api.get('/health/today');
    return res.data as {
      date: string;
      steps: number | null;
      sleep: { sessions: any[]; totalMinutes: number };
    };
  } catch {
    return null;
  }
}

export function isHealthAvailable(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}
