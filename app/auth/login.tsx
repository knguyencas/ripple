import { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { authStyles as styles } from '../../styles/auth/auth.styles';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import api from '../../services/core/api';
import { useAuthStore } from '../../stores/auth.store';
import AuthBackdrop from '../../components/auth/AuthBackdrop';
import { hasCompleteMediaKeyEnvelope } from '../../services/journal/media-crypto.service';
import { setPendingAuth } from '../../services/auth/pending-auth';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);

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
      const user = res.data.user;

      if (hasCompleteMediaKeyEnvelope(user)) {
        // Có envelope → cần PIN để unlock. Stash token+user, qua màn unlock-pin.
        setPendingAuth({ token, user });
        router.replace('/auth/unlock-pin');
      } else {
        // Legacy/no-envelope user (cực hiếm sau khi tách flow). Login thẳng.
        await setAuth(token, user);
        router.replace('/tabs/home');
      }
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

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/auth/forgot-password')}
          >
            <Text style={styles.btnSecondaryLink}>Quên mật khẩu?</Text>
          </TouchableOpacity>


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
