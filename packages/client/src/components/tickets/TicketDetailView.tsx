import { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTicketDetail } from '../../api/hooks';
import { ThreadList } from './ThreadList';
import { CommentList } from './CommentList';
import { TicketMetadataSidebar } from './TicketMetadataSidebar';

interface TicketDetailViewProps {
  ticketId: string;
}

export function TicketDetailView({ ticketId }: TicketDetailViewProps) {
  const navigate = useNavigate();
  const { data: ticket, isLoading } = useTicketDetail(ticketId);
  const [tab, setTab] = useState(0);

  if (isLoading) return <Typography color="text.secondary">Loading...</Typography>;
  if (!ticket) return <Typography color="error">Ticket not found</Typography>;

  return (
    <Paper sx={{ height: 'calc(100vh - 48px)', overflow: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            #{ticket.ticketNumber}
          </Typography>
          <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
            {ticket.subject}
          </Typography>
        </Box>
        <IconButton size="small" onClick={() => navigate('/tickets')}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Conversations" />
        <Tab label="Comments" />
        <Tab label="Details" />
      </Tabs>

      {tab === 0 && <ThreadList ticketId={ticketId} />}
      {tab === 1 && <CommentList ticketId={ticketId} />}
      {tab === 2 && <TicketMetadataSidebar ticket={ticket} />}
    </Paper>
  );
}
