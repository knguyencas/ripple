import { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Animated, Easing } from 'react-native';
import Svg, { Defs, ClipPath, Path, Rect, LinearGradient, Stop } from 'react-native-svg';
import { activityPanelStyles as s } from '../../../styles/tracker/activity-detail.styles';
import {
  DEFAULT_TRACKER_PERIOD,
  type TrackerPeriod,
  periodDays,
} from '../../../constants/tracker/period.constants';
import { fetchWaterHistory, type HistorySummary } from '../../../services/tracker/history.service';
import PeriodSelector from './PeriodSelector';

const WATER_GOAL = 8;
const GLASS_W = 96;
const GLASS_H = 130;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface Props {
  active: boolean;
}

export default function WaterDetailPanel({ active }: Props) {
  const [period, setPeriod] = useState<TrackerPeriod>(DEFAULT_TRACKER_PERIOD);
  const [data, setData] = useState<HistorySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setLoading(true);
    fetchWaterHistory(periodDays(period)).then((res) => {
      if (!cancelled) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [active, period]);

  const avg = data?.average ?? 0;
  const ratio = Math.min(1, avg / WATER_GOAL);

  useEffect(() => {
    if (!active) return;
    fillAnim.stopAnimation();
    fillAnim.setValue(0);
    Animated.timing(fillAnim, {
      toValue: ratio,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [active, ratio, fillAnim]);

  const animatedHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, GLASS_H - 12],
  });
  const animatedY = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [GLASS_H - 6, 6],
  });

  return (
    <>
      <PeriodSelector value={period} onChange={setPeriod} />

      <View style={s.visualRow}>
        <View style={[s.visualIconCenter, { width: GLASS_W, height: GLASS_H }]}>
          {loading ? (
            <ActivityIndicator color="#2E6F8E" />
          ) : (
            <Svg width={GLASS_W} height={GLASS_H} viewBox={`0 0 ${GLASS_W} ${GLASS_H}`}>
              <Defs>
                <ClipPath id="glassClip">
                  <Path
                    d={`M 14 6 L ${GLASS_W - 14} 6 L ${GLASS_W - 22} ${GLASS_H - 6} L 22 ${GLASS_H - 6} Z`}
                  />
                </ClipPath>
                <LinearGradient id="waterFillGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#7CC0E6" />
                  <Stop offset="1" stopColor="#2E6F8E" />
                </LinearGradient>
              </Defs>
              <Path
                d={`M 14 6 L ${GLASS_W - 14} 6 L ${GLASS_W - 22} ${GLASS_H - 6} L 22 ${GLASS_H - 6} Z`}
                fill="rgba(46, 111, 142, 0.06)"
                stroke="#2E6F8E"
                strokeWidth={2.5}
                strokeLinejoin="round"
              />
              <AnimatedRect
                x={0}
                y={animatedY as unknown as number}
                width={GLASS_W}
                height={animatedHeight as unknown as number}
                fill="url(#waterFillGrad)"
                clipPath="url(#glassClip)"
              />
            </Svg>
          )}
        </View>

        <View style={s.visualText}>
          <Text style={s.metricBig}>{avg.toFixed(1)}</Text>
          <Text style={s.metricUnit}>ly trung bình / ngày</Text>
          <Text style={s.metricCaption}>
            Mục tiêu {WATER_GOAL} ly · {data?.daysWithData ?? 0}/{data?.totalDays ?? 0} ngày có ghi
          </Text>
        </View>
      </View>
    </>
  );
}
