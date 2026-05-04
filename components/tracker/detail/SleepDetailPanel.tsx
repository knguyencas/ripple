import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { activityPanelStyles as s } from '../../../styles/tracker/activity-detail.styles';
import {
  DEFAULT_TRACKER_PERIOD,
  type TrackerPeriod,
  periodDays,
} from '../../../constants/tracker/period.constants';
import { fetchSleepHistory, type HistorySummary } from '../../../services/tracker/history.service';
import PeriodSelector from './PeriodSelector';
import {
  fetchHealthToday,
  requestSleepPermissionAndSync,
} from '../../../services/tracker/health.service';
import { getHealthSyncStatus, type HealthSyncStatus } from '../../../services/tracker/health-sync-preference.service';

const SLEEP_PURPLE = '#6B5AAA';
const SLEEP_BG = '#E0D8F0';

interface Props {
  active: boolean;
}

function formatHours(min: number): string {
  const h = min / 60;
  return h.toFixed(1);
}

export default function SleepDetailPanel({ active }: Props) {
  const [period, setPeriod] = useState<TrackerPeriod>(DEFAULT_TRACKER_PERIOD);
  const [data, setData] = useState<HistorySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<HealthSyncStatus>('unknown');
  const [todayMin, setTodayMin] = useState<number | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchSleepHistory(periodDays(period)),
      getHealthSyncStatus('sleep'),
      fetchHealthToday(),
    ]).then(([res, status, today]) => {
      if (!cancelled) {
        setData(res);
        setSyncStatus(status);
        const total = today?.sleep?.totalMinutes ?? 0;
        setTodayMin(total > 0 ? total : null);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [active, period]);

  const handlePermissionSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const synced = await requestSleepPermissionAndSync();
      if (synced) {
        setSyncStatus('enabled');
        setTodayMin(synced.durationMin);
        fetchSleepHistory(periodDays(period)).then(setData);
      } else {
        const status = await getHealthSyncStatus('sleep');
        setSyncStatus(status);
      }
    } finally {
      setSyncing(false);
    }
  };

  const avgMin = data?.average ?? 0;
  const avgH = formatHours(avgMin);
  const needsSleepSetup = syncStatus !== 'enabled' || todayMin == null;

  return (
    <>
      {needsSleepSetup && (
        <View style={s.permissionBlock}>
          <Text style={s.permissionTitle}>
            {syncStatus === 'enabled'
              ? 'Sora chưa thấy dữ liệu giấc ngủ đêm qua.'
              : 'Sora chưa được cấp quyền xem giấc ngủ của bạn :('}
          </Text>
          <Text style={s.permissionText}>
            Track giấc ngủ chỉ hiển thị dữ liệu trung bình. Nếu cần nhập thủ công,
            hãy nhập trong task hôm nay.
          </Text>
          <View style={s.permissionActions}>
            <TouchableOpacity
              style={s.permissionPrimary}
              onPress={handlePermissionSync}
              disabled={syncing}
              accessibilityLabel="Cấp quyền xem giấc ngủ"
            >
              {syncing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text
                  style={s.permissionPrimaryText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                >
                  Cấp quyền
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <PeriodSelector value={period} onChange={setPeriod} />

      <View style={s.visualRow}>
        <View style={s.visualIconWrap}>
          {loading ? (
            <ActivityIndicator color={SLEEP_PURPLE} />
          ) : (
            <Svg width={110} height={110} viewBox="0 0 120 120">
              <Circle cx={60} cy={60} r={54} fill={SLEEP_BG} />
              <G transform="translate(18, 38)">
                <Path
                  d="M 6 38 Q 6 28 18 26 L 56 22 Q 68 21 76 28 L 80 32 Q 84 36 84 42 L 84 46 L 6 46 Z"
                  fill="#FFFFFF"
                  stroke={SLEEP_PURPLE}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <Circle cx={64} cy={20} r={10} fill="#FFFFFF" stroke={SLEEP_PURPLE} strokeWidth={2} />
                <Path
                  d="M 60 18 Q 64 16 68 19"
                  stroke={SLEEP_PURPLE}
                  strokeWidth={1.6}
                  fill="none"
                  strokeLinecap="round"
                />
                <Path
                  d="M 6 46 L 84 46"
                  stroke={SLEEP_PURPLE}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </G>
              <G transform="translate(78, 24)">
                <Path d="M 0 0 L 8 0 L 0 8 L 8 8" stroke={SLEEP_PURPLE} strokeWidth={1.4} fill="none" />
                <Path d="M 12 12 L 18 12 L 12 18 L 18 18" stroke={SLEEP_PURPLE} strokeWidth={1.2} fill="none" />
              </G>
            </Svg>
          )}
        </View>

        <View style={s.visualText}>
          <Text style={s.metricBig}>{avgH}</Text>
          <Text style={s.metricUnit}>giờ ngủ trung bình / đêm</Text>
          <Text style={s.metricCaption}>
            Mục tiêu 8 giờ · {data?.daysWithData ?? 0}/{data?.totalDays ?? 0} đêm có dữ liệu
          </Text>
        </View>
      </View>

    </>
  );
}
