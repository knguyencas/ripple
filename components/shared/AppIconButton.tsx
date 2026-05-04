import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { EditLineIcon, TrashLineIcon } from './AppIcons';
import { appIconButtonStyles as styles } from '../../styles/shared/app-buttons.styles';

type AppIconButtonIcon = 'edit' | 'trash';

interface AppIconButtonProps {
  icon: AppIconButtonIcon;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  size?: number;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export default function AppIconButton({
  icon,
  onPress,
  accessibilityLabel,
  color = '#2E6F8E',
  size = 34,
  iconSize = 18,
  style,
  disabled = false,
}: AppIconButtonProps) {
  const Icon = icon === 'edit' ? EditLineIcon : TrashLineIcon;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        style,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      activeOpacity={0.72}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
    >
      <Icon size={iconSize} color={color} />
    </TouchableOpacity>
  );
}
