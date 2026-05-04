import { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  quickActionStyles as s,
  QuickActionAccent,
} from '../../../styles/home/quick-actions.styles';
import QuickActionCard from '../QuickActionCard';
import { fetchToday, type MeditationToday } from '../../../services/tracker/meditation.service';
import { toDateKey } from '../../../utils/shared/date.utils';
import MeditationModal from '../../tracker/MeditationModal';

const palette = QuickActionAccent.meditate;

interface Props {
  onTaskStateChanged?: () => void;
}

export default function MeditateQuickCard({ onTaskStateChanged }: Props) {
  const [data, setData] = useState<MeditationToday | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const load = useCallback(async () => {
    const today = await fetchToday(toDateKey(new Date()));
    setData(today);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const totalMin = data?.totalMinutes ?? 0;
  const goalMin = data?.goalMin ?? 10;
  const pct = Math.min(1, totalMin / goalMin);

  const buttonLabel =
    totalMin === 0 ? 'Bắt đầu'
    : totalMin >= goalMin ? 'Thiền thêm'
    : 'Tiếp tục';

  return (
    <>
      <QuickActionCard
        title="Thiền"
        goalLabel={`Mục tiêu ${goalMin} phút`}
        accent="meditate"
        iconLetter="♧"
      >
        <View style={s.valueRow}>
          <Text style={[s.valueBig, { color: palette.primary }]}>{totalMin}</Text>
          <Text style={s.valueUnit}>/{goalMin} phút</Text>
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
          style={[s.pillBtn, { backgroundColor: palette.dark }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={[s.pillBtnText, { color: '#FFFFFF' }]}>{buttonLabel}</Text>
        </TouchableOpacity>
      </QuickActionCard>

      <MeditationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSessionSaved={() => {
          void load();
          onTaskStateChanged?.();
        }}
      />
    </>
  );
}
