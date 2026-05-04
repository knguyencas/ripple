import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import api from '../../../services/core/api';
import { toDateKey } from '../../../utils/shared/date.utils';
import {
  quickActionStyles as s,
  QuickActionAccent,
} from '../../../styles/home/quick-actions.styles';
import QuickActionCard from '../QuickActionCard';

const palette = QuickActionAccent.water;

const todayKey = () => toDateKey(new Date());

interface Props {
  onTaskStateChanged?: () => void;
}

export default function WaterQuickCard({ onTaskStateChanged }: Props) {
  const [glasses, setGlasses] = useState(0);
  const [goal, setGoal] = useState(8);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValue = useRef<number | null>(null);

  const fetchToday = useCallback(async () => {
    try {
      const res = await api.get('/water/today', { params: { localDate: todayKey() } });
      setGlasses(Number(res.data?.glasses ?? 0));
      setGoal(Number(res.data?.goal ?? 8));
    } catch {
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
      try {
        await api.put('/water', { localDate: todayKey(), glasses: v });
      } catch {
      }
    }, 500);
  };

  const change = (delta: number) => {
    setGlasses((prev) => {
      const next = Math.max(0, Math.min(30, prev + delta));
      if (next !== prev) {
        scheduleSave(next);
        onTaskStateChanged?.();
      }
      return next;
    });
  };

  const pct = Math.min(1, glasses / goal);

  return (
    <QuickActionCard
      title="Uống nước"
      goalLabel={`Mục tiêu ${goal} ly`}
      accent="water"
      iconLetter="💧"
    >
      <View style={s.valueRow}>
        <Text style={[s.valueBig, { color: palette.primary }]}>{glasses}</Text>
        <Text style={s.valueUnit}>/{goal} ly</Text>
      </View>

      <View style={[s.progressTrack, { backgroundColor: palette.track }]}>
        <View
          style={[
            s.progressFill,
            { width: `${Math.round(pct * 100)}%`, backgroundColor: palette.dark },
          ]}
        />
      </View>

      <View style={s.actionRow}>
        <TouchableOpacity
          style={[
            s.pillBtn,
            { backgroundColor: palette.soft },
            glasses === 0 && s.pillBtnDisabled,
          ]}
          onPress={() => change(-1)}
          disabled={glasses === 0}
          activeOpacity={0.7}
        >
          <Text style={[s.pillBtnText, { color: '#1A3A4A' }]}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.pillBtn, s.pillBtnPrimary, { backgroundColor: palette.dark }]}
          onPress={() => change(1)}
          activeOpacity={0.85}
        >
          <Text style={[s.pillBtnText, { color: '#FFFFFF' }]}>+ Thêm</Text>
        </TouchableOpacity>
      </View>
    </QuickActionCard>
  );
}
