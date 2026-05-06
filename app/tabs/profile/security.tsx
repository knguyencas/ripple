import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { commonStyles as c } from '../../../styles/shared/common.styles';
import { profileStyles as s } from '../../../styles/profile/profile.styles';
import {
  profilePageStyles as p,
  profileSecurityPageStyles as ps,
} from '../../../styles/profile/profile-pages.styles';
import api from '../../../services/core/api';
import AppBackButton from '../../../components/shared/AppBackButton';
import { useAuthStore } from '../../../stores/auth.store';
import { hasCompleteMediaKeyEnvelope } from '../../../services/journal/media-crypto.service';

export default function SecurityScreen() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const user = useAuthStore((s) => s.user);
  const hasPin = hasCompleteMediaKeyEnvelope(user);

  const handleSave = async () => {
    setError('');
    if (!current || !next || !confirm) {
      setError('Vui lòng nhập đầy đủ các trường.');
      return;
    }
    if (next.length < 6) {
      setError('Mật khẩu mới tối thiểu 6 ký tự.');
      return;
    }
    if (next !== confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (next === current) {
      setError('Mật khẩu mới phải khác mật khẩu cũ.');
      return;
    }

    setSaving(true);
    try {
      // Path 2: password CHỈ dùng để auth, không liên quan đến media envelope.
      // → Đổi password thuần, không cần re-wrap envelope.
      await api.put('/users/password', {
        currentPassword: current,
        newPassword: next,
      });

      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
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
            <Text style={s.headerTitle}>Bảo mật & Mật khẩu</Text>
          </View>

          <View style={p.content}>
            <Text style={ps.label}>Mật khẩu hiện tại</Text>
            <TextInput
              style={ps.input}
              value={current}
              onChangeText={setCurrent}
              placeholder="Nhập mật khẩu hiện tại"
              placeholderTextColor="#9BB5C4"
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={[ps.label, ps.labelTopSpacing]}>Mật khẩu mới</Text>
            <Text style={ps.hint}>Ít nhất 6 ký tự.</Text>
            <TextInput
              style={ps.input}
              value={next}
              onChangeText={setNext}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor="#9BB5C4"
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={[ps.label, ps.labelTopSpacing]}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={ps.input}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor="#9BB5C4"
              secureTextEntry
              autoCapitalize="none"
            />

            {error ? <Text style={ps.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[ps.saveBtn, saving && ps.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.textLight} />
              ) : (
                <Text style={ps.saveBtnText}>Đổi mật khẩu</Text>
              )}
            </TouchableOpacity>

            {hasPin ? (
              <TouchableOpacity
                style={[ps.saveBtn, { marginTop: 16, backgroundColor: '#5B7E91' }]}
                onPress={() => router.push('/tabs/profile/change-pin')}
              >
                <Text style={ps.saveBtnText}>Đổi PIN nhật ký</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[ps.saveBtn, { marginTop: 16, backgroundColor: '#2E6F8E' }]}
                onPress={() => router.push('/auth/setup-pin')}
              >
                <Text style={ps.saveBtnText}>Tạo PIN bảo vệ media</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
