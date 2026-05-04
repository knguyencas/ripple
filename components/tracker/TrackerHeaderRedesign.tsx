import { View, Text } from 'react-native';
import { useAuthStore } from '../../stores/auth.store';
import { trackerHeaderRedesignStyles as s } from '../../styles/tracker/tracker-redesign.styles';
import { getGreeting } from '../../utils/home/greeting.utils';
import { FireIcon } from '../shared/AppIcons';

interface Props {
  affirmText?: string;
}

export default function TrackerHeaderRedesign({ affirmText }: Props) {
  const user = useAuthStore((s) => s.user);
  const streak = useAuthStore((s) => s.streak);

  const displayName = user?.displayName || user?.username || 'bạn';
  const initials = displayName.slice(0, 1).toUpperCase();
  const today = new Date();

  return (
    <View style={s.wrap}>
      <View style={s.topRow}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <View style={s.textBlock}>
          <Text style={s.greeting} numberOfLines={1}>
            {getGreeting(today)} {displayName}!
          </Text>
        </View>
        <View style={s.streakBadge}>
          <FireIcon size={19} color={streak > 0 ? '#F4A261' : '#D8B58C'} />
          <Text style={s.streakNum}>{streak}</Text>
        </View>
      </View>

      <Text style={s.affirm}>{affirmText ?? 'Hôm nay bạn đang\nlàm rất tốt!'}</Text>
    </View>
  );
}
