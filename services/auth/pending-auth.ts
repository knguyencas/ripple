import type { User } from '../../stores/auth.store';

interface PendingAuth {
  token: string;
  user: User;
}

let pending: PendingAuth | null = null;

export function setPendingAuth(payload: PendingAuth) {
  pending = payload;
}

export function consumePendingAuth(): PendingAuth | null {
  const value = pending;
  pending = null;
  return value;
}

export function peekPendingAuth(): PendingAuth | null {
  return pending;
}

export function clearPendingAuth() {
  pending = null;
}
