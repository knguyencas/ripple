import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  streak: number;
  avgMood: string;
  totalDays: number;
}

export default function StatsRow({ streak, avgMood, totalDays }: Props) {
  const stats = [
    { emoji: '🔥', num: String(streak),    label: 'Ngày streak' },
    { emoji: '📊', num: String(avgMood),   label: 'Mood TB tuần' },
    { emoji: '📝', num: String(totalDays), label: 'Ngày đã log' },
  ];
  return (
    <View style={s.row}>
      {stats.map((st, i) => (
        <View key={i} style={s.card}>
          <Text style={s.emoji}>{st.emoji}</Text>
          <Text style={s.num}>{st.num}</Text>
          <Text style={s.label}>{st.label}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  emoji: { fontSize: 22, marginBottom: 4 },
  num: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  label: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});