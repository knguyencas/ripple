import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { commonStyles as c } from '../../styles/shared/common.styles';
import { profileStyles as s } from '../../styles/profile/profile.styles';
import { profilePageStyles as p } from '../../styles/profile/profile-pages.styles';
import { notificationsStyles as n } from '../../styles/profile/notifications.styles';
import { Colors } from '../../constants/colors';
import {
  AppNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/profile/notifications.service';
import AppBackButton from '../../components/shared/AppBackButton';

function formatNotificationDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsScreen() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetchNotifications();
      setItems(res.items);
      setUnreadCount(res.unreadCount);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handlePressItem = async (item: AppNotification) => {
    if (!item.readAt) {
      setItems((prev) =>
        prev.map((nItem) =>
          nItem.id === item.id ? { ...nItem, readAt: new Date().toISOString() } : nItem
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      await markNotificationRead(item.id).catch(() => {});
    }
  };

  const handleMarkAllRead = async () => {
    setItems((prev) =>
      prev.map((item) => item.readAt ? item : { ...item, readAt: new Date().toISOString() })
    );
    setUnreadCount(0);
    await markAllNotificationsRead().catch(() => {});
  };

  return (
    <SafeAreaView style={c.safe}>
      <ScrollView
        contentContainerStyle={p.scrollBottom}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />
        }
      >
        <View style={s.header}>
          <AppBackButton />
          <Text style={s.headerTitle}>Thông báo</Text>
        </View>

        <View style={p.content}>
          {unreadCount > 0 && (
            <TouchableOpacity style={n.markAllButton} onPress={handleMarkAllRead}>
              <Text style={n.markAllText}>Đánh dấu tất cả đã đọc</Text>
            </TouchableOpacity>
          )}

          {loading ? (
            <ActivityIndicator style={n.loading} color={Colors.teal} />
          ) : items.length === 0 ? (
            <View style={n.empty}>
              <Text style={n.emptyTitle}>Chưa có thông báo</Text>
              <Text style={n.emptyBody}>
                Khi có lời nhắn từ Sora, nhắc nhở ghi journal, hoặc thông tin chuỗi ngày,
                chúng sẽ xuất hiện ở đây.
              </Text>
            </View>
          ) : (
            <View style={n.list}>
              {items.map((item) => {
                const unread = !item.readAt;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[n.item, unread && n.itemUnread]}
                    onPress={() => handlePressItem(item)}
                    activeOpacity={0.82}
                  >
                    <View style={n.itemHeader}>
                      <Text style={n.itemTitle}>{item.title}</Text>
                      {unread && <View style={n.unreadDot} />}
                    </View>
                    <Text style={n.itemBody}>{item.body}</Text>
                    <Text style={n.itemTime}>{formatNotificationDate(item.createdAt)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
