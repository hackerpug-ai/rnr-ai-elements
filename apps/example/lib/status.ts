export type StatusTone = 'pending' | 'running' | 'success' | 'error' | 'denied';

/**
 * tone → text class. The three escape-hatch colors (destructive / green-600 /
 * orange-600) live ONLY here; dark-mode twins ride along exactly as the web original
 * writes them (`dark:text-green-500`, `dark:text-orange-500`).
 */
export const statusColor: Record<StatusTone, string> = {
  pending: 'text-muted-foreground',
  running: 'text-primary',
  success: 'text-green-600 dark:text-green-500',
  error: 'text-destructive',
  denied: 'text-orange-600 dark:text-orange-500',
};
