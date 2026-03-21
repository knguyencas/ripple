import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface TrackerItem {
  id: string;
  emoji: string;
  name: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}

interface Props {
  items: TrackerItem[];
  onIncrement: (id: string) => void;
}

export default function DailyTrackers({ items, onIncrement }: Props) {
  return (
    <View style={s.wrap}>
      {items.map((item) => {
        const pct = Math.min(item.current / item.goal, 1);
        const done = item.current >= item.goal;
        return (
          <View key={item.id} style={s.card}>
            <View style={s.cardLeft}>
              <Text style={s.emoji}>{item.emoji}</Text>
              <View style={s.info}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.sub}>
                  {item.current}/{item.goal} {item.unit}
                </Text>
                {/* Progress bar */}
                <View style={s.barBg}>
                  <View style={[
                    s.barFill,
                    { width: `${pct * 100}%` as any, backgroundColor: done ? Colors.teal : item.color }
                  ]} />
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[s.btn, done && s.btnDone]}
              onPress={() => !done && onIncrement(item.id)}
            >
              <Text style={[s.btnText, done && s.btnTextDone]}>
                {done ? '✓' : '+'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: { fontSize: 28 },
  info: { flex: 1 },
  name: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  sub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  barBg: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  btn: {
    width: 34, height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDone: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  btnText: {
    fontSize: 18,
    color: Colors.teal,
    lineHeight: 22,
  },
  btnTextDone: {
    color: Colors.textLight,
    fontSize: 14,
  },
});