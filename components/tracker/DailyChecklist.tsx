import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import api from '../../services/core/api';
import { fetchHealthToday, requestStepsPermissionAndSync } from '../../services/tracker/health.service';
import { fetchToday as fetchMeditationToday } from '../../services/tracker/meditation.service';
import { toDateKey } from '../../utils/shared/date.utils';
import { getTodayJournalRoute } from '../../utils/journal/today-journal.utils';
import { checklistStyles as s } from '../../styles/tracker/tracker-redesign.styles';
import {
  JournalLineIcon,
  MeditationLineIcon,
  MoodLineIcon,
  SleepLineIcon,
  StepsLineIcon,
  WaterDropLineIcon,
} from '../shared/AppIcons';
import ChecklistItem from './ChecklistItem';
import MeditationModal from './MeditationModal';
import SleepManualModal from './SleepManualModal';

const todayKey = () => toDateKey(new Date());

const STEP_GOAL = 8000;
const SLEEP_GOAL_MIN = 8 * 60;
const DEFAULT_MEDIT_GOAL_MIN = 10;
const DAILY_TASK_TOTAL = 6;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type DailyTaskId =
  | 'mood'
  | 'journal'
  | 'water'
  | 'steps'
  | 'meditation'
  | 'sleep'
  | 'done';

export interface DailySummary {
  doneCount: number;
  totalCount: number;
  percent: number;
  nextTask: DailyTaskId;
  recommendation: string;
  ctaLabel: string;
}

export interface DailyChecklistHandle {
  incrementWater: () => void;
  syncSteps: () => Promise<void>;
  openMeditation: () => void;
}

interface Props {
  onSummary: (summary: DailySummary) => void;
}

interface TodayLog {
  id: string;
  note: string | null;
}

function ratio(value: number | null, goal: number): number {
  if (value == null || goal <= 0) return 0;
  return Math.max(0, Math.min(1, value / goal));
}

