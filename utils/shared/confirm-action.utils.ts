import { Alert } from 'react-native';

interface ConfirmDestructiveActionOptions {
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => Promise<void> | void;
  cancelText?: string;
  errorTitle?: string;
  errorMessage?: string;
}

export function confirmDestructiveAction({
  title,
  message,
  confirmText,
  cancelText = 'Hủy',
  errorTitle = 'Lỗi',
  errorMessage = 'Không thực hiện được.',
  onConfirm,
}: ConfirmDestructiveActionOptions) {
  Alert.alert(
    title,
    message,
    [
      { text: cancelText, style: 'cancel' },
      {
        text: confirmText,
        style: 'destructive',
        onPress: async () => {
          try {
            await onConfirm();
          } catch {
            Alert.alert(errorTitle, errorMessage);
          }
        },
      },
    ]
  );
}
