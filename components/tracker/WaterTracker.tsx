import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/colors';
import api from '../../services/core/api';
import { waterTrackerStyles as s } from '../../styles/tracker/tracker.styles';
import WaterGoalModal from './WaterGoalModal';
import { EncouragementHint } from './MoodEncouragement';
import type { SeverityBand } from '../../services/tracker/encouragement.service';
import { toDateKey } from '../../utils/shared/date.utils';

const todayKey = () => toDateKey(new Date());

interface Props {
  hint?: string | null;
  band?: SeverityBand;
}

export default function WaterTracker({ hint, band }: Props) {
  const [glasses, setGlasses] = useState(0);
  const [goal, setGoal] = useState(8);
  const [avgGlasses, setAvgGlasses] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValue = useRef<number | null>(null);

  const fetchToday = useCallback(async () => {
    try {
      const localDate = todayKey();
      const [todayRes, histRes] = await Promise.all([
        api.get('/water/today', { params: { localDate } }),
        api.get('/water/history', { params: { days: 7 } }),
      ]);
      setGlasses(Number(todayRes.data?.glasses ?? 0));
      setGoal(Number(todayRes.data?.goal ?? 8));
      setAvgGlasses(
        histRes.data?.daysTracked > 0 ? Number(histRes.data.avgGlasses ?? 0) : null
      );
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchToday(); }, [fetchToday]));

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const scheduleSave = (value: number) => {
    pendingValue.current = value;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const v = pendingValue.current;
      if (v == null) return;
      setSaving(true);
      try {
        await api.put('/water', { localDate: todayKey(), glasses: v });
      } catch {
      } finally {
        setSaving(false);
      }
    }, 500);
  };

  const change = (delta: number) => {
    setGlasses(prev => {
      const next = Math.max(0, Math.min(30, prev + delta));
      if (next !== prev) scheduleSave(next);
      return next;
    });
  };

  const saveGoal = async (newGoal: number) => {
    setGoalModalVisible(false);
    if (newGoal === goal) return;
    const prevGoal = goal;
    setGoal(newGoal);
    setSaving(true);
    try {
      await api.put('/water', { localDate: todayKey(), glasses, goal: newGoal });
    } catch {
      setGoal(prevGoal);
    } finally {
      setSaving(false);
    }
  };

  const pct = Math.min(1, glasses / goal);
  const filled = Math.round(pct * 100);

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <TouchableOpacity
          onPress={() => setGoalModalVisible(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={s.title}>Uống nước</Text>
          <Text style={s.subtitle}>
            {loading ? 'Đang tải…' : `Mục tiêu ${goal} ly/ngày  ✏️`}
          </Text>
        </TouchableOpacity>
        {saving && Platform.OS !== 'web' && (
          <ActivityIndicator color={Colors.teal} size="small" />
        )}
      </View>

      <View style={s.mainRow}>
        <TouchableOpacity
          style={[s.counterBtn, glasses === 0 && s.counterBtnDisabled]}
          onPress={() => change(-1)}
          disabled={glasses === 0}
          activeOpacity={0.7}
        >
          <Text style={s.counterBtnText}>−</Text>
        </TouchableOpacity>

        <View style={s.glassWrap}>
          <View style={s.glass}>
            <View style={[s.glassFill, { height: `${filled}%` }]} />
          </View>
          <Text style={s.glassCount}>
            {glasses}<Text style={s.glassCountGoal}>/{goal}</Text>
          </Text>
          <Text style={s.glassLabel}>ly hôm nay</Text>
        </View>

        <TouchableOpacity
          style={s.counterBtn}
          onPress={() => change(1)}
          activeOpacity={0.7}
        >
          <Text style={s.counterBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {avgGlasses != null && (
        <View style={s.footerRow}>
          <Text style={s.footerText}>
            Trung bình 7 ngày: <Text style={s.footerBold}>{avgGlasses.toFixed(1)} ly/ngày</Text>
          </Text>
        </View>
      )}

      <EncouragementHint message={hint ?? null} band={band} />

      <WaterGoalModal
        visible={goalModalVisible}
        initialGoal={goal}
        onClose={() => setGoalModalVisible(false)}
        onConfirm={saveGoal}
      />
    </View>
  );
}
