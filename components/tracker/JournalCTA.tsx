import { View, Text, TouchableOpacity } from 'react-native';
import { yellowReminderStyles as s } from '../../styles/tracker/tracker-redesign.styles';

interface Props {
  title: string;
  buttonLabel: string;
  accessibilityLabel: string;
  onPress: () => void;
}

export default function JournalCTA({ title, buttonLabel, accessibilityLabel, onPress }: Props) {
  return (
    <TouchableOpacity
      style={s.ctaCard}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={s.ctaBody}>
        <Text style={s.ctaText}>{title}</Text>
        <View style={s.ctaPill}>
          <Text style={s.ctaPillText}>{buttonLabel}</Text>
        </View>
      </View>
      <Text style={s.ctaArrow}>›</Text>
    </TouchableOpacity>
  );
}
