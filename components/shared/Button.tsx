import { TouchableOpacity, Text } from 'react-native';
import { commonStyles as styles } from '../../styles/shared/common.styles';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export default function Button({ title, onPress, variant = 'primary', disabled }: Props) {
  return (
    <TouchableOpacity
      style={[
        variant === 'primary' ? styles.btnPrimary : styles.btnSecondary,
        disabled && styles.btnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={variant === 'primary' ? styles.btnText : styles.btnTextSecondary}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
