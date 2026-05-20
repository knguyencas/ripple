import api from '../core/api';
import {
  isApiBackendAvailable,
  isApiConnectivityError,
} from '../core/api-connectivity';

export interface EncouragementPayload {
  mood: string;
  water: string;
  steps: string;
  sleep: string;
}

export async function fetchEncouragement(): Promise<EncouragementPayload | null> {
  try {
    if (!(await isApiBackendAvailable())) return null;
    const res = await api.get('/encouragement');
    const d = res.data ?? {};
    return {
      mood: String(d.mood ?? ''),
      water: String(d.water ?? ''),
      steps: String(d.steps ?? ''),
      sleep: String(d.sleep ?? ''),
    };
  } catch (e) {
    if (!isApiConnectivityError(e)) {
      console.warn('fetchEncouragement failed:', e);
    }
    return null;
  }
}
