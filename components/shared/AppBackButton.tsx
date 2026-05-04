import { router } from 'expo-router';
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
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

export default function AppBackButton({
  label = '‹',
  onPress = () => router.back(),
  style,
  textStyle,
  accessibilityLabel = 'Quay lại',
}: AppBackButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.75}
    >
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}
