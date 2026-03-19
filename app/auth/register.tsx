import { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { authStyles as styles } from '../../styles/auth.styles';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth.store';

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

  const handleRegister = async () => {
    if (!form.email || !form.username || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', form);
      await setAuth(res.data.token, res.data.user);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const ageGroups = ['< 18', '18-22', '23-27', '28-35', '35+'];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.wave1} />
        <View style={styles.wave2} />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Quay lại</Text>
          </TouchableOpacity>
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

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.btnSecondaryText}>
              Đã có tài khoản?{' '}
              <Text style={{ color: Colors.teal, fontWeight: '600' }}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}