import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';
import { homeHeaderStyles as s } from '../../styles/home/home-header.styles';
import { getGreeting } from '../../utils/home/greeting.utils';
import BellIcon from '../shared/BellIcon';

interface Props {
  hasNotification?: boolean;
}

export default function HomeHeader({ hasNotification = false }: Props) {
  const user = useAuthStore((s) => s.user);

  const displayName = user?.displayName || user?.username || 'bạn';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <View style={s.wrap}>
      <View style={s.textBlock}>
        <Text style={s.greeting}>{getGreeting()}</Text>
        <Text style={s.username} numberOfLines={1}>{displayName}</Text>
      </View>

      <View style={s.rightCluster}>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => router.push('/tabs/notifications')}
          accessibilityLabel="Thông báo"
        >
          <BellIcon size={22} />
          {hasNotification && <View style={s.notifDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={s.avatar}
          onPress={() => router.push('/tabs/profile')}
          accessibilityLabel="Hồ sơ"
        >
          <Text style={s.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
