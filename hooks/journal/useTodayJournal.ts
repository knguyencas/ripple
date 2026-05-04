import { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import api from '../../services/core/api';
import {
  getTodayJournalCopy,
  getTodayJournalRoute,
  TodayJournalLog,
} from '../../utils/journal/today-journal.utils';

export function useTodayJournal() {
  const [todayLog, setTodayLog] = useState<TodayJournalLog | null>(null);

  const refreshTodayJournal = useCallback(async (): Promise<TodayJournalLog | null | undefined> => {
    try {
      const res = await api.get('/logs/today');
      const log = res.data?.log ?? null;
      setTodayLog(log);
      return log;
    } catch {
      setTodayLog(null);
      return undefined;
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void refreshTodayJournal();
  }, [refreshTodayJournal]));

  const openTodayJournal = useCallback(() => {
    void (async () => {
      const latestLog = await refreshTodayJournal();
      router.push(getTodayJournalRoute(latestLog === undefined ? todayLog : latestLog));
    })();
  }, [refreshTodayJournal, todayLog]);

  const copy = useMemo(() => getTodayJournalCopy(todayLog), [todayLog]);

  return {
    todayLog,
    todayLogId: todayLog?.id ?? null,
    hasTodayLog: !!todayLog?.id,
    copy,
    openTodayJournal,
    refreshTodayJournal,
  };
}
