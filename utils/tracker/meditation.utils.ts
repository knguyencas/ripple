export function formatCountdown(secondsLeft: number): string {
  const safe = Math.max(0, Math.floor(secondsLeft));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatFileSize(mb: number): string {
  if (!Number.isFinite(mb) || mb <= 0) return '-';
  if (mb < 1) return `${Math.round(mb * 1000)} KB`;
  return `${mb.toFixed(1)} MB`;
}

export function computeElapsedSec(
  startedAt: number,
  totalPausedMs: number,
  now: number = Date.now()
): number {
  return Math.max(0, Math.floor((now - startedAt - totalPausedMs) / 1000));
}
