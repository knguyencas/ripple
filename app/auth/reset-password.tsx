import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authStyles as styles } from '../../styles/auth/auth.styles';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import api from '../../services/core/api';
import AppBackButton from '../../components/shared/AppBackButton';
import AuthBackdrop from '../../components/auth/AuthBackdrop';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!params.token) {
      setError('Link khôi phục không hợp lệ — thiếu token');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu mới tối thiểu 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token: params.token,
        newPassword: password,
      });
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <AuthBackdrop />

        <View style={styles.header}>
          <AppBackButton style={styles.registerBackButton} />
          <Text style={styles.title}>Đặt mật khẩu mới</Text>
          <Text style={styles.subtitle}>
            Nhập mật khẩu mới cho tài khoản
          </Text>
        </View>

        <View style={styles.form}>
          {done ? (
            <>
              <Text style={styles.hint}>
                Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.
              </Text>
              <Text style={styles.hint}>
                Lưu ý: PIN nhật ký KHÔNG đổi. Khi đăng nhập, bạn vẫn cần PIN cũ để xem media.
              </Text>
              <Button
                title="Đăng nhập"
                onPress={() => router.replace('/auth/login')}
              />
            </>
          ) : (
            <>
              <Input
                label="Mật khẩu mới"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
              />
              <Input
                label="Xác nhận mật khẩu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                secureTextEntry
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                title={loading ? 'Đang xử lý...' : 'Đặt mật khẩu mới'}
                onPress={handleSubmit}
                disabled={loading}
              />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
