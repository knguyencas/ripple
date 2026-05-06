import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles as c } from '../../../styles/shared/common.styles';
import { profileStyles as s } from '../../../styles/profile/profile.styles';
import {
  profilePageStyles as p,
  profileSecurityPageStyles as ps,
} from '../../../styles/profile/profile-pages.styles';
import { authStyles as authS } from '../../../styles/auth/auth.styles';
import api from '../../../services/core/api';
import AppBackButton from '../../../components/shared/AppBackButton';
import Button from '../../../components/shared/Button';
import { useAuthStore } from '../../../stores/auth.store';
import {
  isMediaKeyUnlocked,
  rewrapMediaKey,
} from '../../../services/journal/media-crypto.service';

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
    <View style={authS.pinDigitRow}>
      {digits.map((d, i) => {
        const filled = d.trim().length > 0;
        return (
          <TextInput
            key={i}
            ref={(ref) => {
              inputs.current[i] = ref;
            }}
            style={[authS.pinDigitBox, filled && authS.pinDigitBoxFilled]}
            value={d.trim()}
            onChangeText={(t) => handleChange(i, t)}
            onKeyPress={({ nativeEvent }) => handleKey(i, nativeEvent.key)}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={1}
            autoFocus={autoFocus && i === 0}
          />
        );
      })}
    </View>
  );
}

export default function ChangePinScreen() {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isMediaKeyUnlocked()) {
    return (
      <SafeAreaView style={c.safe}>
        <View style={s.header}>
          <AppBackButton />
          <Text style={s.headerTitle}>Đổi PIN</Text>
        </View>
        <View style={p.content}>
          <Text style={authS.error}>
            Phiên đăng nhập đã mất khoá nhật ký. Vui lòng đăng xuất và đăng nhập lại trước khi đổi PIN.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleNext = () => {
    setError('');
    if (newPin.length !== PIN_LENGTH) {
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
    if (newPin !== confirmPin) {
      setError('PIN xác nhận không khớp');
      setConfirmPin('');
      return;
    }

    setSaving(true);
    try {
      const newEnvelope = await rewrapMediaKey(newPin);
      // PUT envelope
      await api.put('/users/media-key', newEnvelope);
      // Sync local user
      await useAuthStore.getState().updateUser(newEnvelope);

      Alert.alert('Thành công', 'PIN đã được cập nhật.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Đổi PIN thất bại');
    } finally {
      setSaving(false);
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
            <AppBackButton onPress={handleBack} />
            <Text style={s.headerTitle}>
              {step === 'create' ? 'Tạo PIN mới' : 'Xác nhận PIN mới'}
            </Text>
          </View>

          <View style={p.content}>
            <Text style={ps.hint}>
              {step === 'create'
                ? 'Bạn không cần nhập PIN cũ — phiên đăng nhập hiện tại đủ để xác minh danh tính.'
                : 'Nhập lại PIN để xác nhận.'}
            </Text>

            {step === 'create' ? (
              <>
                <PinDigitInput value={newPin} onChange={setNewPin} autoFocus />
                {error ? <Text style={authS.error}>{error}</Text> : null}
                <Button title="Tiếp tục" onPress={handleNext} />
              </>
            ) : (
              <>
                <PinDigitInput value={confirmPin} onChange={setConfirmPin} autoFocus />
                {error ? <Text style={authS.error}>{error}</Text> : null}
                <Button
                  title={saving ? 'Đang lưu...' : 'Cập nhật PIN'}
                  onPress={handleSubmit}
                  disabled={saving}
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
