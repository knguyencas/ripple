import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { moodLineChartStyles as s } from '../../styles/tracker/tracker.styles';
import { toDateKey as dateKey } from '../../utils/shared/date.utils';

const TRACKER_ACTION_BLUE = '#2E6F8E';

type Period = '7d' | '1m' | '3m' | '6m';

interface Props {
  scoreByDate: Record<string, number>;
}

interface PointData {
  label: string;
  score: number | null;
  date: Date;
}

const PERIOD_CFG: Record<Period, { days: number; bucketDays: number; label: string }> = {
  '7d': { days: 7,   bucketDays: 1, label: '7 ngày' },
  '1m': { days: 30,  bucketDays: 1, label: '1 tháng' },
  '3m': { days: 90,  bucketDays: 7, label: '3 tháng' },
  '6m': { days: 180, bucketDays: 7, label: '6 tháng' },
};

const CHART_HEIGHT = 160;
const DOT_SIZE = 8;
const CURRENT_DOT_SIZE = 10;
const LINE_THICKNESS = 2;
const Y_TICKS = [5, 4, 3, 2, 1];

function smoothScore(raw: (number | null)[]): (number | null)[] {
  return raw.map((v, i) => {
    const window = [raw[i - 1], v, raw[i + 1]].filter((x): x is number => x != null);
    if (window.length === 0) return null;
    const avg = window.reduce((a, b) => a + b, 0) / window.length;
    return Math.round(avg * 100) / 100;
  });
}

function buildPoints(scoreByDate: Record<string, number>, period: Period): PointData[] {
  const cfg = PERIOD_CFG[period];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets: PointData[] = [];
  const totalDays = cfg.days;
  const numBuckets = Math.ceil(totalDays / cfg.bucketDays);

  for (let i = numBuckets - 1; i >= 0; i--) {
    const end = new Date(today);
    end.setDate(today.getDate() - i * cfg.bucketDays);
    const start = new Date(end);
    start.setDate(end.getDate() - (cfg.bucketDays - 1));

    const scores: number[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      const s = scoreByDate[dateKey(cur)];
      if (s != null) scores.push(s);
      cur.setDate(cur.getDate() + 1);
    }

    const avg = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null;

    let label: string;
    if (cfg.bucketDays === 1) {
      label = `${end.getDate()}/${end.getMonth() + 1}`;
    } else {
      label = `${start.getDate()}/${start.getMonth() + 1}`;
    }

    buckets.push({ label, score: avg, date: end });
  }

  const smoothed = smoothScore(buckets.map(b => b.score));
  return buckets.map((b, i) => ({ ...b, score: smoothed[i] }));
}

function lineSegment(
  x1: number, y1: number, x2: number, y2: number,
  color: string, thickness: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  return {
    position: 'absolute' as const,
    left: midX - len / 2,
    top: midY - thickness / 2,
    width: len,
    height: thickness,
    backgroundColor: color,
    borderRadius: thickness / 2,
    transform: [{ rotate: `${angle}deg` }],
  };
}

