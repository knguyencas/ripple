import { View, Text } from 'react-native';
import { yellowReminderStyles as s } from '../../styles/tracker/tracker-redesign.styles';
import { SoraInHalo } from '../shared/Sora';
import type { SeverityBand } from '../../services/tracker/encouragement.service';

interface Props {
  message: string;
  band?: SeverityBand;
}

function bandPose(band?: SeverityBand): 'hug' | 'idle' {
  if (band === 'severe' || band === 'mod_severe' || band === 'moderate') return 'hug';
  return 'idle';
}

function bandTone(band?: SeverityBand): { border: string; title: string } {
  if (band === 'severe' || band === 'mod_severe') {
    return { border: '#CFE4EC', title: '#2E6F8E' };
  }
  if (band === 'moderate') {
    return { border: '#DCEAD8', title: '#4F7C59' };
  }
  return { border: '#DCECF5', title: '#2E6F8E' };
}

export default function SoraMessage({ message, band }: Props) {
  const tone = bandTone(band);
  return (
    <View style={[s.msgCard, { borderColor: tone.border }]}>
      <View style={s.msgMascot}>
        <SoraInHalo size={46} pose={bandPose(band)} haloSize={58} idPrefix="tracker-sora-message" />
      </View>
      <View style={s.msgBody}>
        <Text style={[s.msgTitle, { color: tone.title }]}>Lời nhắn từ Sora</Text>
        <Text style={s.msgText}>{message}</Text>
      </View>
    </View>
  );
}
