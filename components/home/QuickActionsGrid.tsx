import { View } from 'react-native';
import { quickActionStyles as s } from '../../styles/home/quick-actions.styles';
import WaterQuickCard from './cards/WaterQuickCard';
import SleepQuickCard from './cards/SleepQuickCard';
import WalkQuickCard from './cards/WalkQuickCard';
import MeditateQuickCard from './cards/MeditateQuickCard';

interface Props {
  onTaskStateChanged?: () => void;
}

export default function QuickActionsGrid({ onTaskStateChanged }: Props) {
  return (
    <View style={s.grid}>
      <WaterQuickCard onTaskStateChanged={onTaskStateChanged} />
      <SleepQuickCard />
      <WalkQuickCard onTaskStateChanged={onTaskStateChanged} />
      <MeditateQuickCard onTaskStateChanged={onTaskStateChanged} />
    </View>
  );
}
