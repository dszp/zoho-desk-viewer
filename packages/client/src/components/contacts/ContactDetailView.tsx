import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useContactDetail, useContactTickets } from '../../api/hooks';
import { DataTable, type Column } from '../common/DataTable';
import { StatusChip } from '../common/StatusChip';
import type { Ticket } from '@zohodesk/shared';

const ticketColumns: Column<Ticket>[] = [
  { id: 'ticketNumber', label: '#', width: 70, render: (r) => r.ticketNumber },
  { id: 'subject', label: 'Subject', render: (r) => r.subject },
  { id: 'status', label: 'Status', width: 140, render: (r) => <StatusChip status={r.status} /> },
  { id: 'createdTime', label: 'Created', width: 110, render: (r) => r.createdTime ? new Date(r.createdTime).toLocaleDateString() : '-' },
];

export function ContactDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: contact, isLoading } = useContactDetail(id);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { data: tickets } = useContactTickets(id, page);

  if (isLoading) return <Typography color="text.secondary">Loading...</Typography>;
  if (!contact) return <Typography color="error">Contact not found</Typography>;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/contacts')} sx={{ mb: 2 }}>
        Back to Contacts
      </Button>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5">{contact.fullName || `${contact.firstName} ${contact.lastName}`}</Typography>
        <Typography color="text.secondary">{contact.title}</Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography variant="body2">{contact.email || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Phone</Typography>
            <Typography variant="body2">{contact.phone || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Mobile</Typography>
            <Typography variant="body2">{contact.mobile || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Account</Typography>
            <Typography
              variant="body2"
              sx={{ cursor: contact.accountId ? 'pointer' : 'default', color: contact.accountId ? 'primary.main' : 'inherit' }}
              onClick={() => contact.accountId && navigate(`/accounts/${contact.accountId}`)}
            >
              {contact.accountName || '-'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Type</Typography>
            <Typography variant="body2">{contact.type || '-'}</Typography>
          </Box>
        </Box>
      </Paper>
      <Typography variant="h6" sx={{ mb: 2 }}>Tickets</Typography>
      <DataTable
        columns={ticketColumns}
        rows={tickets?.data || []}
        total={tickets?.total || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onRowClick={(row) => navigate(`/tickets/${row.id}`)}
        getRowId={(r) => r.id}
      />
    </Box>
  );
}
