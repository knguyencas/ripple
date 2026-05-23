import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/colors';
import { stepsTrackerStyles as s } from '../../styles/tracker/tracker.styles';
import {
  syncStepsToBackend,
  fetchHealthSummary,
  fetchHealthToday,
  isHealthAvailable,
  ensureStepsPermission,
} from '../../services/tracker/health.service';
import { getHealthSyncStatus, type HealthSyncStatus } from '../../services/tracker/health-sync-preference.service';
import { EncouragementHint } from './MoodEncouragement';
import type { SeverityBand } from '../../services/tracker/encouragement.service';

const DEFAULT_GOAL = 8000;

interface Props {
  hint?: string | null;
  band?: SeverityBand;
}

export default function StepsTracker({ hint, band }: Props = {}) {
  const [steps, setSteps] = useState<number | null>(null);
  const [avgSteps, setAvgSteps] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<HealthSyncStatus>('unknown');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, summaryRes, status] = await Promise.all([
        fetchHealthToday(),
        fetchHealthSummary(7),
        getHealthSyncStatus('steps'),
      ]);
      setSteps(todayRes?.steps ?? null);
      setAvgSteps(summaryRes?.averages?.steps ?? null);
      setSyncStatus(status);
      return status;
    } finally {
      setLoading(false);
    }
  }, []);

  const sync = useCallback(async () => {
    if (!isHealthAvailable()) return;
    setSyncing(true);
    const granted = await ensureStepsPermission();
    if (!granted) {
      setPermissionDenied(true);
      setSyncing(false);
      return;
    }
    setPermissionDenied(false);
    const res = await syncStepsToBackend();
    if (res) {
      setSteps(res.steps);
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

  const goalPct = steps != null ? Math.min(1, steps / DEFAULT_GOAL) : 0;

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <View>
          <Text style={s.title}>Vận động</Text>
          <Text style={s.subtitle}>Mục tiêu {DEFAULT_GOAL.toLocaleString('vi-VN')} bước/ngày</Text>
        </View>
        {(loading || syncing) && <ActivityIndicator color={Colors.teal} size="small" />}
      </View>

      {!isHealthAvailable() ? (
        <Text style={s.emptyText}>
          Tính năng đếm bước chỉ hoạt động trên iOS/Android.
        </Text>
      ) : permissionDenied ? (
        <View>
          <Text style={s.emptyText}>
            Chưa được cấp quyền đọc dữ liệu vận động.
          </Text>
          <TouchableOpacity style={s.retryBtn} onPress={sync}>
            <Text style={s.retryText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
              Cấp quyền
            </Text>
          </TouchableOpacity>
        </View>
      ) : steps == null ? (
        <View>
          <Text style={s.emptyText}>
            {syncStatus === 'enabled'
              ? `Chưa có dữ liệu hôm nay. ${Platform.OS === 'android' ? 'Hãy kiểm tra Health Connect.' : 'Hãy kiểm tra Apple Health.'}`
              : 'Sora chưa được cấp quyền xem dữ liệu vận động của bạn.'}
          </Text>
          <TouchableOpacity style={s.retryBtn} onPress={sync}>
            <Text style={s.retryText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
              Cấp quyền
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={s.mainRow}>
            <View style={s.numberWrap}>
              <Text style={s.bigNumber}>{steps.toLocaleString('vi-VN')}</Text>
              <Text style={s.unit}>bước hôm nay</Text>
            </View>

            <View style={s.ringWrap}>
              <View style={s.ringBg} />
              <View style={[s.ringFill, { transform: [{ rotate: `${goalPct * 360}deg` }] }]} />
              <Text style={s.ringPct}>{Math.round(goalPct * 100)}%</Text>
            </View>
          </View>

          {avgSteps != null && (
            <View style={s.footerRow}>
              <Text style={s.footerText}>
                Trung bình 7 ngày: <Text style={s.footerBold}>{avgSteps.toLocaleString('vi-VN')} bước/ngày</Text>
              </Text>
            </View>
          )}
        </>
      )}

      <EncouragementHint message={hint ?? null} band={band} />
    </View>
  );
}
