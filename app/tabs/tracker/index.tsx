import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ScrollView, View, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../../constants/colors';
import api from '../../../services/core/api';
import MoodCalendar, { LogItem } from '../../../components/tracker/MoodCalendar';
import MoodLineChart from '../../../components/tracker/MoodLineChart';
import TrackerHeaderRedesign from '../../../components/tracker/TrackerHeaderRedesign';
import HeroProgressCard from '../../../components/tracker/HeroProgressCard';
import DailyChecklist, {
  DailyChecklistHandle,
  DailySummary,
  DailyTaskId,
} from '../../../components/tracker/DailyChecklist';
import TrackerIconsRow from '../../../components/tracker/TrackerIconsRow';
import StreaksCard from '../../../components/tracker/StreaksCard';
import JournalCTA from '../../../components/tracker/JournalCTA';
import SoraMessage from '../../../components/tracker/SoraMessage';
import { fetchEncouragement, EncouragementPayload } from '../../../services/tracker/encouragement.service';
import { useAuthStore } from '../../../stores/auth.store';
import { toDateKey } from '../../../utils/shared/date.utils';
import { useTodayJournal } from '../../../hooks/journal/useTodayJournal';
import { trackerScreenRedesignStyles as styles } from '../../../styles/tracker/tracker-screen.styles';

const DEFAULT_SUMMARY: DailySummary = {
  doneCount: 0,
  totalCount: 6,
  percent: 0,
  nextTask: 'mood',
  recommendation: 'Vote tâm trạng trước nhé.',
  ctaLabel: 'Chọn tâm trạng',
};

export default function TrackerScreen() {
  const params = useLocalSearchParams<{ focus?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const checklistRef = useRef<DailyChecklistHandle>(null);
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
      const res = await api.get('/logs?limit=300');
      setLogs(res.data ?? []);
    } catch (e) {
      console.error('Tracker fetchLogs error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEnc = async () => {
    const enc = await fetchEncouragement();
    if (enc) setEncouragement(enc);
  };

  useFocusEffect(useCallback(() => {
    setProgressAnimationKey((key) => key + 1);
    pingStreak();
    fetchLogs();
    fetchEnc();
  }, [pingStreak]));

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
    fetchEnc();
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

  const handleSummary = useCallback((summary: DailySummary) => {
    setDailySummary(summary);
  }, []);

  const scrollToChecklist = () => {
    const y = sectionY.current.checklist ?? 0;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
  };

  const handleHeroCta = () => {
    const nextTask: DailyTaskId = dailySummary.nextTask;
    if (nextTask === 'mood') {
      router.push('/tabs/home');
      return;
    }
    if (nextTask === 'journal' || nextTask === 'done') {
      todayJournal.openTodayJournal();
      return;
    }
    if (nextTask === 'water') {
      scrollToChecklist();
      checklistRef.current?.incrementWater();
      return;
    }
    if (nextTask === 'steps') {
      scrollToChecklist();
      void checklistRef.current?.syncSteps();
      return;
    }
    if (nextTask === 'meditation') {
      scrollToChecklist();
      checklistRef.current?.openMeditation();
      return;
    }
    scrollToChecklist();
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

            <View
              onLayout={(event) => { sectionY.current.checklist = event.nativeEvent.layout.y; }}
            >
              <DailyChecklist ref={checklistRef} onSummary={handleSummary} />
            </View>

            <TrackerIconsRow scoreByDate={scoreByDate} />

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

            {encouragement?.mood && <SoraMessage message={encouragement.mood} />}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
