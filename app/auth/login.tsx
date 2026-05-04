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
import { AppleIcon, GoogleIcon } from '../../components/shared/AppIcons';
import AuthBackdrop from '../../components/auth/AuthBackdrop';
import {
  createMediaKeyEnvelope,
  hasCompleteMediaKeyEnvelope,
  unlockMediaKeyFromPassword,
} from '../../services/journal/media-crypto.service';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSocialAuth = (provider: 'Google' | 'Apple') => {
    Alert.alert(
      `Đăng nhập bằng ${provider}`,
      'Cần kết nối OAuth ở backend trước khi đăng nhập bằng tài khoản này.'
    );
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { username, password });
      const token = res.data.token;
      let user = res.data.user;

      if (hasCompleteMediaKeyEnvelope(user)) {
        await unlockMediaKeyFromPassword(password, user);
      } else {
        const envelope = await createMediaKeyEnvelope(password);
        const keyRes = await api.put('/users/media-key', envelope, {
          headers: { Authorization: `Bearer ${token}` },
        });
        user = { ...user, ...keyRes.data };
      }

      await setAuth(token, user);
      router.replace('/tabs/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
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

        <View style={styles.headerCentered}>
          <Text style={styles.title}>Ripple</Text>
          <Text style={styles.subtitle}>Chào mừng trở lại</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Tên người dùng"
            value={username}
            onChangeText={setUsername}
            placeholder="username"
            autoCapitalize="none"
          />

          <Input
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            onPress={handleLogin}
            disabled={loading}
          />

          <View style={styles.socialSection}>
            <View style={styles.socialDividerRow}>
              <View style={styles.socialDivider} />
              <Text style={styles.socialDividerText}>hoặc tiếp tục với</Text>
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
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.btnSecondaryText}>
              Chưa có tài khoản?{' '}
              <Text style={styles.btnSecondaryLink}>Đăng ký</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
