import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import StatsRow from '../../../components/tracker/StatsRow';
import MoodBarChart from '../../../components/tracker/MoodBarChart';
import DailyTrackers from '../../../components/tracker/DailyTrackers';
import PsychPhaseCard from '../../../components/tracker/PsychPhaseCard';
import AIInsightCard from '../../../components/tracker/AIInsightCard';

const WEEK_DATA = [
  { day: 'T2', score: 2, emoji: '😢', color: Colors.moodScale[2] },
  { day: 'T3', score: 3, emoji: '😐', color: Colors.moodScale[5] },
  { day: 'T4', score: 4, emoji: '😊', color: Colors.moodScale[8] },
  { day: 'T5', score: 2, emoji: '😤', color: Colors.moodScale[4] },
  { day: 'T6', score: 5, emoji: '🤩', color: Colors.moodScale[10] },
  { day: 'T7', score: 4, emoji: '😌', color: Colors.moodScale[6] },
  { day: 'CN', score: 3, emoji: '🙂', color: Colors.moodScale[7] },
];

const MONTH_DATA = [
  { day: 'T1', score: 2.5, color: Colors.teal },
  { day: 'T2', score: 3.2, color: Colors.teal },
  { day: 'T3', score: 4.1, color: Colors.teal },
  { day: 'T4', score: 3.7, color: Colors.teal },
];

const INITIAL_TRACKERS = [
  { id: 'water',    emoji: '💧', name: 'Uống nước',   current: 4, goal: 8,  unit: 'ly',    color: '#90CAF9' },
  { id: 'sleep',    emoji: '😴', name: 'Giấc ngủ',    current: 7, goal: 8,  unit: 'tiếng', color: '#CE93D8' },
  { id: 'exercise', emoji: '🏃', name: 'Vận động',    current: 15, goal: 30, unit: 'phút', color: '#A5D6A7' },
  { id: 'mood',     emoji: '😊', name: 'Check mood',  current: 1, goal: 1,  unit: 'lần',   color: Colors.moodScale[8] },
];

const AI_INSIGHTS = [
  { icon: '📈', title: 'Xu hướng tốt',   desc: 'Mood của bạn tăng đều trong 2 tuần gần đây. Giữ vững nhé!' },
  { icon: '🌙', title: 'Thứ 5 khó khăn', desc: 'Bạn thường cảm thấy mệt mỏi vào thứ 5. Cân nhắc nghỉ ngơi sớm hơn.' },
  { icon: '💡', title: 'Gợi ý',          desc: 'Những ngày bạn ghi journal dài hơn 50 từ, mood hôm sau thường tốt hơn.' },
];

const avgScore = WEEK_DATA.reduce((s, d) => s + d.score, 0) / WEEK_DATA.length;

export default function TrackerScreen() {
  const [trackers, setTrackers] = useState(INITIAL_TRACKERS);

  const handleIncrement = (id: string) => {
    setTrackers(prev => prev.map(t =>
      t.id === id ? { ...t, current: Math.min(t.current + 1, t.goal) } : t
    ));
  };

  const completedCount = trackers.filter(t => t.current >= t.goal).length;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Tracker</Text>
            <Text style={s.headerSub}>Theo dõi sức khỏe & cảm xúc</Text>
          </View>
          <View style={s.completedBadge}>
            <Text style={s.completedText}>{completedCount}/{trackers.length}</Text>
            <Text style={s.completedLabel}>hoàn thành</Text>
          </View>
        </View>

        {/* Stats */}
        <StatsRow streak={7} avgMood={avgScore.toFixed(1)} totalDays={21} />

        {/* Mood Chart */}
        <MoodBarChart weekData={WEEK_DATA} monthData={MONTH_DATA} />

        {/* Daily trackers */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Checklist hôm nay</Text>
          <DailyTrackers items={trackers} onIncrement={handleIncrement} />
        </View>

        {/* Psych phase */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Nhận định & Lời khuyên</Text>
          <PsychPhaseCard avgScore={avgScore} />
        </View>

        {/* Insights */}
        <View style={s.section}>
          <Text style={s.sectionSub}>Dựa trên dữ liệu của bạn</Text>
          <AIInsightCard insights={AI_INSIGHTS} />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.foam },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
  },
  completedBadge: {
    backgroundColor: Colors.teal,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  completedText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: Colors.textLight,
  },
  completedLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  sectionSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
    marginTop: -8,
  },
});