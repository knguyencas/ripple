import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface MoodDist {
  name: string;
  emoji: string;
  count: number;
  pct: number;
  color: string;
}

export default function MoodDistribution({ data }: { data: MoodDist[] }) {
  return (
    <View style={s.card}>
      <View style={s.bar}>
        {data.map((m, i) => (
          <View
            key={i}
            style={[
              s.barSeg,
              {
                flex: m.pct,
                backgroundColor: m.color,
                borderTopLeftRadius: i === 0 ? 6 : 0,
                borderBottomLeftRadius: i === 0 ? 6 : 0,
                borderTopRightRadius: i === data.length - 1 ? 6 : 0,
                borderBottomRightRadius: i === data.length - 1 ? 6 : 0,
              }
            ]}
          />
        ))}
      </View>
      {data.map((m, i) => (
        <View key={i} style={[s.row, i < data.length - 1 && s.rowBorder]}>
          <View style={s.left}>
            <View style={[s.dot, { backgroundColor: m.color }]} />
            <Text style={s.emoji}>{m.emoji}</Text>
            <Text style={s.name}>{m.name}</Text>
          </View>
          <View style={s.right}>
            <Text style={s.pct}>{m.pct}%</Text>
            <Text style={s.count}>{m.count} ngày</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  bar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  barSeg: { height: '100%' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  emoji: { fontSize: 14 },
  name: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  right: { alignItems: 'flex-end' },
  pct: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  count: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
  },
});