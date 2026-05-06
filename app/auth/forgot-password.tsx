import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { authStyles as styles } from '../../styles/auth/auth.styles';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import api from '../../services/core/api';
import AppBackButton from '../../components/shared/AppBackButton';
import AuthBackdrop from '../../components/auth/AuthBackdrop';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Không gửi được. Vui lòng thử lại.');
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
          <Text style={styles.title}>Quên mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập email của tài khoản để nhận link đặt lại mật khẩu
          </Text>
        </View>

        <View style={styles.form}>
          {submitted ? (
            <>
              <Text style={styles.hint}>
                Nếu email khớp với tài khoản trên Ripple, link khôi phục đã được gửi.{'\n'}
                Hãy kiểm tra hộp thư (cả Spam/Junk). Link có hiệu lực trong 60 phút.
              </Text>
              <Text style={styles.hint}>
                Đặt lại mật khẩu KHÔNG đặt lại PIN. Bạn vẫn cần PIN cũ để xem nhật ký.
              </Text>
              <Button
                title="Quay lại đăng nhập"
                onPress={() => router.replace('/auth/login')}
              />
            </>
          ) : (
            <>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                title={loading ? 'Đang gửi...' : 'Gửi link khôi phục'}
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
