import api from '../core/api';
import { isApiBackendAvailable } from '../core/api-connectivity';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  items: AppNotification[];
  unreadCount: number;
}

export async function fetchNotifications(limit = 50): Promise<NotificationsResponse> {
  if (!(await isApiBackendAvailable())) {
    return { items: [], unreadCount: 0 };
  }

  const res = await api.get('/notifications', { params: { limit } });
  return {
    items: res.data?.items ?? [],
    unreadCount: Number(res.data?.unreadCount ?? 0),
  };
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch('/notifications/read-all');
}
