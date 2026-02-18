import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, Divider, List, ListItemButton, ListItemText } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAccountDetail, useAccountTickets } from '../../api/hooks';
import { DataTable, type Column } from '../common/DataTable';
import { StatusChip } from '../common/StatusChip';
import type { Ticket } from '@zohodesk/shared';

const ticketColumns: Column<Ticket>[] = [
  { id: 'ticketNumber', label: '#', width: 70, render: (r) => r.ticketNumber },
  { id: 'subject', label: 'Subject', render: (r) => r.subject },
  { id: 'status', label: 'Status', width: 140, render: (r) => <StatusChip status={r.status} /> },
  { id: 'createdTime', label: 'Created', width: 110, render: (r) => r.createdTime ? new Date(r.createdTime).toLocaleDateString() : '-' },
];

export function AccountDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: account, isLoading } = useAccountDetail(id);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { data: tickets } = useAccountTickets(id, page);

  if (isLoading) return <Typography color="text.secondary">Loading...</Typography>;
  if (!account) return <Typography color="error">Account not found</Typography>;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/accounts')} sx={{ mb: 2 }}>
        Back to Accounts
      </Button>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5">{account.accountName}</Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Phone</Typography>
            <Typography variant="body2">{account.phone || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography variant="body2">{account.email || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Website</Typography>
            <Typography variant="body2">{account.website || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Industry</Typography>
            <Typography variant="body2">{account.industry || '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Location</Typography>
            <Typography variant="body2">
              {[account.city, account.state, account.country].filter(Boolean).join(', ') || '-'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {account.contacts && account.contacts.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 1 }}>Contacts ({account.contacts.length})</Typography>
          <Paper variant="outlined" sx={{ mb: 3 }}>
            <List dense>
              {account.contacts.map((c) => (
                <ListItemButton key={c.id} onClick={() => navigate(`/contacts/${c.id}`)}>
                  <ListItemText
                    primary={c.fullName || `${c.firstName} ${c.lastName}`}
                    secondary={c.email}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </>
      )}

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
