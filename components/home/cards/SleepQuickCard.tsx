import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  quickActionStyles as s,
  QuickActionAccent,
} from '../../../styles/home/quick-actions.styles';
import QuickActionCard from '../QuickActionCard';
import { fetchHealthToday } from '../../../services/tracker/health.service';
import SleepManualModal from '../../tracker/SleepManualModal';

const palette = QuickActionAccent.sleep;
const GOAL_MIN = 8 * 60;

export default function SleepQuickCard() {
  const [durationMin, setDurationMin] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const load = useCallback(async () => {
    const today = await fetchHealthToday();
    const total = today?.sleep?.totalMinutes ?? 0;
    setDurationMin(total > 0 ? total : null);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const hours = durationMin != null ? durationMin / 60 : 0;
  const pct = durationMin != null ? Math.min(1, durationMin / GOAL_MIN) : 0;
  const display = durationMin != null ? hours.toFixed(1) : '—';

  return (
    <QuickActionCard
      title="Giấc ngủ"
      goalLabel="Mục tiêu 8 giờ"
      accent="sleep"
      iconLetter="☾"
    >
      <View style={s.valueRow}>
        <Text style={[s.valueBig, { color: palette.primary }]}>{display}</Text>
        <Text style={s.valueUnit}>/8 giờ</Text>
      </View>

      <View style={[s.progressTrack, { backgroundColor: palette.track }]}>
        <View
          style={[
            s.progressFill,
            { width: `${Math.round(pct * 100)}%`, backgroundColor: palette.dark },
          ]}
        />
      </View>

      <TouchableOpacity
        style={[s.pillBtn, { backgroundColor: palette.soft }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[s.pillBtnText, { color: palette.primary }]}>
          {durationMin == null ? 'Nhập giấc ngủ' : 'Sửa thời gian'}
        </Text>
      </TouchableOpacity>

      <SleepManualModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSaved={(sleep) => {
          setDurationMin(sleep.durationMin);
          void load();
        }}
      />
    </QuickActionCard>
  );
}
