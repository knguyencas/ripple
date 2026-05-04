import { View, Text, TouchableOpacity } from 'react-native';
import {
  TRACKER_PERIOD_OPTIONS,
  type TrackerPeriod,
} from '../../../constants/tracker/period.constants';
import { activityPanelStyles as s } from '../../../styles/tracker/activity-detail.styles';

interface Props {
  value: TrackerPeriod;
  onChange: (next: TrackerPeriod) => void;
}

export default function PeriodSelector({ value, onChange }: Props) {
  return (
    <View style={s.periodRow}>
      {TRACKER_PERIOD_OPTIONS.map((opt) => {
        const active = opt.id === value;
        return (
          <TouchableOpacity
            key={opt.id}
            style={[s.periodChip, active && s.periodChipActive]}
            onPress={() => onChange(opt.id)}
            activeOpacity={0.7}
          >
            <Text style={[s.periodChipText, active && s.periodChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
