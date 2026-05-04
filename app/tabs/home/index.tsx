import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../stores/auth.store';
import api from '../../../services/core/api';
import MoodWheel, { MOODS, SORA_MOOD_EXPRESSIONS } from '../../../components/mood/MoodWheel';
import HomeHeader from '../../../components/home/HomeHeader';
import StatsRow from '../../../components/home/StatsRow';
import MoodInputCard from '../../../components/home/MoodInputCard';
import QuickActionsGrid from '../../../components/home/QuickActionsGrid';
import PrimaryCTA from '../../../components/home/PrimaryCTA';
import SoraPromoCard from '../../../components/home/SoraPromoCard';
import { homeScreenStyles as s } from '../../../styles/home/home-screen.styles';
import { calculateAverageMood, getMoodInfoByName } from '../../../utils/home/home.utils';
import { fetchNotifications } from '../../../services/profile/notifications.service';
import { fetchHealthToday } from '../../../services/tracker/health.service';
import { fetchToday as fetchMeditationToday } from '../../../services/tracker/meditation.service';
import { toDateKey } from '../../../utils/shared/date.utils';
import { getTodayJournalCopy, getTodayJournalRoute } from '../../../utils/journal/today-journal.utils';

interface TodayLog {
  id: string;
  mood: string;
  moodScore: number;
  note: string | null;
  createdAt: string;
}

const STEP_GOAL = 8000;
const SLEEP_GOAL_MIN = 8 * 60;
const DEFAULT_MEDITATION_GOAL_MIN = 10;
const DAILY_TASK_TOTAL = 6;

export default function HomeScreen() {
  const streak = useAuthStore((s) => s.streak);
  const pingStreak = useAuthStore((s) => s.pingStreak);

  const [todayLog, setTodayLog] = useState<TodayLog | null>(null);
  const [avgMood, setAvgMood] = useState<string>('—');
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [dailyDoneCount, setDailyDoneCount] = useState(0);
  const [hasNotification, setHasNotification] = useState(false);
  const [showWheel, setShowWheel] = useState(false);

  const loadHomeData = useCallback(async (active = true) => {
    try {
      await pingStreak();
      const localDate = toDateKey(new Date());
      const [todayRes, logs7Res, statsRes, waterRes, healthToday, meditToday] = await Promise.all([
        api.get('/logs/today'),
        api.get('/logs?limit=7'),
        api.get('/logs/stats'),
        api.get('/water/today', { params: { localDate } }),
        fetchHealthToday(),
        fetchMeditationToday(localDate),
      ]);

      if (!active) return;

      const log = todayRes.data?.log ?? null;
      const waterGlasses = Number(waterRes.data?.glasses ?? 0);
      const waterGoal = Number(waterRes.data?.goal ?? 8);
      const steps = healthToday?.steps ?? null;
      const sleepMin = healthToday?.sleep?.totalMinutes ?? null;
      const meditationMin = meditToday?.totalMinutes ?? 0;
      const meditationGoal = meditToday?.goalMin ?? DEFAULT_MEDITATION_GOAL_MIN;

      const doneCount = [
        !!log,
        !!log?.note?.trim(),
        waterGlasses >= waterGoal,
        steps != null && steps >= STEP_GOAL,
        meditationMin >= meditationGoal,
        sleepMin != null && sleepMin >= SLEEP_GOAL_MIN,
      ].filter(Boolean).length;

      setTodayLog(log);
      setAvgMood(calculateAverageMood(logs7Res.data ?? []));
      setTotalLogs(Number(statsRes.data?.totalLogs ?? 0));
      setDailyDoneCount(doneCount);
    } catch {
      if (active) setDailyDoneCount(0);
    }
  }, [pingStreak]);

  const scheduleHomeReload = useCallback(() => {
    setTimeout(() => {
      void loadHomeData();
    }, 650);
  }, [loadHomeData]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        await loadHomeData(active);

        try {
          const notifications = await fetchNotifications(1);
          if (active) setHasNotification(notifications.unreadCount > 0);
        } catch {
          if (active) setHasNotification(false);
        }
      })();
      return () => { active = false; };
    }, [loadHomeData])
  );

  const handleMoodConfirm = async (mood: typeof MOODS[0]) => {
    setShowWheel(false);
    try {
      if (todayLog) {
        await api.put(`/logs/${todayLog.id}`, {
          mood: mood.name,
          moodScore: mood.score,
        });
        setTodayLog({ ...todayLog, mood: mood.name, moodScore: mood.score });
      } else {
        const res = await api.post('/logs', {
          mood: mood.name,
          moodScore: mood.score,
          factors: [],
          note: null,
        });
        setTodayLog(res.data);
      }
      scheduleHomeReload();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        const existingId = error.response.data?.existingId;
        if (existingId) {
          try {
            await api.put(`/logs/${existingId}`, {
              mood: mood.name,
              moodScore: mood.score,
            });
            setTodayLog((prev) =>
              prev ? { ...prev, mood: mood.name, moodScore: mood.score } : null
            );
            scheduleHomeReload();
          } catch {
            Alert.alert('Lỗi', 'Không lưu được, thử lại nhé!');
          }
        }
      } else {
        Alert.alert('Lỗi', 'Không lưu được, thử lại nhé!');
      }
    }
  };

  const goToJournal = () => {
    router.push(getTodayJournalRoute(todayLog));
  };

  const moodInfo = todayLog ? getMoodInfoByName(MOODS, todayLog.mood) : null;
  const moodLabel = moodInfo?.name ?? null;
  const moodIndex = moodInfo ? MOODS.findIndex((mood) => mood.name === moodInfo.name) : -1;
  const moodExpression = moodIndex >= 0 ? SORA_MOOD_EXPRESSIONS[moodIndex] : null;
  const journalCopy = getTodayJournalCopy(todayLog);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader hasNotification={hasNotification} />

        <StatsRow
          streak={streak}
          avgMood7d={avgMood}
          totalLogs={totalLogs}
          onPressStreak={() => router.push('/tabs/tracker?focus=calendar')}
          onPressAvgMood={() => router.push('/tabs/tracker?focus=chart')}
          onPressTotalLogs={() => router.push('/tabs/journal')}
        />

        <MoodInputCard
          loggedToday={!!todayLog}
          todayMoodLabel={moodLabel}
          todayMoodExpression={moodExpression}
          todayNote={todayLog?.note ?? null}
          onPress={() => setShowWheel(true)}
        />

        <View style={s.sectionRow}>
          <Text style={s.sectionRowTitle}>Hôm nay</Text>
          <Text style={s.sectionRowMeta}>{dailyDoneCount}/{DAILY_TASK_TOTAL}</Text>
        </View>

        <QuickActionsGrid onTaskStateChanged={scheduleHomeReload} />

        <PrimaryCTA
          label={journalCopy.homeLabel}
          onPress={goToJournal}
        />

        <SoraPromoCard />
      </ScrollView>

      {showWheel && (
        <MoodWheel
          onConfirm={handleMoodConfirm}
          onClose={() => setShowWheel(false)}
        />
      )}
    </SafeAreaView>
  );
}
