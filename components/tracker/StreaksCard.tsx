import { View, Text } from 'react-native';
import { streaksCardStyles as s } from '../../styles/tracker/tracker-redesign.styles';
import { FireIcon } from '../shared/AppIcons';

interface Props {
  currentStreak: number;
  daysLoggedThisMonth: number;
  totalDaysInMonth: number;
}

export default function StreaksCard({
  currentStreak,
  daysLoggedThisMonth,
  totalDaysInMonth,
}: Props) {
  const safeTotal = Math.max(1, totalDaysInMonth);
  const safeDays = Math.max(0, Math.min(daysLoggedThisMonth, safeTotal));

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <Text style={s.title}>Chuỗi ngày</Text>
      </View>

      <View style={s.divider}>
        <View style={s.monthBlock}>
          <View style={currentStreak === 0 && s.flameMuted}>
            <FireIcon size={28} color={currentStreak > 0 ? '#F4A261' : '#D8B58C'} />
          </View>
        </View>
        <View style={s.body}>
          <Text style={s.bodyTitle}>Chuỗi hiện tại: {currentStreak} ngày</Text>
          <Text style={s.bodyDesc}>
            Bỏ lỡ 1 ngày sẽ làm đứt chuỗi. Tháng này bạn đã ghi {safeDays}/{safeTotal} ngày.
          </Text>
        </View>
      </View>
    </View>
  );
}
