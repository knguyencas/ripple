import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { activityPanelStyles as s } from '../../../styles/tracker/activity-detail.styles';
import {
  DEFAULT_TRACKER_PERIOD,
  type TrackerPeriod,
  periodDays,
} from '../../../constants/tracker/period.constants';
import { fetchMeditationHistory, type HistorySummary } from '../../../services/tracker/history.service';
import PeriodSelector from './PeriodSelector';

const MEDIT_GREEN = '#3D7A4A';
const MEDIT_BG = '#D8E8D8';
const MEDIT_GOAL = 10;

interface Props {
  active: boolean;
}

export default function MeditationDetailPanel({ active }: Props) {
  const [period, setPeriod] = useState<TrackerPeriod>(DEFAULT_TRACKER_PERIOD);
  const [data, setData] = useState<HistorySummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    fetchMeditationHistory(periodDays(period)).then((res) => {
      if (!cancelled) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [active, period]);

  const avg = data?.average ?? 0;
  const avgRounded = Math.round(avg);

  return (
    <>
      <PeriodSelector value={period} onChange={setPeriod} />

      <View style={s.visualRow}>
        <View style={s.visualIconWrap}>
          {loading ? (
            <ActivityIndicator color={MEDIT_GREEN} />
          ) : (
            <Svg width={110} height={110} viewBox="0 0 120 120">
              <Circle cx={60} cy={60} r={54} fill={MEDIT_BG} />
              <G transform="translate(36, 28)">
                <Circle cx={24} cy={14} r={9} fill="#FFFFFF" stroke={MEDIT_GREEN} strokeWidth={2} />
                <Path
                  d="M 24 23 L 24 38 Q 24 42 28 44 L 42 50 Q 46 52 44 56 L 4 56 Q 2 52 6 50 L 20 44 Q 24 42 24 38 Z"
                  fill="#FFFFFF"
                  stroke={MEDIT_GREEN}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
                <Path
                  d="M -8 56 Q 24 50 56 56"
                  stroke={MEDIT_GREEN}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                />
                <Path
                  d="M 18 14 Q 22 11 26 14"
                  stroke={MEDIT_GREEN}
                  strokeWidth={1.4}
                  fill="none"
                  strokeLinecap="round"
                />
              </G>
            </Svg>
          )}
        </View>

        <View style={s.visualText}>
          <Text style={s.metricBig}>{avgRounded}</Text>
          <Text style={s.metricUnit}>phút trung bình / ngày</Text>
          <Text style={s.metricCaption}>
            Mục tiêu {MEDIT_GOAL} phút · {data?.daysWithData ?? 0}/{data?.totalDays ?? 0} ngày có thiền
          </Text>
        </View>
      </View>
    </>
  );
}
