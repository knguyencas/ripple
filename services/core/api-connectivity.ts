import { Platform } from 'react-native';

const RAW_API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

function resolveApiBaseUrl(url: string): string {
  if (Platform.OS !== 'android') return url;

  return url
    .replace('://localhost:', '://10.0.2.2:')
    .replace('://127.0.0.1:', '://10.0.2.2:');
}

export const API_BASE_URL = resolveApiBaseUrl(RAW_API_BASE_URL);

const ONLINE_CACHE_MS = 8_000;
const OFFLINE_CACHE_MS = 5_000;
const PROBE_TIMEOUT_MS = 1_500;

type ApiAvailability = {
  available: boolean;
  checkedAt: number;
};

let availability: ApiAvailability = { available: true, checkedAt: 0 };
let probePromise: Promise<boolean> | null = null;

export function isApiUnavailableError(error: unknown): boolean {
  return Boolean((error as { isApiUnavailable?: boolean } | null)?.isApiUnavailable);
}

export function isApiConnectivityError(error: unknown): boolean {
  const err = error as {
    code?: string;
    message?: string;
    response?: unknown;
    isApiUnavailable?: boolean;
  } | null;

  return Boolean(
    err?.isApiUnavailable ||
    (!err?.response &&
      (err?.code === 'ERR_NETWORK' ||
        err?.code === 'ECONNABORTED' ||
        err?.message === 'Network Error' ||
        err?.message === 'API backend unavailable'))
  );
}

export function markApiBackendUnavailable() {
  availability = { available: false, checkedAt: Date.now() };
}

export function isApiMarkedUnavailable(): boolean {
  return (
    availability.checkedAt > 0 &&
    !availability.available &&
    Date.now() - availability.checkedAt < OFFLINE_CACHE_MS
  );
}

export function createApiUnavailableError(): Error {
  const error = new Error('API backend unavailable') as Error & { isApiUnavailable?: boolean };
  error.isApiUnavailable = true;
  return error;
}

async function probeApiBackend(): Promise<boolean> {
  if (!API_BASE_URL) {
    markApiBackendUnavailable();
    return false;
  }

  let timeout: ReturnType<typeof setTimeout> | null = null;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;

  if (controller) {
    timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  }

  try {
    const init: RequestInit = { method: 'GET' };
    if (controller) init.signal = controller.signal;
    await fetch(API_BASE_URL, init);
    availability = { available: true, checkedAt: Date.now() };
    return true;
  } catch {
    markApiBackendUnavailable();
    return false;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function isApiBackendAvailable(): Promise<boolean> {
  const now = Date.now();
  const ttl = availability.available ? ONLINE_CACHE_MS : OFFLINE_CACHE_MS;

  if (availability.checkedAt > 0 && now - availability.checkedAt < ttl) {
    return availability.available;
  }

  if (!probePromise) {
    probePromise = probeApiBackend().finally(() => {
      probePromise = null;
    });
  }

  return probePromise;
}
