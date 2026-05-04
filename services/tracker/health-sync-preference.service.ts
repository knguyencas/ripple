import AsyncStorage from '@react-native-async-storage/async-storage';

export type HealthMetric = 'steps' | 'sleep';
export type HealthSyncStatus = 'unknown' | 'enabled' | 'disabled';

const KEY_PREFIX = '@ripple_health_sync_';

export async function getHealthSyncStatus(metric: HealthMetric): Promise<HealthSyncStatus> {
  try {
    const value = await AsyncStorage.getItem(KEY_PREFIX + metric);
    if (value === 'enabled' || value === 'disabled') return value;
  } catch {}
  return 'unknown';
}

export async function setHealthSyncStatus(
  metric: HealthMetric,
  status: HealthSyncStatus
): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_PREFIX + metric, status);
  } catch {}
}
