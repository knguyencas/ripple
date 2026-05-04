import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { sleepManualModalStyles as s } from '../../styles/tracker/sleep-manual-modal.styles';
import {
  TIME_PICKER_HOURS,
  TIME_PICKER_ITEM_HEIGHT,
  TIME_PICKER_MINUTES,
} from '../../constants/profile/time-picker.constants';
import {
  buildManualSleepSession,
  requestSleepPermissionAndSync,
  syncManualSleepToBackend,
  type SleepToday,
} from '../../services/tracker/health.service';
import { clampListIndex, roundToClosestMinute } from '../../utils/profile/time-picker.utils';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved?: (sleep: SleepToday) => void;
}

const LOOP_REPETITIONS = 24;
const LOOP_MIDDLE = Math.floor(LOOP_REPETITIONS / 2);
const LOOP_EDGE_BUFFER = 3;

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

export default function SleepManualModal({ visible, onClose, onSaved }: Props) {
  const [bedHour, setBedHour] = useState(23);
  const [bedMinute, setBedMinute] = useState(0);
  const [wakeHour, setWakeHour] = useState(7);
  const [wakeMinute, setWakeMinute] = useState(0);
  const [requestingPermission, setRequestingPermission] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const bedHourRef = useRef<FlatList<number>>(null);
  const bedMinuteRef = useRef<FlatList<number>>(null);
  const wakeHourRef = useRef<FlatList<number>>(null);
  const wakeMinuteRef = useRef<FlatList<number>>(null);

  useEffect(() => {
    if (!visible) return;
    setMessage('');
    setTimeout(() => {
      scrollLoopToValue(bedHourRef.current, TIME_PICKER_HOURS, bedHour, false);
      scrollLoopToValue(bedMinuteRef.current, TIME_PICKER_MINUTES, bedMinute, false);
      scrollLoopToValue(wakeHourRef.current, TIME_PICKER_HOURS, wakeHour, false);
      scrollLoopToValue(wakeMinuteRef.current, TIME_PICKER_MINUTES, wakeMinute, false);
    }, 50);
  }, [visible]);

  const manualSleep = useMemo(
    () => buildManualSleepSession(bedHour, bedMinute, wakeHour, wakeMinute),
    [bedHour, bedMinute, wakeHour, wakeMinute]
  );

  const handleRequestPermission = async () => {
    if (requestingPermission) return;
    setRequestingPermission(true);
    setMessage('');
    try {
      const synced = await requestSleepPermissionAndSync();
      if (synced) {
        onSaved?.(synced);
        onClose();
        return;
      }
      setMessage('Sora vẫn chưa đọc được dữ liệu giấc ngủ. Bạn có thể nhập thủ công bên dưới.');
    } finally {
      setRequestingPermission(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setMessage('');
    try {
      const saved = await syncManualSleepToBackend(manualSleep);
      if (saved) {
        onSaved?.(saved);
        onClose();
        return;
      }
      setMessage('Chưa lưu được giấc ngủ. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={s.headerRow}>
            <Text style={s.title}>Giấc ngủ</Text>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={s.permissionCard}>
            <Text style={s.permissionTitle}>
              Sora chưa được cấp quyền xem giấc ngủ của bạn :(
            </Text>
            <Text style={s.permissionText}>
              Bạn có thể cho phép đọc Apple Health / Health Connect, hoặc nhập giờ ngủ thủ công.
            </Text>
            <TouchableOpacity
              style={[s.permissionButton, requestingPermission && s.permissionButtonDisabled]}
              onPress={handleRequestPermission}
              disabled={requestingPermission}
            >
              {requestingPermission ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text
                  style={s.permissionButtonText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                >
                  Cấp quyền
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={s.manualTitle}>Nhập thủ công</Text>
          <View style={s.pickerGrid}>
            <View style={s.timeGroup}>
              <Text style={s.timeLabel}>Giờ ngủ</Text>
              <View style={s.timeColumns}>
                <Column
                  ref={bedHourRef}
                  data={TIME_PICKER_HOURS}
                  selected={bedHour}
                  onChange={setBedHour}
                />
                <Text style={s.colon}>:</Text>
                <Column
                  ref={bedMinuteRef}
                  data={TIME_PICKER_MINUTES}
                  selected={bedMinute}
                  onChange={(value) => setBedMinute(roundToClosestMinute(value, TIME_PICKER_MINUTES))}
                />
              </View>
            </View>

            <View style={s.timeGroup}>
              <Text style={s.timeLabel}>Giờ dậy</Text>
              <View style={s.timeColumns}>
                <Column
                  ref={wakeHourRef}
                  data={TIME_PICKER_HOURS}
                  selected={wakeHour}
                  onChange={setWakeHour}
                />
                <Text style={s.colon}>:</Text>
                <Column
                  ref={wakeMinuteRef}
                  data={TIME_PICKER_MINUTES}
                  selected={wakeMinute}
                  onChange={(value) => setWakeMinute(roundToClosestMinute(value, TIME_PICKER_MINUTES))}
                />
              </View>
            </View>
          </View>

          <Text style={s.durationPreview}>
            Sora sẽ ghi nhận {formatDuration(manualSleep.durationMin)} ngủ.
          </Text>
          {message ? <Text style={s.errorText}>{message}</Text> : null}

          <View style={s.actions}>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelText}>Huỷ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.saveBtn, saving && s.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={s.saveText}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface ColumnProps {
  data: number[];
  selected: number;
  onChange: (value: number) => void;
}

function loopedData(data: number[]): number[] {
  return Array.from({ length: data.length * LOOP_REPETITIONS }, (_, index) => data[index % data.length]);
}

function middleIndexForValue(data: number[], value: number): number {
  const valueIndex = Math.max(0, data.indexOf(value));
  return (LOOP_MIDDLE * data.length) + valueIndex;
}

function scrollLoopToValue(
  ref: FlatList<number> | null,
  data: number[],
  value: number,
  animated: boolean
) {
  ref?.scrollToIndex({ index: middleIndexForValue(data, value), animated });
}

const Column = forwardRef<FlatList<number>, ColumnProps>(function Column(
  { data, selected, onChange },
  ref
) {
  const items = useMemo(() => loopedData(data), [data]);

  const handleScrollPosition = (event: NativeSyntheticEvent<NativeScrollEvent>, shouldRecenter: boolean) => {
    const rawIndex = Math.round(event.nativeEvent.contentOffset.y / TIME_PICKER_ITEM_HEIGHT);
    const clamped = clampListIndex(rawIndex, items.length);
    const value = data[((clamped % data.length) + data.length) % data.length];
    onChange(value);

    if (!shouldRecenter) return;

    const cycle = Math.floor(clamped / data.length);
    if (cycle <= LOOP_EDGE_BUFFER || cycle >= LOOP_REPETITIONS - LOOP_EDGE_BUFFER) {
      const target = middleIndexForValue(data, value);
      const list = ref && typeof ref !== 'function' ? ref.current : null;
      list?.scrollToIndex({ index: target, animated: false });
    }
  };

  return (
    <View style={s.wheelWrap}>
      <View style={s.selector} pointerEvents="none" />
      <FlatList
        ref={ref}
        data={items}
        keyExtractor={(_, index) => String(index)}
        showsVerticalScrollIndicator={false}
        snapToInterval={TIME_PICKER_ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={(event) => handleScrollPosition(event, false)}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => handleScrollPosition(event, true)}
        onScrollEndDrag={(event) => handleScrollPosition(event, true)}
        getItemLayout={(_, index) => ({
          length: TIME_PICKER_ITEM_HEIGHT,
          offset: TIME_PICKER_ITEM_HEIGHT * index,
          index,
        })}
        ListHeaderComponent={<View style={s.listSpacer} />}
        ListFooterComponent={<View style={s.listSpacer} />}
        renderItem={({ item }) => (
          <View style={s.item}>
            <Text style={[s.itemText, item === selected && s.itemTextActive]}>
              {String(item).padStart(2, '0')}
            </Text>
          </View>
        )}
      />
    </View>
  );
});
