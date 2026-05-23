import api from '../core/api';
import {
  isApiBackendAvailable,
  isApiConnectivityError,
} from '../core/api-connectivity';

export type SeverityBand =
  | 'minimal'
  | 'mild'
  | 'moderate'
  | 'mod_severe'
  | 'severe'
  | 'unknown';

export type WellnessLevel = 'low' | 'moderate' | 'high';
export type WellnessTrend = 'improving' | 'stable' | 'declining' | 'insufficient';

export interface EncouragementDebug {
  band: SeverityBand;
  trend: WellnessTrend;
  avgPhq7: number | null;
  lifetimePhq: number;
  combinedLevel: WellnessLevel;
  hasRecentIdeation: boolean;
}

export interface EncouragementPayload {
  mood: string;
  water: string;
  steps: string;
  sleep: string;
  debug?: EncouragementDebug;
}

function normalizeBand(value: unknown): SeverityBand {
  const s = String(value ?? 'unknown');
  if (
    s === 'minimal' ||
    s === 'mild' ||
    s === 'moderate' ||
    s === 'mod_severe' ||
    s === 'severe'
  ) {
    return s;
  }
  return 'unknown';
}

export async function fetchEncouragement(): Promise<EncouragementPayload | null> {
  try {
    if (!(await isApiBackendAvailable())) return null;
    const res = await api.get('/encouragement');
    const d = res.data ?? {};
    const dbg = d._debug ?? null;
    return {
      mood: String(d.mood ?? ''),
      water: String(d.water ?? ''),
      steps: String(d.steps ?? ''),
      sleep: String(d.sleep ?? ''),
      debug: dbg
        ? {
            band: normalizeBand(dbg.band),
            trend: (dbg.trend ?? 'insufficient') as WellnessTrend,
            avgPhq7: dbg.avgPhq7 ?? null,
            lifetimePhq: Number(dbg.lifetimePhq ?? 0),
            combinedLevel: (dbg.combinedLevel ?? 'low') as WellnessLevel,
            hasRecentIdeation: Boolean(dbg.hasRecentIdeation),
          }
        : undefined,
    };
  } catch (e) {
    if (!isApiConnectivityError(e)) {
      console.warn('fetchEncouragement failed:', e);
    }
    return null;
  }
}
