import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '../../../services/core/api';
import { MOODS } from '../../../components/mood/MoodWheel';
import { journalIndexStyles as s, J } from '../../../styles/journal/journal.styles';
import { getMoodEmojiByName } from '../../../utils/shared/mood.utils';
import { groupLogsByMonth } from '../../../utils/journal/journal.utils';
import { useTodayJournal } from '../../../hooks/journal/useTodayJournal';
import { SoraWithChecklist } from '../../../components/shared/Sora';

interface Log {
  id: string;
  mood: string;
  moodScore: number;
  note: string | null;
  createdAt: string;
}

export default function JournalScreen() {
  const router = useRouter();
  const [logs, setLogs]           = useState<Log[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const todayJournal = useTodayJournal();

  const fetchLogs = async () => {
    try {
      const logsRes = await api.get('/logs?limit=50');
      setLogs(logsRes.data ?? []);
    } catch (e) {
      console.error('fetchLogs error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchLogs(); }, []));
  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
    void todayJournal.refreshTodayJournal();
  };

  const goWrite = todayJournal.openTodayJournal;

  const grouped = groupLogsByMonth(logs);

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <ActivityIndicator style={s.loadingIndicator} color={J.btnBg} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={J.btnBg} />
        }
      >

        <View style={s.illustWrap}>
          <View style={s.illustHero}>
            <SoraWithChecklist size={168} idPrefix="journal-hero-sora" />
          </View>
          <Text style={s.pageTitle}>Journal</Text>
        </View>

        <View style={s.actionSection}>
          <TouchableOpacity style={s.actionCard} onPress={goWrite} activeOpacity={0.85}>
            <View style={s.actionCardLeft}>
              <Text style={s.actionCardTitle}>
                {todayJournal.copy.title}
              </Text>
              <TouchableOpacity style={s.actionBtn} onPress={goWrite}>
                <Text style={s.actionBtnText}>
                  {todayJournal.copy.buttonLabel}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={s.actionChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {logs.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}></Text>
            <Text style={s.emptyTitle}>Chưa có nhật ký nào</Text>
            <Text style={s.emptyText}>Hãy ghi lại cảm xúc đầu tiên của bạn!</Text>
          </View>
        ) : (
          grouped.map(({ key, label, logs: monthLogs }) => (
            <View key={key} style={s.monthSection}>
              <Text style={s.monthTitle}>{label}</Text>
              {monthLogs.map((log, idx) => {
                const date    = new Date(log.createdAt);
                const isToday = new Date().toDateString() === date.toDateString();
                const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
                const day     = date.getDate();
                return (
                  <TouchableOpacity
                    key={log.id}
                    style={[
                      s.entryRow,
                      idx < monthLogs.length - 1 && s.entryRowBorder,
                      isToday && s.entryRowToday,
                    ]}
                    onPress={() => router.push(`/tabs/journal/${log.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={s.dateCol}>
                      <Text style={s.dateWeekday}>{weekday}</Text>
                      <Text style={s.dateDay}>{day}</Text>
                    </View>
                    <View style={s.entryContent}>
                      {log.note ? (
                        <Text style={s.entryText} numberOfLines={3}>
                          {log.note}
                        </Text>
                      ) : (
                        <Text style={s.entryEmpty}>
                          {getMoodEmojiByName(MOODS, log.mood)}  {log.mood}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}

        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
