import { Box, Typography, Chip, Paper } from '@mui/material';
import { useComments } from '../../api/hooks';
import { HtmlContent } from '../common/HtmlContent';

export function CommentList({ ticketId }: { ticketId: string }) {
  const { data, isLoading } = useComments(ticketId);

  if (isLoading) return <Typography color="text.secondary">Loading comments...</Typography>;
  if (!data || data.length === 0) return <Typography color="text.secondary">No comments</Typography>;

  return (
    <Box>
      {data.map((comment) => (
        <Paper key={comment.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              {comment.commentedByName || 'Unknown'}
            </Typography>
            <Chip
              label={comment.isPublic ? 'Public' : 'Private'}
              size="small"
              color={comment.isPublic ? 'success' : 'default'}
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              {comment.commentedTime ? new Date(comment.commentedTime).toLocaleString() : ''}
            </Typography>
          </Box>
          <HtmlContent html={comment.comment || ''} maxHeight={300} />
        </Paper>
      ))}
    </Box>
  );
}
