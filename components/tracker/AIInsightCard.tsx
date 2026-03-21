import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Insight {
  icon: string;
  title: string;
  desc: string;
}

export default function AIInsightCard({ insights }: { insights: Insight[] }) {
  return (
    <View>
      {insights.map((insight, i) => (
        <View key={i} style={s.card}>
          <Text style={s.icon}>{insight.icon}</Text>
          <View style={s.text}>
            <Text style={s.title}>{insight.title}</Text>
            <Text style={s.desc}>{insight.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 14,
    alignItems: 'flex-start',
  },
  icon: { fontSize: 24 },
  text: { flex: 1 },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  desc: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});