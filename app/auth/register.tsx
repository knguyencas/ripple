import { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { authStyles as styles } from '../../styles/auth/auth.styles';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import AppBackButton from '../../components/shared/AppBackButton';
import { AppleIcon, GoogleIcon } from '../../components/shared/AppIcons';
import AuthBackdrop from '../../components/auth/AuthBackdrop';
import api from '../../services/core/api';
import { useAuthStore } from '../../stores/auth.store';

function friendlyRegisterError(error: unknown): string {
  const raw =
    (error as any)?.response?.data?.error || (error as any)?.message || '';
  const message = String(raw).toLowerCase();
  if (message.includes('username') || message.includes('tên đăng nhập')) {
    return 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.';
  }
  if (message.includes('email')) {
    return 'Email đã được sử dụng. Vui lòng nhập email khác.';
  }
  if (message.includes('unique') || message.includes('tồn tại')) {
    return 'Tên đăng nhập hoặc email đã tồn tại.';
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
  const setAuth = useAuthStore((s) => s.setAuth);

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
      setError('Vui lòng điền tên đăng nhập và mật khẩu');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Email không hợp lệ');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // KHÔNG kèm envelope — PIN sẽ tạo sau khi user lần đầu dùng media
      const res = await api.post('/auth/register', {
        username: form.username,
        password: form.password,
        ...(form.email ? { email: form.email } : {}),
      });
      await setAuth(res.data.token, res.data.user);
      router.replace('/auth/display-name');
    } catch (err) {
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
          {!form.email && (
            <Text style={styles.warning}>
              ⚠️ Không có email = không khôi phục được mật khẩu nếu quên.
            </Text>
          )}

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
