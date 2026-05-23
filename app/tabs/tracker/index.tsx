import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { ScrollView, View, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../../constants/colors';
import api from '../../../services/core/api';
import {
  isApiBackendAvailable,
  isApiConnectivityError,
} from '../../../services/core/api-connectivity';
import MoodCalendar, { LogItem } from '../../../components/tracker/MoodCalendar';
import MoodLineChart from '../../../components/tracker/MoodLineChart';
import TrackerHeaderRedesign from '../../../components/tracker/TrackerHeaderRedesign';
import HeroProgressCard from '../../../components/tracker/HeroProgressCard';
import TrackerIconsRow from '../../../components/tracker/TrackerIconsRow';
import StreaksCard from '../../../components/tracker/StreaksCard';
import JournalCTA from '../../../components/tracker/JournalCTA';
import SoraMessage from '../../../components/tracker/SoraMessage';
import { fetchEncouragement, EncouragementPayload } from '../../../services/tracker/encouragement.service';
import { fetchHealthToday } from '../../../services/tracker/health.service';
import { fetchToday as fetchMeditationToday } from '../../../services/tracker/meditation.service';
import { useAuthStore } from '../../../stores/auth.store';
import { toDateKey } from '../../../utils/shared/date.utils';
import { useTodayJournal } from '../../../hooks/journal/useTodayJournal';
import { trackerScreenRedesignStyles as styles } from '../../../styles/tracker/tracker-screen.styles';

const STEP_GOAL = 8000;
const SLEEP_GOAL_MIN = 8 * 60;
const DEFAULT_MEDITATION_GOAL_MIN = 10;
const DAILY_TASK_TOTAL = 6;

type DailyTaskId = 'mood' | 'journal' | 'water' | 'steps' | 'meditation' | 'sleep' | 'done';

interface DailySummary {
  doneCount: number;
  totalCount: number;
  percent: number;
  nextTask: DailyTaskId;
  recommendation: string;
  ctaLabel: string;
}

const DEFAULT_SUMMARY: DailySummary = {
  doneCount: 0,
  totalCount: DAILY_TASK_TOTAL,
  percent: 0,
  nextTask: 'mood',
  recommendation: 'Vote tâm trạng trước nhé.',
  ctaLabel: 'Chọn tâm trạng',
};

function ratio(value: number | null, goal: number): number {
  if (value == null || goal <= 0) return 0;
  return Math.max(0, Math.min(1, value / goal));
}

export default function TrackerScreen() {
  const params = useLocalSearchParams<{ focus?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Record<string, number>>({});
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [encouragement, setEncouragement] = useState<EncouragementPayload | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary>(DEFAULT_SUMMARY);
  const [progressAnimationKey, setProgressAnimationKey] = useState(0);
  const streak = useAuthStore((st) => st.streak);
  const pingStreak = useAuthStore((st) => st.pingStreak);
  const todayJournal = useTodayJournal();

  const fetchLogs = async () => {
    try {
      if (!(await isApiBackendAvailable())) return;
      const res = await api.get('/logs?limit=300');
      setLogs(res.data ?? []);
    } catch (e) {
      if (!isApiConnectivityError(e)) {
        console.error('Tracker fetchLogs error:', e);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEnc = async () => {
    const enc = await fetchEncouragement();
    if (enc) setEncouragement(enc);
  };

  const fetchDailySummary = async () => {
    try {
      if (!(await isApiBackendAvailable())) {
        setDailySummary(DEFAULT_SUMMARY);
        return;
      }

      const localDate = toDateKey(new Date());
      const [todayRes, waterRes, healthToday, meditationToday] = await Promise.all([
        api.get('/logs/today').catch(() => null),
        api.get('/water/today', { params: { localDate } }).catch(() => null),
        fetchHealthToday(),
        fetchMeditationToday(localDate),
      ]);

      const log = todayRes?.data?.log ?? null;
      const glasses = Number(waterRes?.data?.glasses ?? 0);
      const waterGoal = Number(waterRes?.data?.goal ?? 8);
      const steps = healthToday?.steps ?? null;
      const sleepMin = healthToday?.sleep?.totalMinutes ?? null;
      const meditationMin = meditationToday?.totalMinutes ?? 0;
      const meditationGoal = Math.max(1, Number(meditationToday?.goalMin ?? DEFAULT_MEDITATION_GOAL_MIN));

      const progress = {
        mood: log ? 1 : 0,
        journal: log?.note?.trim() ? 1 : 0,
        water: ratio(glasses, waterGoal),
        steps: ratio(steps, STEP_GOAL),
        meditation: ratio(meditationMin, meditationGoal),
        sleep: ratio(sleepMin, SLEEP_GOAL_MIN),
      };

      const doneCount = Object.values(progress).filter((value) => value >= 1).length;
      const percent = (Object.values(progress).reduce((sum, value) => sum + value, 0) / DAILY_TASK_TOTAL) * 100;

      let nextTask: DailyTaskId = 'done';
      let recommendation = 'Hôm nay đủ nhịp rồi.';
      let ctaLabel = 'Xem nhật ký';

      if (!progress.mood) {
        nextTask = 'mood';
        recommendation = 'Vote tâm trạng trước nhé.';
        ctaLabel = 'Chọn tâm trạng';
      } else if (!progress.journal) {
        nextTask = 'journal';
        recommendation = 'Viết vài dòng nhật ký.';
        ctaLabel = 'Viết log';
      } else if (progress.water < 1) {
        nextTask = 'water';
        recommendation = 'Uống thêm nước nào.';
        ctaLabel = 'Ghi uống nước';
      } else if (progress.steps < 1) {
        nextTask = 'steps';
        recommendation = 'Xem lại vận động hôm nay.';
        ctaLabel = 'Xem vận động';
      } else if (progress.meditation < 1) {
        nextTask = 'meditation';
        recommendation = 'Thiền thêm một chút.';
        ctaLabel = 'Xem thiền';
      } else if (progress.sleep < 1) {
        nextTask = 'sleep';
        recommendation = 'Theo dõi giấc ngủ đêm qua.';
        ctaLabel = 'Xem giấc ngủ';
      }

      setDailySummary({
        doneCount,
        totalCount: DAILY_TASK_TOTAL,
        percent,
        nextTask,
        recommendation,
        ctaLabel,
      });
    } catch {
      setDailySummary(DEFAULT_SUMMARY);
    }
  };

  useFocusEffect(useCallback(() => {
    setProgressAnimationKey((key) => key + 1);
    void pingStreak();
    void fetchLogs();
    void fetchEnc();
    void fetchDailySummary();
  }, [pingStreak]));

  const onRefresh = () => {
    setRefreshing(true);
    void fetchLogs();
    void fetchEnc();
    void fetchDailySummary();
  };

  const logsByDate = useMemo(() => {
    const map: Record<string, LogItem[]> = {};
    for (const log of logs) {
      const k = toDateKey(new Date(log.createdAt));
      (map[k] ||= []).push(log);
    }
    for (const k in map) {
      map[k].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return map;
  }, [logs]);

  const scoreByDate = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [k, items] of Object.entries(logsByDate)) {
      const sum = items.reduce((acc, l) => acc + l.moodScore, 0);
      out[k] = sum / items.length;
    }
    return out;
  }, [logsByDate]);

  const monthStats = useMemo(() => {
    const today = new Date();
    const totalDaysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    let daysLogged = 0;
    for (let d = 1; d <= today.getDate(); d++) {
      const key = toDateKey(new Date(today.getFullYear(), today.getMonth(), d));
      if (logsByDate[key]?.length) daysLogged += 1;
    }
    return { daysLogged, totalDaysInMonth };
  }, [logsByDate]);

  const scrollToTrackIcons = () => {
    const y = sectionY.current.track ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
  };

  const handleHeroCta = () => {
    const nextTask = dailySummary.nextTask;
    if (nextTask === 'mood') {
      router.push('/tabs/home');
      return;
    }
    if (nextTask === 'journal' || nextTask === 'done') {
      todayJournal.openTodayJournal();
      return;
    }
    if (nextTask === 'water') {
      router.push('/tabs/home');
      return;
    }
    scrollToTrackIcons();
  };

  useEffect(() => {
    if (loading) return;
    const focus = Array.isArray(params.focus) ? params.focus[0] : params.focus;
    if (focus !== 'calendar' && focus !== 'chart') return;

    const timer = setTimeout(() => {
      const y = sectionY.current[focus] ?? 0;
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    }, 120);

    return () => clearTimeout(timer);
  }, [loading, params.focus]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />
        }
      >
        <TrackerHeaderRedesign />

        {loading ? (
          <ActivityIndicator style={styles.loading} color={Colors.teal} />
        ) : (
          <>
            <HeroProgressCard
              doneCount={dailySummary.doneCount}
              totalCount={dailySummary.totalCount}
              percent={dailySummary.percent}
              animationKey={progressAnimationKey}
              recommendation={dailySummary.recommendation}
              ctaLabel={dailySummary.ctaLabel}
              onCtaPress={handleHeroCta}
            />

            <JournalCTA
              title={todayJournal.copy.title}
              buttonLabel={todayJournal.copy.buttonLabel}
              accessibilityLabel={todayJournal.copy.accessibilityLabel}
              onPress={todayJournal.openTodayJournal}
            />

            <View onLayout={(event) => { sectionY.current.track = event.nativeEvent.layout.y; }}>
              <TrackerIconsRow scoreByDate={scoreByDate} />
            </View>

            <StreaksCard
              currentStreak={streak}
              daysLoggedThisMonth={monthStats.daysLogged}
              totalDaysInMonth={monthStats.totalDaysInMonth}
            />

            <View
              style={styles.calendarWrap}
              onLayout={(event) => { sectionY.current.calendar = event.nativeEvent.layout.y; }}
            >
              <MoodCalendar logsByDate={logsByDate} />
            </View>

            <View
              style={styles.chartWrap}
              onLayout={(event) => { sectionY.current.chart = event.nativeEvent.layout.y; }}
            >
              <MoodLineChart scoreByDate={scoreByDate} />
            </View>

            {encouragement?.mood && (
              <SoraMessage message={encouragement.mood} band={encouragement.debug?.band} />
            )}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
