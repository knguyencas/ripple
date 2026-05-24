import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authStyles as styles } from '../../styles/auth/auth.styles';
import Button from '../../components/shared/Button';
import api from '../../services/core/api';
import { useAuthStore } from '../../stores/auth.store';
import AppBackButton from '../../components/shared/AppBackButton';
import AuthBackdrop from '../../components/auth/AuthBackdrop';
import { createMediaKeyEnvelope } from '../../services/journal/media-crypto.service';

const PIN_LENGTH = 6;

interface PinDigitInputProps {
  value: string;
  onChange: (next: string) => void;
  autoFocus?: boolean;
}

function PinDigitInput({ value, onChange, autoFocus }: PinDigitInputProps) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const digits = value.padEnd(PIN_LENGTH, ' ').split('').slice(0, PIN_LENGTH);

  const handleChange = (index: number, text: string) => {
    const ch = text.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    while (arr.length < PIN_LENGTH) arr.push('');
    arr[index] = ch;
    const next = arr.join('').slice(0, PIN_LENGTH).replace(/\s/g, '');
    onChange(next);
    if (ch && index < PIN_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKey = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.pinDigitRow}>
      {digits.map((d, i) => {
        const filled = d.trim().length > 0;
        return (
          <TextInput
            key={i}
            ref={(ref) => {
              inputs.current[i] = ref;
            }}
            style={[styles.pinDigitBox, filled && styles.pinDigitBoxFilled]}
            value={d.trim()}
            onChangeText={(t) => handleChange(i, t)}
            onKeyPress={({ nativeEvent }) => handleKey(i, nativeEvent.key)}
            keyboardType="number-pad"
            secureTextEntry
            placeholder="-"
            placeholderTextColor="#1A3A5C"
            caretHidden
            maxLength={1}
            autoFocus={autoFocus && i === 0}
          />
        );
      })}
    </View>
  );
}

export default function SetupPinScreen() {
  const params = useLocalSearchParams<{ returnTo?: string }>();

  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    setError('');
    if (pin.length !== PIN_LENGTH) {
      setError('PIN phải đủ 6 chữ số');
      return;
    }
    setStep('confirm');
  };

  const handleSubmit = async () => {
    setError('');
    if (confirmPin.length !== PIN_LENGTH) {
      setError('Vui lòng nhập lại đủ 6 chữ số');
      return;
    }
    if (pin !== confirmPin) {
      setError('PIN xác nhận không khớp. Vui lòng nhập lại.');
      setConfirmPin('');
      return;
    }

    setLoading(true);
    try {
      const envelope = await createMediaKeyEnvelope(pin);
      const res = await api.put('/users/media-key', envelope);
      await useAuthStore.getState().updateUser(res.data ?? envelope);

      if (params.returnTo) {
        router.replace(params.returnTo as any);
      } else {
        router.back();
      }
    } catch (err: any) {
      console.error('[setup-pin] handleSubmit failed:', {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
        name: err?.name,
      });
      const beError = err?.response?.data?.error;
      const httpStatus = err?.response?.status;
      let userMessage = 'Tạo PIN thất bại. Vui lòng thử lại.';
      if (beError) {
        userMessage = beError;
      } else if (httpStatus === 401) {
        userMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (httpStatus === 0 || err?.message?.includes('Network')) {
        userMessage = 'Không kết nối được server. Kiểm tra mạng và thử lại.';
      } else if (err?.message?.includes('encryption is not available')) {
        userMessage = 'Module mã hoá chưa sẵn sàng. Vui lòng thử lại sau.';
      } else if (err?.message) {
        userMessage = err.message;
      }
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setConfirmPin('');
      setStep('create');
      setError('');
    } else {
      router.back();
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
          <AppBackButton style={styles.registerBackButton} onPress={handleBack} />
          <Text style={styles.title}>
            {step === 'create' ? 'Tạo PIN bảo vệ media' : 'Xác nhận PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'create'
              ? 'PIN 6 chữ số để mã hoá ảnh và ghi âm trong nhật ký'
              : 'Nhập lại PIN để xác nhận'}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 'create' ? (
            <>
              <PinDigitInput value={pin} onChange={setPin} autoFocus />
              <Text style={styles.hint}>
                PIN này KHÁC mật khẩu đăng nhập. Nếu quên PIN sau khi đăng xuất,{'\n'}
                bạn sẽ MẤT toàn bộ ảnh và ghi âm trong nhật ký.
              </Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button title="Tiếp tục" onPress={handleNext} />
            </>
          ) : (
            <>
              <PinDigitInput value={confirmPin} onChange={setConfirmPin} autoFocus />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                title={loading ? 'Đang lưu...' : 'Hoàn tất'}
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
