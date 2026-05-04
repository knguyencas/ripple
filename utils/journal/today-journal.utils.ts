import { Href } from 'expo-router';

export interface TodayJournalLog {
  id: string;
  mood?: string;
  moodScore?: number;
  note: string | null;
  createdAt?: string;
}

export function getTodayJournalRoute(log: TodayJournalLog | null): Href {
  if (!log?.id) return '/tabs/journal/new';
  return {
    pathname: '/tabs/journal/[id]',
    params: { id: log.id, edit: 'true' },
  };
}

export function getTodayJournalCopy(log: TodayJournalLog | null) {
  if (log?.id) {
    return {
      title: 'Chỉnh sửa nhật ký hôm nay',
      buttonLabel: 'Tiếp tục viết',
      homeLabel: 'Tiếp tục viết nhật ký',
      accessibilityLabel: 'Chỉnh sửa nhật ký hôm nay',
    };
  }

  return {
    title: 'Ghi lại cảm xúc & suy nghĩ của bạn',
    buttonLabel: 'Bắt đầu viết',
    homeLabel: 'Ghi nhật ký hôm nay',
    accessibilityLabel: 'Bắt đầu viết nhật ký',
  };
}

export function hasTodayJournalNote(log: TodayJournalLog | null) {
  return !!log?.note?.trim();
}
