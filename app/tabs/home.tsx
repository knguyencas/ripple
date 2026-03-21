import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { homeStyles as s } from '../../styles/home.styles';
import { useAuthStore } from '../../stores/auth.store';
import MoodWheel, { MOODS } from '../../components/mood/MoodWheel';

const HABITS = [
  { emoji: '💧', name: 'Uống nước', sub: 'Mục tiêu 8 ly/ngày' },
  { emoji: '🌙', name: 'Ngủ đủ giấc', sub: 'Mục tiêu 7-8 tiếng' },
  { emoji: '🚶', name: 'Vận động', sub: 'Đi bộ 30 phút' },
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [showWheel, setShowWheel] = useState(false);
  const [todayMood, setTodayMood] = useState<typeof MOODS[0] | null>(null);
  const [habits, setHabits] = useState([false, false, false]);

  const displayName = user?.displayName || user?.username || 'bạn';
  const initials = displayName.slice(0, 2).toUpperCase();

  const toggleHabit = (i: number) => {
    setHabits(prev => prev.map((v, idx) => idx === i ? !v : v));
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng ☀️';
    if (h < 18) return 'Chào buổi chiều 🌤️';
    return 'Chào buổi tối 🌙';
  };

  const handleMoodConfirm = (mood: typeof MOODS[0]) => {
    setTodayMood(mood);
    setShowWheel(false);
  };

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{getGreeting()}</Text>
            <Text style={s.username}>{displayName}</Text>
          </View>
          <TouchableOpacity style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryValue}>7 🔥</Text>
            <Text style={s.summaryLabel}>Ngày streak</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryValue}>3.8</Text>
            <Text style={s.summaryLabel}>Mood TB tuần</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={s.summaryValue}>21</Text>
            <Text style={s.summaryLabel}>Ngày đã log</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Hôm nay bạn thế nào?</Text>
        <TouchableOpacity style={s.quickLogCard} onPress={() => setShowWheel(true)}>
          {todayMood ? (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ fontSize: 48, marginBottom: 4 }}>{todayMood.emoji}</Text>
              <Text style={s.quickLogTitle}>{todayMood.name}</Text>
              <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9BB5C4' }}>
                Nhấn để thay đổi
              </Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>🌊</Text>
              <Text style={s.quickLogTitle}>Chạm để chọn tâm trạng</Text>
              <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 12, color: '#9BB5C4' }}>
                Xoay vòng để tìm cảm xúc phù hợp
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={s.logBtn}
          onPress={() => router.push('/tabs/journal/new')}
        >
          <Text style={s.logBtnText}>
            {todayMood ? 'Tiếp tục ghi log' : 'Ghi nhật ký hôm nay'}
          </Text>
        </TouchableOpacity>

        <Text style={s.sectionTitle}>Thói quen hôm nay</Text>
        {HABITS.map((h, i) => (
          <TouchableOpacity key={i} style={s.habitCard} onPress={() => toggleHabit(i)}>
            <View style={s.habitLeft}>
              <Text style={s.habitEmoji}>{h.emoji}</Text>
              <View>
                <Text style={s.habitName}>{h.name}</Text>
                <Text style={s.habitSub}>{h.sub}</Text>
              </View>
            </View>
            <View style={[s.habitCheck, habits[i] && s.habitCheckDone]}>
              {habits[i] && <Text style={s.habitCheckText}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {showWheel && (
        <MoodWheel
          onConfirm={handleMoodConfirm}
          onClose={() => setShowWheel(false)}
        />
      )}
    </View>
  );
}