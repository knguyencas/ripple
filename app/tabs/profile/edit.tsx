import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../../constants/colors';
import { commonStyles as c } from '../../../styles/shared/common.styles';
import { profileStyles as s } from '../../../styles/profile/profile.styles';
import {
  profileEditPageStyles as ps,
  profilePageStyles as p,
} from '../../../styles/profile/profile-pages.styles';
import api from '../../../services/core/api';
import { useAuthStore } from '../../../stores/auth.store';
import AppBackButton from '../../../components/shared/AppBackButton';
import { CameraLineIcon } from '../../../components/shared/AppIcons';
import { uploadUserAvatar } from '../../../services/profile/avatar.service';
import { AGE_GROUP_OPTIONS, normalizeAgeGroup } from '../../../utils/profile/age-group.utils';

const AGE_OPTIONS = [...AGE_GROUP_OPTIONS];

export default function EditProfileScreen() {
  const { user, token, updateUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [ageGroup, setAgeGroup] = useState<string>(normalizeAgeGroup(user?.ageGroup) ?? '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null);
  const [avatarOptionsVisible, setAvatarOptionsVisible] = useState(false);
  const [avatarViewerVisible, setAvatarViewerVisible] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const displayInitials = (displayName || user?.username || 'U').slice(0, 2).toUpperCase();

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
    setError('');
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

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.put(
        '/users/me',
        {
          displayName: displayName.trim() || null,
          ageGroup: ageGroup || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await updateUser({
        displayName: res.data?.displayName ?? null,
        ageGroup: res.data?.ageGroup ?? null,
      });

      router.back();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Không thể lưu. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={c.safe}>
      <KeyboardAvoidingView
        style={p.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={p.scrollBottom}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <AppBackButton />
            <Text style={s.headerTitle}>Chỉnh sửa hồ sơ</Text>
          </View>

          <View style={p.content}>
            <TouchableOpacity
              style={ps.avatarPreview}
              onPress={openAvatarOptions}
              activeOpacity={0.84}
              accessibilityRole="button"
              accessibilityLabel="Tuỳ chọn ảnh đại diện"
            >
              <View style={ps.avatarPreviewCircle}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={ps.avatarPreviewImage} resizeMode="cover" />
                ) : (
                  <Text style={ps.avatarPreviewText}>{displayInitials}</Text>
                )}
              </View>
              <View style={ps.avatarCameraBadge}>
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <CameraLineIcon size={15} />
                )}
              </View>
            </TouchableOpacity>

            <Text style={ps.label}>Tên hiển thị</Text>
            <Text style={ps.hint}>Tên mà Ripple sẽ dùng để gọi bạn.</Text>
            <TextInput
              style={ps.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={user?.username || 'Nhập tên của bạn'}
              placeholderTextColor="#9BB5C4"
              maxLength={50}
            />

            <Text style={[ps.label, ps.labelTopSpacing]}>Nhóm tuổi</Text>
            <Text style={ps.hint}>Giúp cá nhân hóa phản hồi của AI.</Text>
            <View style={ps.ageRow}>
              {AGE_OPTIONS.map((option) => {
                const selected = ageGroup === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[ps.ageChip, selected && ps.ageChipActive]}
                    onPress={() => setAgeGroup(selected ? '' : option)}
                  >
                    <Text style={[ps.ageChipText, selected && ps.ageChipTextActive]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {error ? <Text style={ps.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[ps.saveBtn, saving && ps.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.textLight} />
              ) : (
                <Text style={ps.saveBtnText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={avatarViewerVisible} transparent animationType="fade" onRequestClose={() => setAvatarViewerVisible(false)}>
        <View style={ps.avatarViewerOverlay}>
          <TouchableOpacity
            style={ps.avatarViewerClose}
            onPress={() => setAvatarViewerVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Đóng ảnh đại diện"
          >
            <Text style={ps.avatarViewerCloseText}>×</Text>
          </TouchableOpacity>
          {avatar && (
            <Image source={{ uri: avatar }} style={ps.avatarViewerImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

      <Modal visible={avatarOptionsVisible} transparent animationType="slide" onRequestClose={() => setAvatarOptionsVisible(false)}>
        <TouchableOpacity
          style={ps.avatarOptionBackdrop}
          activeOpacity={1}
          onPress={() => setAvatarOptionsVisible(false)}
        >
          <View style={ps.avatarOptionSheet}>
            <Text style={ps.avatarOptionTitle}>Ảnh đại diện</Text>
            <TouchableOpacity style={[ps.avatarOptionBtn, ps.avatarOptionBtnBorder]} onPress={showAvatar}>
              <Text style={ps.avatarOptionText}>Xem ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ps.avatarOptionBtn} onPress={pickAvatar}>
              <Text style={ps.avatarOptionText}>Tải ảnh lên</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[ps.avatarOptionBtn, ps.avatarOptionCancel]}
              onPress={() => setAvatarOptionsVisible(false)}
            >
              <Text style={[ps.avatarOptionText, ps.avatarOptionCancelText]}>Huỷ</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
