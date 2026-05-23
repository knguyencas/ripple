import { View, Text } from 'react-native';
import {
  moodEncouragementStyles as s,
  encouragementHintStyles as h,
} from '../../styles/mood/mood-encouragement.styles';
import { Colors } from '../../constants/colors';
import type { SeverityBand } from '../../services/tracker/encouragement.service';

interface Props {
  message: string | null;
  band?: SeverityBand;
}

function bandToColor(band?: SeverityBand): { border: string; title: string; bullet?: string } {
  if (band === 'severe' || band === 'mod_severe') {
    return { border: '#CFE4EC', title: '#2E6F8E', bullet: '#7FB3CC' };
  }
  if (band === 'moderate') {
    return { border: '#DCEAD8', title: '#4F7C59', bullet: '#A8CDA1' };
  }
  return { border: Colors.border, title: Colors.teal };
}

export default function MoodEncouragement({ message, band }: Props) {
  if (!message) return null;
  const c = bandToColor(band);

  return (
    <View style={[s.card, { borderColor: c.border }]}>
      <View style={s.headerRow}>
        {c.bullet ? (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: c.bullet,
            }}
          />
        ) : null}
        <Text style={[s.title, { color: c.title }]}>Lời nhắn cho bạn</Text>
      </View>
      <Text style={s.body}>{message}</Text>
    </View>
  );
}

export function EncouragementHint({ message, band }: Props) {
  if (!message) return null;
  const c = bandToColor(band);
  const icon = band === 'severe' || band === 'mod_severe' ? '💙' : band === 'moderate' ? '🌿' : '✨';

  return (
    <View style={h.wrap}>
      <Text style={h.icon}>{icon}</Text>
      <Text style={[h.text, c.bullet ? { color: c.title } : null]}>{message}</Text>
    </View>
  );
}
