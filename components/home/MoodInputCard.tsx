import { View, Text, TouchableOpacity } from 'react-native';
import { moodInputCardStyles as s } from '../../styles/home/mood-input-card.styles';
import { Heart } from '../shared/Heart';
import { SoraMoodIcon, type SoraMoodExpression } from '../shared/Sora';

interface Props {
  loggedToday: boolean;
  todayMoodLabel?: string | null;
  todayMoodExpression?: SoraMoodExpression | null;
  todayNote?: string | null;
  onPress: () => void;
}

export default function MoodInputCard({
  loggedToday,
  todayMoodLabel,
  todayMoodExpression,
  todayNote,
  onPress,
}: Props) {
  return (
    <View style={s.wrap}>
      <Text style={s.prompt}>Hôm nay tâm trạng bạn thế nào?</Text>
      <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
        <View style={[s.halo, loggedToday && s.haloLogged]}>
          {loggedToday && todayMoodExpression ? (
            <SoraMoodIcon size={58} expression={todayMoodExpression} />
          ) : (
            <Heart size={48} withHalo={false} idPrefix="home-mood-heart" />
          )}
        </View>
        <Text style={s.title}>
          {loggedToday
            ? (todayMoodLabel ?? 'Đã ghi tâm trạng hôm nay')
            : 'Chạm để ghi lại tâm trạng'}
        </Text>
        <Text style={s.sub}>
          {loggedToday ? 'Chạm để cập nhật' : 'Chọn mood bằng emotion wheel'}
        </Text>
        {loggedToday && todayNote ? (
          <Text style={s.loggedNote} numberOfLines={2}>{todayNote}</Text>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}
