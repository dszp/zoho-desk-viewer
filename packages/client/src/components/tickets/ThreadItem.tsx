import { Box, Typography, Chip } from '@mui/material';
import { HtmlContent } from '../common/HtmlContent';
import type { Thread } from '@zohodesk/shared';

const DIRECTION_MAP: Record<string, { label: string; color: string }> = {
  'EMAIL INCOMING': { label: 'Incoming', color: '#e3f2fd' },
  'EMAIL OUTGOING': { label: 'Outgoing', color: '#e8f5e9' },
};

export function ThreadItem({ thread }: { thread: Thread }) {
  const direction = DIRECTION_MAP[thread.threadStatus] || { label: thread.threadStatus || 'Unknown', color: '#f5f5f5' };
  const isOutgoing = thread.threadStatus?.includes('OUTGOING');

  return (
    <Box
      sx={{
        mb: 2,
        border: '1px solid',
        borderColor: isOutgoing ? '#c8e6c9' : '#bbdefb',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1,
          backgroundColor: direction.color,
        }}
      >
        <Chip label={direction.label} size="small" sx={{ fontWeight: 500 }} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {thread.fromEmailAddress || 'Unknown'}
        </Typography>
        {thread.isPrivate ? (
          <Chip label="Private" size="small" color="warning" variant="outlined" />
        ) : null}
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          {thread.createdTime ? new Date(thread.createdTime).toLocaleString() : ''}
        </Typography>
      </Box>
      <Box sx={{ p: 1 }}>
        <HtmlContent html={thread.content || ''} maxHeight={500} />
      </Box>
    </Box>
  );
}
