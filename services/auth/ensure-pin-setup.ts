import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth.store';
import { hasCompleteMediaKeyEnvelope } from '../journal/media-crypto.service';

export async function ensurePinSetup(returnTo?: string): Promise<boolean> {
  const user = useAuthStore.getState().user;
  if (hasCompleteMediaKeyEnvelope(user)) {
    return true;
  }

  const title = 'Cần PIN bảo vệ media';
  const message = 'Để bảo vệ ảnh và ghi âm trong nhật ký, bạn cần tạo một mã PIN 6 chữ số. Tạo ngay?';
  const goToSetupPin = () => {
    if (returnTo) {
      router.push({
        pathname: '/auth/setup-pin',
        params: { returnTo },
      });
      return;
    }
    router.push('/auth/setup-pin');
  };

  if (Platform.OS === 'web' && typeof (globalThis as any).confirm === 'function') {
    if ((globalThis as any).confirm(`${title}\n\n${message}`)) {
      goToSetupPin();
    }
    return false;
  }

  Alert.alert(
    title,
    message,
    [
      { text: 'Để sau', style: 'cancel' },
      { text: 'Tạo PIN', onPress: goToSetupPin },
    ],
    { cancelable: true }
  );
  return false;
}
