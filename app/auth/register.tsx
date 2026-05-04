import { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { authStyles as styles } from '../../styles/auth/auth.styles';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import api from '../../services/core/api';
import { useAuthStore } from '../../stores/auth.store';
import AppBackButton from '../../components/shared/AppBackButton';
import { AppleIcon, GoogleIcon } from '../../components/shared/AppIcons';
import AuthBackdrop from '../../components/auth/AuthBackdrop';
import { createMediaKeyEnvelope } from '../../services/journal/media-crypto.service';

function friendlyRegisterError(error: unknown): string {
  const raw =
    (error as any)?.response?.data?.error ||
    (error as any)?.message ||
    '';
  const message = String(raw).toLowerCase();

  if (message.includes('username') || message.includes('tên đăng nhập')) {
    return 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.';
  }
  if (message.includes('email')) {
    return 'Email đã được sử dụng. Vui lòng nhập email khác.';
  }
  if (message.includes('unique') || message.includes('tồn tại')) {
    return 'Tên đăng nhập hoặc email đã tồn tại. Vui lòng nhập lại.';
  }

  return raw || 'Đăng ký thất bại. Vui lòng thử lại.';
}

export default function RegisterScreen() {
  const [form, setForm] = useState({
  email: '',
  username: '',
  password: '',
});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSocialAuth = (provider: 'Google' | 'Apple') => {
    Alert.alert(
      `Đăng ký bằng ${provider}`,
      'Cần kết nối OAuth ở backend trước khi đăng ký bằng tài khoản này.'
    );
  };

  const handleRegister = async () => {
    if (!form.username || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const mediaKeyEnvelope = await createMediaKeyEnvelope(form.password);
      const res = await api.post('/auth/register', { ...form, ...mediaKeyEnvelope });
      await setAuth(res.data.token, res.data.user);
      router.replace('/auth/display-name');
    } catch (err: any) {
      setError(friendlyRegisterError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AuthBackdrop />

        <View style={styles.header}>
          <AppBackButton style={styles.registerBackButton} />
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Bắt đầu hành trình cảm xúc của bạn</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email (không bắt buộc)"
            value={form.email}
            onChangeText={(v) => update('email', v)}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Tên người dùng"
            value={form.username}
            onChangeText={(v) => update('username', v)}
            placeholder="username"
            autoCapitalize="none"
          />

          <Input
            label="Mật khẩu"
            value={form.password}
            onChangeText={(v) => update('password', v)}
            placeholder="••••••••"
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            onPress={handleRegister}
            disabled={loading}
          />

          <View style={styles.socialSection}>
            <View style={styles.socialDividerRow}>
              <View style={styles.socialDivider} />
              <Text style={styles.socialDividerText}>hoặc đăng ký với</Text>
              <View style={styles.socialDivider} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialAuth('Google')}
                activeOpacity={0.82}
              >
                <GoogleIcon size={20} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialAuth('Apple')}
                activeOpacity={0.82}
              >
                <AppleIcon size={20} />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.btnSecondaryText}>
              Đã có tài khoản?{' '}
              <Text style={styles.btnSecondaryLink}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
