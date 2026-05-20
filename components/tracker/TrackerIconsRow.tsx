import { useState, type ComponentType } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { trackerIconsRowStyles as s } from '../../styles/tracker/tracker-redesign.styles';
import { activityPanelStyles as p } from '../../styles/tracker/activity-detail.styles';
import StepsDetailPanel from './detail/StepsDetailPanel';
import WaterDetailPanel from './detail/WaterDetailPanel';
import SleepDetailPanel from './detail/SleepDetailPanel';
import MeditationDetailPanel from './detail/MeditationDetailPanel';
import MoodDetailPanel from './detail/MoodDetailPanel';
import MeditationModal from './MeditationModal';
import {
  MeditationLineIcon,
  MoodLineIcon,
  SleepLineIcon,
  StepsLineIcon,
  WaterDropLineIcon,
} from '../shared/AppIcons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ActivityId = 'walk' | 'mood' | 'water' | 'sleep' | 'meditation';
type TrackerIcon = ComponentType<{ size?: number; color?: string }>;

interface Cell {
  id: ActivityId;
  label: string;
  Icon: TrackerIcon;
  bg: string;
  color: string;
}

const CELLS: Cell[] = [
  { id: 'walk', label: 'VẬN ĐỘNG', Icon: StepsLineIcon, bg: '#F4D8B0', color: '#5A3010' },
  { id: 'mood', label: 'TÂM TRẠNG', Icon: MoodLineIcon, bg: '#FFD8D8', color: '#6B1F26' },
  { id: 'water', label: 'NƯỚC', Icon: WaterDropLineIcon, bg: '#C4DDED', color: '#1A4A6B' },
  { id: 'sleep', label: 'GIẤC NGỦ', Icon: SleepLineIcon, bg: '#E0D8F0', color: '#3A2A6B' },
  { id: 'meditation', label: 'THIỀN', Icon: MeditationLineIcon, bg: '#D8E8D8', color: '#1F3F26' },
];

const PANEL_TITLES: Record<ActivityId, string> = {
  walk: 'Vận động · trung bình theo kỳ',
  mood: 'Tâm trạng · điểm theo kỳ',
  water: 'Uống nước · trung bình theo kỳ',
  sleep: 'Giấc ngủ · trung bình theo kỳ',
  meditation: 'Thiền · trung bình theo kỳ',
};

interface Props {
  scoreByDate: Record<string, number>;
}

export default function TrackerIconsRow({ scoreByDate }: Props) {
  const [activeId, setActiveId] = useState<ActivityId | null>(null);
  const [meditationModalVisible, setMeditationModalVisible] = useState(false);

  const handlePress = (cell: Cell) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveId((prev) => (prev === cell.id ? null : cell.id));
    if (cell.id === 'meditation') {
      setMeditationModalVisible(true);
    }
  };

  const closePanel = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveId(null);
  };

  const renderPanelBody = () => {
    switch (activeId) {
      case 'walk':
        return <StepsDetailPanel active />;
      case 'mood':
        return <MoodDetailPanel active scoreByDate={scoreByDate} />;
      case 'water':
        return <WaterDetailPanel active />;
      case 'sleep':
        return <SleepDetailPanel active />;
      case 'meditation':
        return <MeditationDetailPanel active />;
      default:
        return null;
    }
  };

  return (
    <View style={s.section}>
      <Text style={s.title}>Track</Text>
      <View style={s.row}>
        {CELLS.map((cell) => {
          const active = cell.id === activeId;
          const Icon = cell.Icon;
          return (
            <TouchableOpacity
              key={cell.id}
              style={[s.cell, { backgroundColor: cell.bg }, active && s.cellActive]}
              activeOpacity={0.85}
              onPress={() => handlePress(cell)}
              accessibilityLabel={cell.label}
            >
              <View style={s.cellGlyphBox}>
                <Icon size={25} color={cell.color} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeId && (
        <View style={p.wrap}>
          <View style={p.headerRow}>
            <Text style={p.title}>{PANEL_TITLES[activeId]}</Text>
            <TouchableOpacity onPress={closePanel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={p.closeBtn}>Đóng</Text>
            </TouchableOpacity>
          </View>
          {renderPanelBody()}
        </View>
      )}

      <MeditationModal
        visible={meditationModalVisible}
        onClose={() => setMeditationModalVisible(false)}
      />
    </View>
  );
}
