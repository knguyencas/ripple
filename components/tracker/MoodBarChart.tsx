import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface DayData {
  day: string;
  score: number;
  emoji?: string;
  color?: string;
}

interface Props {
  weekData: DayData[];
  monthData: DayData[];
}

const BAR_MAX_H = 100;
const MAX_SCORE = 5;

export default function MoodBarChart({ weekData, monthData }: Props) {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const data = period === 'week' ? weekData : monthData;

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.title}>Mood Chart</Text>
        <View style={s.toggle}>
          {(['week', 'month'] as const).map(p => (
            <TouchableOpacity
              key={p}
              style={[s.toggleBtn, period === p && s.toggleBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[s.toggleText, period === p && s.toggleTextActive]}>
                {p === 'week' ? 'Tuần' : 'Tháng'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.chart}>
        <View style={s.yAxis}>
          {[5, 4, 3, 2, 1].map(n => (
            <Text key={n} style={s.yLabel}>{n}</Text>
          ))}
        </View>
        <View style={s.bars}>
          {[0, 1, 2, 3, 4].map(i => (
            <View key={i} style={[s.gridLine, { bottom: (i / 4) * BAR_MAX_H + 20 }]} />
          ))}
          {data.map((item, i) => {
            const h = (item.score / MAX_SCORE) * BAR_MAX_H;
            return (
              <View key={i} style={s.barCol}>
                <Text style={s.barEmoji}>{item.emoji ?? ''}</Text>
                <View style={s.barBg}>
                  <View style={[s.barFill, {
                    height: h,
                    backgroundColor: item.color ?? Colors.teal,
                  }]} />
                </View>
                <Text style={s.barLabel}>{item.day}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.foam,
    borderRadius: 10,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  toggleBtnActive: { backgroundColor: Colors.teal },
  toggleText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  toggleTextActive: { color: Colors.textLight },
  chart: {
    flexDirection: 'row',
    height: BAR_MAX_H + 50,
  },
  yAxis: {
    width: 16,
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingTop: 20,
  },
  yLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: 8,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 8, right: 0,
    height: 1,
    backgroundColor: Colors.border,
  },
  barCol: { flex: 1, alignItems: 'center' },
  barEmoji: { fontSize: 12, marginBottom: 4, height: 18 },
  barBg: {
    width: 20,
    height: BAR_MAX_H,
    backgroundColor: Colors.border,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 4 },
  barLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});