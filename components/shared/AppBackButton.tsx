import { Href, router } from 'expo-router';
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { appBackButtonStyles as styles } from '../../styles/shared/app-buttons.styles';

type AppBackButtonProps = {
  label?: string;
  onPress?: () => void;
  fallbackHref?: Href;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

export default function AppBackButton({
  label = '‹',
  onPress,
  fallbackHref = '/tabs/home',
  style,
  textStyle,
  accessibilityLabel = 'Quay lại',
}: AppBackButtonProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.75}
    >
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}
