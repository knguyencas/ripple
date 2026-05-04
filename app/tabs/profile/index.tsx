import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Switch, Linking, Alert,
  Image, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { Colors } from '../../../constants/colors';
import { profileStyles as s } from '../../../styles/profile/profile.styles';
import { useAuthStore } from '../../../stores/auth.store';
import api from '../../../services/core/api';
import TimePickerModal from '../../../components/profile/TimePickerModal';
import { CameraLineIcon } from '../../../components/shared/AppIcons';
import { uploadUserAvatar } from '../../../services/profile/avatar.service';
import { normalizeAgeGroup } from '../../../utils/profile/age-group.utils';
import {
  getReminderPref, enableReminder, disableReminder,
  formatTime, ReminderPref, DEFAULT_PREF,
} from '../../../services/profile/notification.service';

interface UserStats {
  streak: number;
  totalLogs: number;
  avgMood: number | null;
}

type ProfileIconName =
  | 'user'
  | 'lock'
  | 'bell'
  | 'language'
  | 'help'
  | 'feedback'
  | 'terms'
  | 'clock'
  | 'flame'
  | 'logs'
  | 'mood'
  | 'logout';

function ProfileIcon({
  name,
  size = 20,
  color = '#2E6F8E',
}: {
  name: ProfileIconName;
  size?: number;
  color?: string;
}) {
  const stroke = {
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (name === 'user') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={8} r={3.4} {...stroke} />
        <Path d="M5.5 20c.75-4.1 3.05-6.2 6.5-6.2s5.75 2.1 6.5 6.2" {...stroke} />
      </Svg>
    );
  }

  if (name === 'lock') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x={5.5} y={10} width={13} height={9.5} rx={2.4} {...stroke} />
        <Path d="M8.4 10V7.9a3.6 3.6 0 0 1 7.2 0V10" {...stroke} />
        <Line x1={12} y1={14} x2={12} y2={16.2} {...stroke} />
      </Svg>
    );
  }

  if (name === 'bell') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M6.5 16.2h11l-1.1-1.7v-3.7a4.4 4.4 0 0 0-8.8 0v3.7l-1.1 1.7Z" {...stroke} />
        <Path d="M10 18.2c.5.8 1.1 1.2 2 1.2s1.5-.4 2-1.2" {...stroke} />
      </Svg>
    );
  }

  if (name === 'language') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M4.5 6.5h8M8.5 4.5v2M11 6.5c-.7 4.1-3.1 6.4-6 7.8" {...stroke} />
        <Path d="M6.8 9.2c1.1 2 2.8 3.4 5.1 4.2" {...stroke} />
        <Path d="M14 19.2 17.2 11l3.3 8.2M15.1 16.4h4.2" {...stroke} />
      </Svg>
    );
  }

  if (name === 'help') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={8} {...stroke} />
        <Path d="M9.8 9.2A2.4 2.4 0 0 1 12 7.8c1.4 0 2.5.9 2.5 2.2 0 1.1-.7 1.7-1.6 2.3-.7.5-.9.9-.9 1.7" {...stroke} />
        <Circle cx={12} cy={17} r={0.6} fill={color} />
      </Svg>
    );
  }

  if (name === 'feedback') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M5.2 6.5h13.6v9.2H9.6L5.2 19V6.5Z" {...stroke} />
        <Path d="M8.6 10h6.8M8.6 13h4.8" {...stroke} />
      </Svg>
    );
  }

  if (name === 'terms') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M7 4.8h7.1L18 8.7v10.5H7V4.8Z" {...stroke} />
        <Path d="M14 5v4h4M9.6 12h4.8M9.6 15h4.8" {...stroke} />
      </Svg>
    );
  }

  if (name === 'clock') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={7.8} {...stroke} />
        <Path d="M12 7.8v4.7l3.3 2" {...stroke} />
      </Svg>
    );
  }

  if (name === 'flame') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12.8 3c.15 2.5-.9 4.05-2.2 5.45-1.5 1.6-3.3 3.15-3.3 6.1 0 3.65 2.58 6.25 6.05 6.25 3.58 0 6.35-2.62 6.35-6.48 0-3.32-2.05-5.7-4.08-7.65-.22 1.55-.9 2.75-2.02 3.55.18-2.62-.08-5.13-.8-7.22Z" fill={color} />
        <Path d="M12.05 20.45c-1.72-.5-2.75-1.8-2.75-3.5 0-1.42.78-2.48 1.72-3.38.78-.75 1.35-1.48 1.54-2.58 1.34 1.3 2.3 2.8 2.3 4.66 0 2.02-1.08 3.73-2.81 4.8Z" fill="#FFE0B8" />
      </Svg>
    );
  }

  if (name === 'logs') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x={6} y={4.5} width={12} height={15} rx={2.2} {...stroke} />
        <Path d="M9 9h6M9 12.4h6M9 15.8h3.5" {...stroke} />
      </Svg>
    );
  }

  if (name === 'mood') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={7.8} {...stroke} />
        <Circle cx={9.2} cy={10.3} r={0.8} fill={color} />
        <Circle cx={14.8} cy={10.3} r={0.8} fill={color} />
        <Path d="M8.8 14.2c1.3 1.6 5.1 1.6 6.4 0" {...stroke} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M8.2 5.8h7.6M12 5.8v10.8M8.3 13.1 12 16.8l3.7-3.7M5.7 19.2h12.6" {...stroke} />
    </Svg>
  );
}

