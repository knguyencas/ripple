import { useMemo, useRef, useState } from 'react';
import {
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { MOODS } from '../mood/MoodWheel';
import { moodCalendarStyles as s } from '../../styles/tracker/tracker.styles';
import { toDateKey } from '../../utils/shared/date.utils';
import { getMoodEmojiByName } from '../../utils/shared/mood.utils';

export interface LogItem {
  id: string;
  mood: string;
  moodScore: number;
  note: string | null;
  createdAt: string;
}

interface Props {
  logsByDate: Record<string, LogItem[]>;
}

interface SelectedMonth {
  year: number;
  month: number;
}

interface ActivityCard {
  key: string;
  logId: string;
  kind: 'log' | 'vote';
  title: string;
  subtitle: string;
  emoji?: string;
}

type PickerColumn = 'month' | 'year';

const WEEKDAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = Array.from({ length: 12 }, (_, index) => index);
const DOUBLE_TAP_MS = 330;

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function monthTitle({ year, month }: SelectedMonth): string {
  return `Tháng ${month + 1}, ${year}`;
}

function makeLocalDate(year: number, month: number, day: number): Date {
  const d = new Date(year, month, day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return makeLocalDate(year, month - 1, day);
}

function buildYearOptions(anchorYear: number): number[] {
  const currentYear = new Date().getFullYear();
  const start = Math.min(currentYear - 10, anchorYear - 6);
  const end = Math.max(currentYear + 3, anchorYear + 6);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function emojiFor(moodName: string): string | undefined {
  return getMoodEmojiByName(MOODS, moodName) || undefined;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function buildActivityCards(logs: LogItem[]): ActivityCard[] {
  const cards: ActivityCard[] = [];
  for (const log of logs) {
    const emoji = emojiFor(log.mood);
    const time = formatTime(log.createdAt);
    const hasNote = !!log.note?.trim();

    if (hasNote) {
      cards.push({
        key: `${log.id}-log`,
        logId: log.id,
        kind: 'log',
        title: 'Đã ghi nhật ký',
        subtitle: log.note!.slice(0, 60) + (log.note!.length > 60 ? '...' : ''),
      });
    }
    cards.push({
      key: `${log.id}-vote`,
      logId: log.id,
      kind: 'vote',
      title: 'Đã vote cảm xúc',
      subtitle: `${log.mood} · ${time}`,
      emoji,
    });
  }
  return cards;
}

export default function MoodCalendar({ logsByDate }: Props) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<SelectedMonth>(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [draftMonth, setDraftMonth] = useState(selectedMonth.month);
  const [draftYear, setDraftYear] = useState(selectedMonth.year);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualMonth, setManualMonth] = useState(String(selectedMonth.month + 1));
  const [manualYear, setManualYear] = useState(String(selectedMonth.year));
  const lastTapRef = useRef<{ column: PickerColumn; value: number; time: number } | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const yearOptions = useMemo(() => buildYearOptions(draftYear), [draftYear]);

  const { weeks, monthLabel, todayKey, loggedCountInMonth, monthDaysTotal } = useMemo(() => {
    const monthStart = makeLocalDate(selectedMonth.year, selectedMonth.month, 1);
    const monthEnd = makeLocalDate(selectedMonth.year, selectedMonth.month + 1, 0);

    const gridStart = new Date(monthStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const gridEnd = new Date(monthEnd);
    gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));

    const totalDays = Math.round((gridEnd.getTime() - gridStart.getTime()) / 86400000) + 1;
    const numWeeks = Math.ceil(totalDays / 7);

    const weeksArr: Date[][] = [];
    const cursor = new Date(gridStart);
    for (let w = 0; w < numWeeks; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      weeksArr.push(week);
    }

    let logged = 0;
    for (let day = 1; day <= monthEnd.getDate(); day++) {
      const key = toDateKey(makeLocalDate(selectedMonth.year, selectedMonth.month, day));
      if (logsByDate[key]?.length) logged += 1;
    }

    return {
      weeks: weeksArr,
      monthLabel: monthTitle(selectedMonth),
      todayKey: toDateKey(today),
      loggedCountInMonth: logged,
      monthDaysTotal: monthEnd.getDate(),
    };
  }, [logsByDate, selectedMonth, today]);

  const selectedLogs = selectedKey ? (logsByDate[selectedKey] ?? []) : [];
  const activityCards = useMemo(() => buildActivityCards(selectedLogs), [selectedLogs]);

  const openPicker = () => {
    setDraftMonth(selectedMonth.month);
    setDraftYear(selectedMonth.year);
    setManualMonth(String(selectedMonth.month + 1));
    setManualYear(String(selectedMonth.year));
    setManualOpen(false);
    setPickerOpen(true);
  };

  const closePicker = () => {
    setPickerOpen(false);
    setManualOpen(false);
  };

  const registerPickerTap = (column: PickerColumn, value: number) => {
    const now = Date.now();
    const lastTap = lastTapRef.current;
    const isDoubleTap =
      lastTap?.column === column &&
      lastTap.value === value &&
      now - lastTap.time <= DOUBLE_TAP_MS;

    lastTapRef.current = { column, value, time: now };
    if (isDoubleTap) {
      setManualOpen(true);
    }
  };

  const selectDraftMonth = (month: number) => {
    registerPickerTap('month', month);
    setDraftMonth(month);
    setManualMonth(String(month + 1));
  };

  const selectDraftYear = (year: number) => {
    registerPickerTap('year', year);
    setDraftYear(year);
    setManualYear(String(year));
  };

  const applyPicker = () => {
    let nextMonth = draftMonth;
    let nextYear = draftYear;

    if (manualOpen) {
      const parsedMonth = Number.parseInt(manualMonth, 10);
      const parsedYear = Number.parseInt(manualYear, 10);
      if (Number.isFinite(parsedMonth)) {
        nextMonth = Math.max(1, Math.min(12, parsedMonth)) - 1;
      }
      if (Number.isFinite(parsedYear)) {
        nextYear = Math.max(1900, Math.min(2100, parsedYear));
      }
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedKey(null);
    setSelectedMonth({ month: nextMonth, year: nextYear });
    setPickerOpen(false);
    setManualOpen(false);
  };

  const handleDayPress = (key: string, inMonth: boolean, isFuture: boolean) => {
    if (!inMonth || isFuture) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedKey((prev) => (prev === key ? null : key));
  };

  const handleCardPress = (logId: string) => {
    router.push(`/tabs/journal/${logId}`);
  };

  const formatSelectedDate = (key: string) => {
    const d = dateFromKey(key);
    return d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <View style={s.section}>
      <View style={s.header}>
        <TouchableOpacity
          style={s.monthSelector}
          onPress={openPicker}
          activeOpacity={0.82}
        >
          <Text style={s.title}>{monthLabel}</Text>
          <View style={s.monthChevronWrap}>
            <Svg width={16} height={12} viewBox="0 0 16 12" fill="none">
              <Path
                d="M2.5 4.2L8 8L13.5 4.2"
                stroke="#1A3A5C"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </TouchableOpacity>
        <Text style={s.countBadge}>{loggedCountInMonth}/{monthDaysTotal}</Text>
      </View>

      <View style={s.card}>
        <View style={s.weekdayRow}>
          {WEEKDAYS_VI.map((w) => (
            <View key={w} style={s.weekdayCell}>
              <Text style={s.weekdayText}>{w}</Text>
            </View>
          ))}
        </View>

        {weeks.map((week, wi) => (
          <View key={wi} style={s.weekRow}>
            {week.map((date) => {
              const key = toDateKey(date);
              const inMonth = date.getMonth() === selectedMonth.month
                && date.getFullYear() === selectedMonth.year;
              const isFuture = date > today;
              const logged = inMonth && !isFuture && !!logsByDate[key]?.length;
              const isToday = key === todayKey;
              const isSelected = key === selectedKey;

              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={inMonth && !isFuture ? 0.7 : 1}
                  onPress={() => handleDayPress(key, inMonth, isFuture)}
                  style={[
                    s.dayCell,
                    !inMonth && s.dayCellOutOfMonth,
                    inMonth && isFuture && s.dayCellFuture,
                  ]}
                >
                  <View
                    style={[
                      s.dayCircle,
                      logged && !isToday && !isSelected && s.dayCellLogged,
                      isSelected && !isToday && s.dayCellSelected,
                      isToday && s.dayCellToday,
                    ]}
                  >
                    <Text
                      style={[
                        s.dayNumber,
                        logged && !isToday && !isSelected && s.dayNumberLogged,
                        isSelected && !isToday && s.dayNumberSelected,
                        isToday && s.dayNumberToday,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                    {logged && !isToday && (
                      <View style={[s.loggedDot, isSelected && s.loggedDotSelected]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {selectedKey && (
          <View style={s.activityPanel}>
            <Text style={s.activityTitle}>{formatSelectedDate(selectedKey)}</Text>

            {activityCards.length === 0 ? (
              <Text style={s.activityEmpty}>Chưa có hoạt động ngày này.</Text>
            ) : (
              activityCards.map((card) => (
                <TouchableOpacity
                  key={card.key}
                  style={s.activityCard}
                  onPress={() => handleCardPress(card.logId)}
                  activeOpacity={0.8}
                >
                  {card.kind === 'vote' && card.emoji ? (
                    <Text style={s.activityEmoji}>{card.emoji}</Text>
                  ) : (
                    <View style={s.activityIconWrap}>
                      <Text style={s.activityIcon}>
                        {card.kind === 'log' ? '✎' : '♥'}
                      </Text>
                    </View>
                  )}
                  <View style={s.activityBody}>
                    <Text style={s.activityLabel}>{card.title}</Text>
                    <Text style={s.activitySub} numberOfLines={1}>
                      {card.subtitle}
                    </Text>
                  </View>
                  <Text style={s.activityChevron}>›</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={closePicker}
      >
        <TouchableOpacity
          style={s.pickerBackdrop}
          activeOpacity={1}
          onPress={closePicker}
        >
          <TouchableOpacity
            style={s.pickerPopup}
            activeOpacity={1}
            onPress={() => {}}
          >
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>Chọn tháng</Text>
              <TouchableOpacity style={s.pickerCloseButton} onPress={closePicker}>
                <Text style={s.pickerCloseText}>x</Text>
              </TouchableOpacity>
            </View>

            <View style={s.pickerColumns}>
              <View style={s.pickerColumn}>
                <Text style={s.pickerColumnLabel}>Tháng</Text>
                <ScrollView style={s.pickerScroll} showsVerticalScrollIndicator={false}>
                  {MONTHS.map((month) => {
                    const active = month === draftMonth;
                    return (
                      <TouchableOpacity
                        key={month}
                        style={[s.pickerOption, active && s.pickerOptionActive]}
                        onPress={() => selectDraftMonth(month)}
                        activeOpacity={0.82}
                      >
                        <Text style={[s.pickerOptionText, active && s.pickerOptionTextActive]}>
                          Tháng {month + 1}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={s.pickerColumn}>
                <Text style={s.pickerColumnLabel}>Năm</Text>
                <ScrollView style={s.pickerScroll} showsVerticalScrollIndicator={false}>
                  {yearOptions.map((year) => {
                    const active = year === draftYear;
                    return (
                      <TouchableOpacity
                        key={year}
                        style={[s.pickerOption, active && s.pickerOptionActive]}
                        onPress={() => selectDraftYear(year)}
                        activeOpacity={0.82}
                      >
                        <Text style={[s.pickerOptionText, active && s.pickerOptionTextActive]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {manualOpen && (
              <View style={s.manualPanel}>
                <TextInput
                  value={manualMonth}
                  onChangeText={setManualMonth}
                  keyboardType="number-pad"
                  maxLength={2}
                  style={s.manualInput}
                  placeholder="Tháng"
                  placeholderTextColor="#8AA1B1"
                />
                <TextInput
                  value={manualYear}
                  onChangeText={setManualYear}
                  keyboardType="number-pad"
                  maxLength={4}
                  style={s.manualInput}
                  placeholder="Năm"
                  placeholderTextColor="#8AA1B1"
                />
              </View>
            )}

            <Text style={s.pickerHint}>Nhấn đúp vào mục đang chọn để tự nhập.</Text>

            <View style={s.pickerFooter}>
              <TouchableOpacity style={s.pickerCancel} onPress={closePicker}>
                <Text style={s.pickerCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.pickerApply} onPress={applyPicker}>
                <Text style={s.pickerApplyText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
