import { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { activityPanelStyles as s } from '../../../styles/tracker/activity-detail.styles';
import {
  DEFAULT_TRACKER_PERIOD,
  type TrackerPeriod,
  periodDays,
} from '../../../constants/tracker/period.constants';
import { fetchStepsHistory, type HistorySummary } from '../../../services/tracker/history.service';
import PeriodSelector from './PeriodSelector';

const STEP_GOAL = 8000;
const WALK_DARK = '#A0651A';
const WALK_BG = '#F4D8B0';

function pickLabels(total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const step = Math.max(1, Math.floor(total / 5));
  const idx: number[] = [];
  for (let i = 0; i < total; i += step) idx.push(i);
  if (idx[idx.length - 1] !== total - 1) idx.push(total - 1);
  return idx;
}

function shortLabel(date: string): string {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

interface Props {
  active: boolean;
}

export default function StepsDetailPanel({ active }: Props) {
  const [period, setPeriod] = useState<TrackerPeriod>(DEFAULT_TRACKER_PERIOD);
  const [data, setData] = useState<HistorySummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    fetchStepsHistory(periodDays(period)).then((res) => {
      if (!cancelled) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [active, period]);

  const labelSet = useMemo(() => {
    const pts = data?.points ?? [];
    return new Set(pickLabels(pts.length));
  }, [data]);

  const avgInt = data?.average != null ? Math.round(data.average) : 0;
  const goalProgress = Math.min(1, avgInt / STEP_GOAL);

  return (
    <>
      <PeriodSelector value={period} onChange={setPeriod} />

      <View style={s.visualRow}>
        <View style={s.visualText}>
          <Text style={s.metricBig}>{avgInt.toLocaleString('vi-VN')}</Text>
          <Text style={s.metricUnit}>trung bình bước/ngày</Text>
          <Text style={s.metricCaption}>
            Mục tiêu {STEP_GOAL.toLocaleString('vi-VN')} bước · Bạn đang ở {Math.round(goalProgress * 100)}%
          </Text>
        </View>
      </View>

      <View style={s.barChartWrap}>
        {loading ? (
          <View style={s.loadingRow}>
            <ActivityIndicator color={WALK_DARK} />
          </View>
        ) : (
          <View style={s.barRow}>
            {(data?.points ?? []).map((point, idx) => {
              const value = point.value ?? 0;
              const ratio = Math.min(1, value / STEP_GOAL);
              const showLabel = labelSet.has(idx);
              return (
                <View key={point.date} style={s.barColumn}>
                  <View style={s.barTrack}>
                    <View
                      style={[
                        s.barFill,
                        {
                          height: `${Math.max(point.value != null ? 6 : 0, ratio * 100)}%`,
                          backgroundColor: ratio >= 1 ? WALK_DARK : WALK_BG,
                        },
                      ]}
                    />
                  </View>
                  <Text style={s.barLabel}>{showLabel ? shortLabel(point.date) : ''}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </>
  );
}
