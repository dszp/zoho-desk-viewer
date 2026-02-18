import { Chip } from '@mui/material';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Open: { bg: '#e3f2fd', color: '#1565c0' },
  Closed: { bg: '#e8f5e9', color: '#2e7d32' },
  'On Hold': { bg: '#fff3e0', color: '#e65100' },
  'Waiting on customer response': { bg: '#fce4ec', color: '#c62828' },
  Escalated: { bg: '#f3e5f5', color: '#7b1fa2' },
};

export function StatusChip({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] || { bg: '#f5f5f5', color: '#616161' };
  return (
    <Chip
      label={status || 'None'}
      size="small"
      sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 500 }}
    />
  );
}
