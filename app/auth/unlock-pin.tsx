import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { authStyles as styles } from '../../styles/auth/auth.styles';
import Button from '../../components/shared/Button';
import { useAuthStore } from '../../stores/auth.store';
import AppBackButton from '../../components/shared/AppBackButton';
import AuthBackdrop from '../../components/auth/AuthBackdrop';
import { unlockMediaKeyFromPassword } from '../../services/journal/media-crypto.service';
import {
  clearPendingAuth,
  consumePendingAuth,
  peekPendingAuth,
} from '../../services/auth/pending-auth';
import {
  formatRemainingTime,
  isPinLocked,
  recordPinFail,
  resetPinFailState,
} from '../../services/auth/pin-rate-limit';

const PIN_LENGTH = 6;

interface PinDigitInputProps {
  value: string;
  onChange: (next: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

function PinDigitInput({ value, onChange, autoFocus, disabled }: PinDigitInputProps) {
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
            maxLength={1}
            autoFocus={autoFocus && i === 0}
            editable={!disabled}
          />
        );
      })}
    </View>
  );
}

export default function UnlockPinScreen() {
  const setAuth = useAuthStore((s) => s.setAuth);

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockMessage, setLockMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!peekPendingAuth()) {
      router.replace('/auth/login');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const { locked, remainingMs } = await isPinLocked();
      if (cancelled) return;
      if (locked) {
        setLockMessage(`Đã khoá PIN. Thử lại sau ${formatRemainingTime(remainingMs)}.`);
      } else {
        setLockMessage(null);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const handleUnlock = async () => {
    setError('');
    if (pin.length !== PIN_LENGTH) {
      setError('Vui lòng nhập đủ 6 chữ số');
      return;
    }

    const lockState = await isPinLocked();
    if (lockState.locked) {
      setError(`Đã khoá. Thử lại sau ${formatRemainingTime(lockState.remainingMs)}.`);
      return;
    }

    const pending = peekPendingAuth();
    if (!pending) {
      router.replace('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const ok = await unlockMediaKeyFromPassword(pin, pending.user);
      if (!ok) throw new Error('Envelope không hợp lệ');

      await resetPinFailState();
      const consumed = consumePendingAuth();
      if (consumed) {
        await setAuth(consumed.token, consumed.user);
      }
      router.replace('/tabs/home');
    } catch {
      const { failCount, lockedMs } = await recordPinFail();
      setPin('');
      if (lockedMs > 0) {
        setError(
          `Sai PIN ${failCount} lần. Đã khoá ${formatRemainingTime(lockedMs)}.`
        );
      } else {
        setError(`Sai PIN. Bạn còn ${5 - failCount} lần thử trước khi bị khoá.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    clearPendingAuth();
    router.replace('/auth/login');
  };

  const disabled = loading || Boolean(lockMessage);

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
          <AppBackButton style={styles.registerBackButton} onPress={handleCancel} />
          <Text style={styles.title}>Mở khoá nhật ký</Text>
          <Text style={styles.subtitle}>Nhập PIN 6 chữ số của bạn</Text>
        </View>

        <View style={styles.form}>
          <PinDigitInput
            value={pin}
            onChange={setPin}
            autoFocus
            disabled={disabled}
          />

          {lockMessage ? (
            <Text style={styles.error}>{lockMessage}</Text>
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <Button
            title={loading ? 'Đang mở khoá...' : 'Xác nhận'}
            onPress={handleUnlock}
            disabled={disabled}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