const DailyChecklist = forwardRef<DailyChecklistHandle, Props>(({ onSummary }, ref) => {
  const [todayLog, setTodayLog] = useState<TodayLog | null>(null);
  const [glasses, setGlasses] = useState(0);
  const [waterGoal, setWaterGoal] = useState(8);
  const [steps, setSteps] = useState<number | null>(null);
  const [sleepMin, setSleepMin] = useState<number | null>(null);
  const [meditMin, setMeditMin] = useState(0);
  const [meditGoalMin, setMeditGoalMin] = useState(DEFAULT_MEDIT_GOAL_MIN);
  const [meditModalVisible, setMeditModalVisible] = useState(false);
  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValue = useRef<number | null>(null);
  const extraTasksAnim = useRef(new Animated.Value(0)).current;

  const load = useCallback(async () => {
    try {
      const [waterRes, healthToday, meditToday] = await Promise.all([
        api.get('/water/today', { params: { localDate: todayKey() } }),
        fetchHealthToday(),
        fetchMeditationToday(todayKey()),
      ]);
      const todayRes = await api.get('/logs/today').catch(() => null);
      setTodayLog(todayRes?.data?.log ?? null);
      setGlasses(Number(waterRes.data?.glasses ?? 0));
      setWaterGoal(Number(waterRes.data?.goal ?? 8));
      setSteps(healthToday?.steps ?? null);
      setSleepMin(healthToday?.sleep?.totalMinutes ?? null);
      setMeditMin(meditToday?.totalMinutes ?? 0);
      setMeditGoalMin(Math.max(1, Number(meditToday?.goalMin ?? DEFAULT_MEDIT_GOAL_MIN)));
    } catch {
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, []);

  const incrementWater = () => {
    setGlasses((prev) => {
      const next = Math.min(30, prev + 1);
      if (next !== prev) {
        pendingValue.current = next;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
          const v = pendingValue.current;
          if (v == null) return;
          try { await api.put('/water', { localDate: todayKey(), glasses: v }); } catch {}
        }, 500);
      }
      return next;
    });
  };

  const decrementWater = () => {
    setGlasses((prev) => {
      const next = Math.max(0, prev - 1);
      if (next !== prev) {
        pendingValue.current = next;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
          const v = pendingValue.current;
          if (v == null) return;
          try { await api.put('/water', { localDate: todayKey(), glasses: v }); } catch {}
        }, 500);
      }
      return next;
    });
  };

  const syncSteps = async () => {
    const res = await requestStepsPermissionAndSync();
    if (res?.steps != null) setSteps(res.steps);
  };

  useImperativeHandle(ref, () => ({
    incrementWater,
    syncSteps,
    openMeditation: () => setMeditModalVisible(true),
  }));

  const moodDone = !!todayLog;
  const journalDone = !!todayLog?.note?.trim();
  const waterDone = glasses >= waterGoal;
  const sleepDone = sleepMin != null && sleepMin >= SLEEP_GOAL_MIN;
  const stepsDone = steps != null && steps >= STEP_GOAL;
  const meditDone = meditMin >= meditGoalMin;

  useEffect(() => {
    const taskProgress = {
      mood: moodDone ? 1 : 0,
      journal: journalDone ? 1 : 0,
      water: ratio(glasses, waterGoal),
      steps: ratio(steps, STEP_GOAL),
      meditation: ratio(meditMin, meditGoalMin),
      sleep: ratio(sleepMin, SLEEP_GOAL_MIN),
    };
    const doneCount = Object.values(taskProgress).filter((value) => value >= 1).length;
    const percent = (Object.values(taskProgress).reduce((sum, value) => sum + value, 0) / DAILY_TASK_TOTAL) * 100;

    let nextTask: DailyTaskId = 'done';
    let recommendation = 'Hôm nay đủ nhịp rồi.';
    let ctaLabel = 'Xem nhật ký';

    if (!moodDone) {
      nextTask = 'mood';
      recommendation = 'Vote tâm trạng trước nhé.';
      ctaLabel = 'Chọn tâm trạng';
    } else if (!journalDone) {
      nextTask = 'journal';
      recommendation = 'Viết vài dòng nhật ký.';
      ctaLabel = 'Viết log';
    } else if (!waterDone) {
      nextTask = 'water';
      recommendation = 'Uống thêm nước nào.';
      ctaLabel = 'Uống nước';
    } else if (!stepsDone) {
      nextTask = 'steps';
      recommendation = 'Bạn sắp làm được rồi, cố lên.';
      ctaLabel = 'Đồng bộ bước';
    } else if (!meditDone) {
      nextTask = 'meditation';
      recommendation = 'Thiền thêm một chút.';
      ctaLabel = 'Bắt đầu thiền';
    } else if (!sleepDone) {
      nextTask = 'sleep';
      recommendation = 'Theo dõi giấc ngủ đêm qua.';
      ctaLabel = 'Xem giấc ngủ';
    }

    onSummary({
      doneCount,
      totalCount: DAILY_TASK_TOTAL,
      percent,
      nextTask,
      recommendation,
      ctaLabel,
    });
  }, [
    glasses,
    journalDone,
    meditDone,
    meditGoalMin,
    meditMin,
    moodDone,
    onSummary,
    sleepDone,
    sleepMin,
    steps,
    stepsDone,
    todayLog,
    waterDone,
    waterGoal,
  ]);

  const toggleTaskList = () => {
    if (expanded) {
      Animated.timing(extraTasksAnim, {
        toValue: 0,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(false);
      });
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(true);
    extraTasksAnim.setValue(0);
    Animated.timing(extraTasksAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={s.section}>
      <View style={s.headerRow}>
        <Text style={s.sectionTitle}>Việc hôm nay</Text>
        <TouchableOpacity onPress={toggleTaskList} activeOpacity={0.75}>
          <Text style={s.meta}>{expanded ? 'Thu gọn' : 'Xem tất cả'}</Text>
        </TouchableOpacity>
      </View>

      <ChecklistItem
        title="Vote tâm trạng"
        sub={moodDone ? 'Đã ghi nhận mood hôm nay' : 'Chọn mood để bắt đầu ngày'}
        icon={<MoodLineIcon size={22} color="#A03844" />}
        iconBg="#FFD8D8"
        iconColor="#A03844"
        trailing={
          moodDone
            ? { type: 'done' }
            : { type: 'open', onPress: () => router.push('/tabs/home') }
        }
      />

      <ChecklistItem
        title="Viết log"
        sub={journalDone ? 'Đã viết nhật ký hôm nay' : 'Ghi vài dòng cảm xúc'}
        icon={<JournalLineIcon size={22} color="#8B6F2A" />}
        iconBg="#FFF3CD"
        iconColor="#8B6F2A"
        trailing={
          journalDone
            ? { type: 'done' }
            : { type: 'open', onPress: () => router.push(getTodayJournalRoute(todayLog)) }
        }
      />

      <ChecklistItem
        title="Uống nước"
        sub={`${glasses}/${waterGoal} ly hôm nay`}
        icon={<WaterDropLineIcon size={22} color="#2E6F8E" />}
        iconBg="#DEEBFF"
        iconColor="#2E6F8E"
        trailing={{
          type: 'stepper',
          onMinus: decrementWater,
          onPlus: incrementWater,
          minusDisabled: glasses <= 0,
        }}
      />

      {expanded && (
        <Animated.View
          style={{
            opacity: extraTasksAnim,
            transform: [{
              translateY: extraTasksAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            }],
          }}
        >
          <ChecklistItem
            title="Vận động"
            sub={
              steps == null
                ? 'Chưa có dữ liệu hôm nay'
                : `${steps.toLocaleString('vi-VN')}/${STEP_GOAL.toLocaleString('vi-VN')} bước`
            }
            icon={<StepsLineIcon size={22} color="#A0651A" />}
            iconBg="#F4D8B0"
            iconColor="#A0651A"
            trailing={
              stepsDone
                ? { type: 'done' }
                : { type: 'plus', onPress: syncSteps }
            }
          />

          <ChecklistItem
            title="Thiền"
            sub={`${meditMin}/${meditGoalMin} phút hôm nay`}
            icon={<MeditationLineIcon size={22} color="#3D7A4A" />}
            iconBg="#D8E8D8"
            iconColor="#3D7A4A"
            trailing={
              meditDone
                ? { type: 'done' }
                : { type: 'plus', onPress: () => setMeditModalVisible(true) }
            }
          />

          <ChecklistItem
            title="Giấc ngủ"
            sub={
              sleepMin == null
                ? 'Chưa có dữ liệu đêm qua'
                : `${(sleepMin / 60).toFixed(1)}/8 giờ đêm qua`
            }
            icon={<SleepLineIcon size={22} color="#6B5AAA" />}
            iconBg="#E0D8F0"
            iconColor="#6B5AAA"
            trailing={
              sleepDone
                ? { type: 'done' }
                : { type: 'open', onPress: () => setSleepModalVisible(true) }
            }
          />
        </Animated.View>
      )}

      <MeditationModal
        visible={meditModalVisible}
        onClose={() => setMeditModalVisible(false)}
        onSessionSaved={() => { void load(); }}
      />
      <SleepManualModal
        visible={sleepModalVisible}
        onClose={() => setSleepModalVisible(false)}
        onSaved={(sleep) => {
          setSleepMin(sleep.durationMin);
          void load();
        }}
      />
    </View>
  );
});

DailyChecklist.displayName = 'DailyChecklist';

export default DailyChecklist;
