import { Chip } from '@mui/material';

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  High: { bg: '#ffebee', color: '#c62828' },
  Medium: { bg: '#fff3e0', color: '#e65100' },
  Low: { bg: '#e8f5e9', color: '#2e7d32' },
};

export function PriorityChip({ priority }: { priority: string }) {
  const colors = PRIORITY_COLORS[priority] || { bg: '#f5f5f5', color: '#616161' };
  return (
    <Chip
      label={priority || 'None'}
      size="small"
      sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 500 }}
    />
  );
}
