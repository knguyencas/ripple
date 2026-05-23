import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/colors';
import { sleepTrackerStyles as s } from '../../styles/tracker/tracker.styles';
import {
  syncSleepToBackend,
  fetchHealthSummary,
  fetchHealthToday,
  isHealthAvailable,
  ensureSleepPermission,
} from '../../services/tracker/health.service';
import { EncouragementHint } from './MoodEncouragement';
import type { SeverityBand } from '../../services/tracker/encouragement.service';
import { getHealthSyncStatus, type HealthSyncStatus } from '../../services/tracker/health-sync-preference.service';
import SleepManualModal from './SleepManualModal';

const GOAL_MIN = 8 * 60;

interface Props {
  hint?: string | null;
  band?: SeverityBand;
}

function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h}h ${m}m`;
}

function formatClock(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function SleepTracker({ hint, band }: Props = {}) {
  const [durationMin, setDurationMin] = useState<number | null>(null);
  const [bedtime, setBedtime] = useState<string | null>(null);
  const [wakeTime, setWakeTime] = useState<string | null>(null);
  const [avgMin, setAvgMin] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<HealthSyncStatus>('unknown');
  const [manualVisible, setManualVisible] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, summaryRes, status] = await Promise.all([
        fetchHealthToday(),
        fetchHealthSummary(7),
        getHealthSyncStatus('sleep'),
      ]);
      const total = todayRes?.sleep?.totalMinutes ?? 0;
      const session = todayRes?.sleep?.sessions?.[0];
      setDurationMin(total > 0 ? total : null);
      setBedtime(session?.bedtime ?? null);
      setWakeTime(session?.wakeTime ?? null);
      setAvgMin(summaryRes?.averages?.sleepMinutes ?? null);
      setSyncStatus(status);
      return status;
    } finally {
      setLoading(false);
    }
  }, []);

  const sync = useCallback(async () => {
    if (!isHealthAvailable()) return;
    setSyncing(true);
    const granted = await ensureSleepPermission();
    if (!granted) {
      setPermissionDenied(true);
      setSyncing(false);
      return;
    }
    setPermissionDenied(false);
    const res = await syncSleepToBackend();
    if (res) {
      setDurationMin(res.durationMin);
      setBedtime(res.bedtime);
      setWakeTime(res.wakeTime);
      await load();
    }
    setSyncing(false);
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const status = await load();
        if (status === 'enabled' && isHealthAvailable()) await sync();
      })();
    }, [load, sync])
  );

  const goalPct = durationMin != null ? Math.min(1, durationMin / GOAL_MIN) : 0;

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <View>
          <Text style={s.title}>Giấc ngủ</Text>
          <Text style={s.subtitle}>Mục tiêu 8 giờ/đêm</Text>
        </View>
        {(loading || syncing) && <ActivityIndicator color={Colors.teal} size="small" />}
      </View>

      {!isHealthAvailable() ? (
        <Text style={s.emptyText}>
          Tính năng đọc giấc ngủ chỉ hoạt động trên iOS/Android (Apple Health hoặc Health Connect).
        </Text>
      ) : permissionDenied ? (
        <View>
          <Text style={s.emptyText}>Sora chưa được cấp quyền xem giấc ngủ của bạn :(</Text>
          <TouchableOpacity style={s.retryBtn} onPress={sync}>
            <Text style={s.retryText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
              Cấp quyền
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.retryBtn} onPress={() => setManualVisible(true)}>
            <Text style={s.retryText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
              Nhập thủ công
            </Text>
          </TouchableOpacity>
        </View>
      ) : durationMin == null ? (
        <View>
          <Text style={s.emptyText}>
            {syncStatus === 'enabled'
              ? `Chưa có dữ liệu giấc ngủ đêm qua. ${Platform.OS === 'android'
                ? 'Hãy kiểm tra Health Connect.'
                : 'Hãy kiểm tra Apple Health.'}`
              : 'Sora chưa được cấp quyền xem giấc ngủ của bạn :('}
          </Text>
          <TouchableOpacity style={s.retryBtn} onPress={sync}>
            <Text style={s.retryText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
              Cấp quyền
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.retryBtn} onPress={() => setManualVisible(true)}>
            <Text style={s.retryText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
              Nhập thủ công
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={s.mainRow}>
            <View style={s.numberWrap}>
              <Text style={s.bigNumber}>{formatDuration(durationMin)}</Text>
              {bedtime && wakeTime && (
                <Text style={s.unit}>
                  {formatClock(bedtime)} → {formatClock(wakeTime)}
                </Text>
              )}
            </View>

            <View style={s.ringWrap}>
              <View style={s.ringBg} />
              <View style={[s.ringFill, { transform: [{ rotate: `${goalPct * 360}deg` }] }]} />
              <Text style={s.ringPct}>{Math.round(goalPct * 100)}%</Text>
            </View>
          </View>

          {avgMin != null && (
            <View style={s.footerRow}>
              <Text style={s.footerText}>
                Trung bình 7 ngày: <Text style={s.footerBold}>{formatDuration(avgMin)}/đêm</Text>
              </Text>
            </View>
          )}
        </>
      )}

      <EncouragementHint message={hint ?? null} band={band} />
      <SleepManualModal
        visible={manualVisible}
        onClose={() => setManualVisible(false)}
        onSaved={(sleep) => {
          setDurationMin(sleep.durationMin);
          setBedtime(sleep.bedtime);
          setWakeTime(sleep.wakeTime);
          void load();
        }}
      />
    </View>
  );
}
