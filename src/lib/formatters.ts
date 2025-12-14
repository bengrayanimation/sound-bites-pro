export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Yesterday';
  }
  if (days < 7) {
    return 'This Week';
  }
  if (days < 30) {
    return 'This Month';
  }
  return dateObj.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export function groupRecordingsByDate<T extends { createdAt: Date | string }>(
  recordings: T[]
): { label: string; items: T[] }[] {
  const groups: Map<string, T[]> = new Map();

  recordings.forEach((recording) => {
    const label = formatDate(recording.createdAt);
    const existing = groups.get(label) || [];
    groups.set(label, [...existing, recording]);
  });

  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items,
  }));
}
