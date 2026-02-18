import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useThreads } from '../../api/hooks';
import { ThreadItem } from './ThreadItem';

export function ThreadList({ ticketId }: { ticketId: string }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useThreads(ticketId, page);

  if (isLoading) return <Typography color="text.secondary">Loading threads...</Typography>;
  if (!data || data.data.length === 0) return <Typography color="text.secondary">No conversations</Typography>;

  return (
    <Box>
      {data.data.map((thread) => (
        <ThreadItem key={thread.id} thread={thread} />
      ))}
      {data.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
          <Button size="small" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <Typography variant="body2" sx={{ lineHeight: '30px' }}>
            Page {page} of {data.totalPages}
          </Typography>
          <Button size="small" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
}