function resolveRowPress(label: string): (() => void) | undefined {
  switch (label) {
    case 'Chỉnh sửa hồ sơ':              return () => router.push('/tabs/profile/edit');
    case 'Bảo mật & Mật khẩu':           return () => router.push('/tabs/profile/security');
    case 'Thông báo':                    return () => Linking.openSettings().catch(() => {});
    case 'Ngôn ngữ':                     return () => router.push('/tabs/profile/language');
    case 'Trợ giúp & FAQ':               return () => router.push('/tabs/profile/help');
    case 'Gửi phản hồi':                 return () => router.push('/tabs/profile/feedback');
    case 'Điều khoản & Quyền riêng tư':  return () => router.push('/tabs/profile/terms');
    default: return undefined;
  }
}

const SECTION_ITEMS = [
  {
    title: 'Tài khoản',
    items: [
      { icon: 'user' as ProfileIconName, label: 'Chỉnh sửa hồ sơ',    arrow: true },
      { icon: 'lock' as ProfileIconName, label: 'Bảo mật & Mật khẩu',  arrow: true },
      { icon: 'bell' as ProfileIconName, label: 'Thông báo',             arrow: true },
    ],
  },
  {
    title: 'Cài đặt',
    items: [
      { icon: 'language' as ProfileIconName, label: 'Ngôn ngữ', arrow: true },
    ],
  },
  {
    title: 'Hỗ trợ',
    items: [
      { icon: 'help' as ProfileIconName, label: 'Trợ giúp & FAQ',               arrow: true },
      { icon: 'feedback' as ProfileIconName, label: 'Gửi phản hồi',                 arrow: true },
      { icon: 'terms' as ProfileIconName, label: 'Điều khoản & Quyền riêng tư', arrow: true },
    ],
  },
];

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [reminder, setReminder] = useState<ReminderPref>(DEFAULT_PREF);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null);
  const [avatarOptionsVisible, setAvatarOptionsVisible] = useState(false);
  const [avatarViewerVisible, setAvatarViewerVisible] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const displayName = user?.displayName || user?.username || 'Người dùng';
  const initials = displayName.slice(0, 2).toUpperCase();
  const ageGroupLabel = normalizeAgeGroup(user?.ageGroup);

  useEffect(() => {
    setAvatar(user?.avatar ?? null);
  }, [user?.avatar]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const res = await api.get('/users/stats');
          setStats(res.data);
        } catch (e) {
          console.error('stats fetch failed:', e);
        }
        const p = await getReminderPref();
        setReminder(p);
      })();
    }, [])
  );

  const handleToggleReminder = (next: boolean) => {
    if (next) {
      setPickerVisible(true);
    } else {
      disableReminder().then(() => setReminder((r) => ({ ...r, enabled: false })));
    }
  };

  const handleConfirmTime = async (hour: number, minute: number) => {
    setPickerVisible(false);
    const ok = await enableReminder(hour, minute);
    if (ok) {
      setReminder({ enabled: true, hour, minute });
    } else {
      setReminder({ enabled: false, hour, minute });
      Alert.alert(
        'Cần quyền thông báo',
        'Ripple cần quyền gửi thông báo. Vui lòng bật trong cài đặt máy.',
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Mở cài đặt', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const ensurePhotoLibraryPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(false);
    const allowed = permission.granted && permission.accessPrivileges !== 'none';

    if (!allowed) {
      Alert.alert(
        'Cần quyền truy cập ảnh',
        'Bạn có thể cấp quyền truy cập một phần hoặc toàn bộ thư viện ảnh để chọn avatar.',
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Mở cài đặt', onPress: () => Linking.openSettings().catch(() => {}) },
        ]
      );
      return false;
    }

    if (permission.accessPrivileges === 'limited') {
      Alert.alert(
        'Quyền ảnh một phần',
        'Bạn đang chỉ cho Ripple xem một số ảnh đã chọn. Nếu không thấy ảnh cần dùng, hãy cấp thêm ảnh hoặc đổi sang toàn bộ thư viện trong cài đặt.'
      );
    }

    return true;
  };

  const showAvatar = () => {
    setAvatarOptionsVisible(false);
    if (!avatar) {
      Alert.alert('Chưa có ảnh đại diện', 'Bạn có thể tải ảnh lên để đặt avatar.');
      return;
    }
    setAvatarViewerVisible(true);
  };

  const pickAvatar = async () => {
    setAvatarOptionsVisible(false);
    const ok = await ensurePhotoLibraryPermission();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset) return;

    setUploadingAvatar(true);
    try {
      const updated = await uploadUserAvatar({
        uri: asset.uri,
        file: asset.file,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
      const nextAvatar = updated?.avatar ?? null;
      setAvatar(nextAvatar);
      await updateUser({ avatar: nextAvatar });
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.error || 'Không thể tải ảnh đại diện lên.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const openAvatarOptions = () => setAvatarOptionsVisible(true);

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

        <View style={s.header}>
          <Text style={s.headerTitle}>Hồ sơ</Text>
        </View>

        <TouchableOpacity
          style={s.avatarCard}
          onPress={() => router.push('/tabs/profile/edit')}
          activeOpacity={0.84}
        >
          <TouchableOpacity
            style={s.avatarWrap}
            onPress={openAvatarOptions}
            activeOpacity={0.84}
            accessibilityRole="button"
            accessibilityLabel="Tuỳ chọn ảnh đại diện"
          >
            <View style={s.avatarCircle}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={s.avatarImage} resizeMode="cover" />
              ) : (
                <Text style={s.avatarText}>{initials}</Text>
              )}
            </View>
            <View style={s.avatarCameraBadge}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <CameraLineIcon size={14} />
              )}
            </View>
          </TouchableOpacity>
          <View style={s.avatarInfo}>
            <Text style={s.avatarName}>{displayName}</Text>
            <Text style={s.avatarSub}>@{user?.username}</Text>
            {ageGroupLabel && (
              <Text style={s.avatarAge}>Nhóm tuổi: {ageGroupLabel}</Text>
            )}
          </View>
          <Text style={s.avatarChevron}>›</Text>
        </TouchableOpacity>


        <View style={s.streakCard}>
          <View style={s.streakLeft}>
            <View style={s.statTopRow}>
              <View style={s.statIconBox}>
                <ProfileIcon name="flame" size={22} color="#F4A261" />
              </View>
              <Text style={s.streakNum}>
                {stats != null ? `${stats.streak}` : '—'}
              </Text>
            </View>
            <Text style={s.streakLabel}>Streak</Text>
          </View>
          <View style={s.streakDivider} />
          <View style={s.streakRight}>
            <View style={s.statTopRow}>
              <View style={s.statIconBox}>
                <ProfileIcon name="logs" size={20} />
              </View>
              <Text style={s.streakNum}>{stats != null ? stats.totalLogs : '—'}</Text>
            </View>
            <Text style={s.streakLabel}>Logs</Text>
          </View>
          <View style={s.streakDivider} />
          <View style={s.streakRight}>
            <View style={s.statTopRow}>
              <View style={s.statIconBox}>
                <ProfileIcon name="mood" size={20} />
              </View>
              <Text style={s.streakNum}>
                {stats?.avgMood != null ? stats.avgMood.toFixed(1) : '—'}
              </Text>
            </View>
            <Text style={s.streakLabel}>Mood points</Text>
          </View>
        </View>

        <TouchableOpacity
          style={s.reminderCard}
          onPress={() => reminder.enabled && setPickerVisible(true)}
          activeOpacity={reminder.enabled ? 0.7 : 1}
        >
          <View style={s.reminderLeft}>
            <View style={s.settingIconBox}>
              <ProfileIcon name="clock" size={20} />
            </View>
            <View>
              <Text style={s.reminderLabel}>Nhắc nhở hàng ngày</Text>
              <Text style={s.reminderSub}>
                {reminder.enabled
                  ? `Mỗi ngày lúc ${formatTime(reminder.hour, reminder.minute)}, chạm để đổi giờ`
                  : 'Nhắc bạn ghi journal mỗi ngày'}
              </Text>
            </View>
          </View>
          <Switch
            value={reminder.enabled}
            onValueChange={handleToggleReminder}
            trackColor={{ true: Colors.teal, false: Colors.border }}
            thumbColor={Colors.textLight}
          />
        </TouchableOpacity>

        <TimePickerModal
          visible={pickerVisible}
          initialHour={reminder.hour}
          initialMinute={reminder.minute}
          onClose={() => setPickerVisible(false)}
          onConfirm={handleConfirmTime}
        />

        <Modal visible={avatarViewerVisible} transparent animationType="fade" onRequestClose={() => setAvatarViewerVisible(false)}>
          <View style={s.avatarViewerOverlay}>
            <TouchableOpacity
              style={s.avatarViewerClose}
              onPress={() => setAvatarViewerVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Đóng ảnh đại diện"
            >
              <Text style={s.avatarViewerCloseText}>×</Text>
            </TouchableOpacity>
            {avatar && (
              <Image source={{ uri: avatar }} style={s.avatarViewerImage} resizeMode="contain" />
            )}
          </View>
        </Modal>

        <Modal visible={avatarOptionsVisible} transparent animationType="slide" onRequestClose={() => setAvatarOptionsVisible(false)}>
          <TouchableOpacity
            style={s.avatarOptionBackdrop}
            activeOpacity={1}
            onPress={() => setAvatarOptionsVisible(false)}
          >
            <View style={s.avatarOptionSheet}>
              <Text style={s.avatarOptionTitle}>Ảnh đại diện</Text>
              <TouchableOpacity style={[s.avatarOptionBtn, s.avatarOptionBtnBorder]} onPress={showAvatar}>
                <Text style={s.avatarOptionText}>Xem ảnh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.avatarOptionBtn} onPress={pickAvatar}>
                <Text style={s.avatarOptionText}>Tải ảnh lên</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.avatarOptionBtn, s.avatarOptionCancel]}
                onPress={() => setAvatarOptionsVisible(false)}
              >
                <Text style={[s.avatarOptionText, s.avatarOptionCancelText]}>Huỷ</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {SECTION_ITEMS.map((section, si) => (
          <View key={si} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.sectionCard}>
              {section.items.map((item, ii) => {
                const onPress = resolveRowPress(item.label);
                return (
                  <TouchableOpacity
                    key={ii}
                    style={[
                      s.settingRow,
                      ii < section.items.length - 1 && s.settingRowBorder,
                    ]}
                    onPress={onPress}
                    disabled={!onPress}
                  >
                    <View style={s.settingIconBox}>
                      <ProfileIcon name={item.icon} size={20} />
                    </View>
                    <Text style={s.settingLabel}>{item.label}</Text>
                    {item.arrow && <Text style={s.settingArrow}>›</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}


        <View style={s.section}>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <ProfileIcon name="logout" size={18} color={Colors.alertHigh} />
            <Text style={s.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.version}>Ripple v1.0.0</Text>
        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