export default function MoodLineChart({ scoreByDate }: Props) {
  const [period, setPeriod] = useState<Period>('7d');
  const [plotWidth, setPlotWidth] = useState(0);
  const chartOpacity = useRef(new Animated.Value(1)).current;
  const chartTranslateY = useRef(new Animated.Value(0)).current;

  const points = useMemo(() => buildPoints(scoreByDate, period), [scoreByDate, period]);

  const validScores = points.map(p => p.score).filter((s): s is number => s != null);
  const avgMood = validScores.length
    ? validScores.reduce((a, b) => a + b, 0) / validScores.length
    : 0;
  const maxMood = validScores.length ? Math.max(...validScores) : 0;
  const minMood = validScores.length ? Math.min(...validScores) : 0;

  const onPlotLayout = (e: LayoutChangeEvent) => {
    setPlotWidth(e.nativeEvent.layout.width);
  };

  const xFor = (i: number) => {
    if (points.length <= 1) return plotWidth / 2;
    return (i / (points.length - 1)) * plotWidth;
  };
  const yFor = (score: number) => {
    return CHART_HEIGHT - ((score - 1) / 4) * CHART_HEIGHT;
  };

  const segments: { from: number; to: number }[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    if (points[i].score != null && points[i + 1].score != null) {
      segments.push({ from: i, to: i + 1 });
    }
  }

  const labelStep = Math.max(1, Math.ceil(points.length / 5));
  const xLabels = points
    .map((p, i) => ({ p, i }))
    .filter(({ i }) => i % labelStep === 0 || i === points.length - 1);
  const currentPointIndex = points.reduce(
    (last, point, index) => (point.score == null ? last : index),
    -1
  );

  const handlePeriodPress = (nextPeriod: Period) => {
    if (nextPeriod === period) return;

    Animated.parallel([
      Animated.timing(chartOpacity, {
        toValue: 0.35,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(chartTranslateY, {
        toValue: 6,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPeriod(nextPeriod);
      chartOpacity.setValue(0.35);
      chartTranslateY.setValue(6);
      Animated.parallel([
        Animated.timing(chartOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(chartTranslateY, {
          toValue: 0,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.title}>Mood track</Text>
      </View>

      <View style={s.toggle}>
        {(Object.keys(PERIOD_CFG) as Period[]).map(p => (
          <TouchableOpacity
            key={p}
            style={[s.toggleBtn, period === p && s.toggleBtnActive]}
            onPress={() => handlePeriodPress(p)}
          >
            <Text style={[s.toggleText, period === p && s.toggleTextActive]}>
              {PERIOD_CFG[p].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {validScores.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>
            Chưa có dữ liệu cảm xúc trong khoảng thời gian này.{'\n'}
            Hãy ghi journal để bắt đầu theo dõi nhé!
          </Text>
        </View>
      ) : (
        <Animated.View
          style={{
            opacity: chartOpacity,
            transform: [{ translateY: chartTranslateY }],
          }}
        >
          <View style={s.chartWrap}>
            <View style={[s.yAxis, { height: CHART_HEIGHT }]}>
              {Y_TICKS.map(t => (
                <Text key={t} style={s.yLabel}>{t}</Text>
              ))}
            </View>

            <View style={s.plotWrap}>
              <View
                style={[s.plot, { height: CHART_HEIGHT }]}
                onLayout={onPlotLayout}
              >
                {Y_TICKS.map((_, i) => (
                  <View
                    key={i}
                    style={[s.gridLine, { top: (i / (Y_TICKS.length - 1)) * CHART_HEIGHT }]}
                  />
                ))}

                {plotWidth > 0 && segments.map((seg, i) => {
                  const x1 = xFor(seg.from);
                  const y1 = yFor(points[seg.from].score!);
                  const x2 = xFor(seg.to);
                  const y2 = yFor(points[seg.to].score!);
                  const style = lineSegment(x1, y1, x2, y2, TRACKER_ACTION_BLUE, LINE_THICKNESS);
                  return style ? <View key={i} style={style} /> : null;
                })}

                {plotWidth > 0 && points.map((p, i) => {
                  if (p.score == null) return null;
                  const cx = xFor(i);
                  const cy = yFor(p.score);
                  const isCurrentPoint = i === currentPointIndex;
                  const size = isCurrentPoint ? CURRENT_DOT_SIZE : DOT_SIZE;
                  return (
                    <View
                      key={i}
                      style={[
                        s.dot,
                        isCurrentPoint && s.dotCurrent,
                        {
                          width: size,
                          height: size,
                          borderRadius: size / 2,
                          left: cx - size / 2,
                          top: cy - size / 2,
                        },
                      ]}
                    />
                  );
                })}
              </View>

              <View style={s.xAxisRow}>
                {xLabels.map(({ p, i }) => (
                  <Text key={i} style={s.xLabel}>{p.label}</Text>
                ))}
              </View>
            </View>
          </View>

          <View style={s.summaryRow}>
            <View style={s.summaryItem}>
              <Text style={s.summaryNum}>{avgMood.toFixed(1)}</Text>
              <Text style={s.summaryLabel}>Trung bình</Text>
            </View>
            <View style={s.summaryItem}>
              <Text style={s.summaryNum}>{maxMood.toFixed(1)}</Text>
              <Text style={s.summaryLabel}>Cao nhất</Text>
            </View>
            <View style={s.summaryItem}>
              <Text style={s.summaryNum}>{minMood.toFixed(1)}</Text>
              <Text style={s.summaryLabel}>Thấp nhất</Text>
            </View>
            <View style={s.summaryItem}>
              <Text style={s.summaryNum}>{validScores.length}</Text>
              <Text style={s.summaryLabel}>Điểm dữ liệu</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
