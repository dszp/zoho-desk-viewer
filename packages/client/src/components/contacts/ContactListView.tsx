import { useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useContacts } from '../../api/hooks';
import { DataTable, type Column } from '../common/DataTable';
import type { Contact } from '@zohodesk/shared';

const columns: Column<Contact>[] = [
  { id: 'fullName', label: 'Name', render: (r) => r.fullName || `${r.firstName || ''} ${r.lastName || ''}`.trim() || '-' },
  { id: 'email', label: 'Email', render: (r) => r.email || '-' },
  { id: 'phone', label: 'Phone', render: (r) => r.phone || r.mobile || '-' },
  { id: 'accountName', label: 'Account', render: (r) => r.accountName || '-' },
  { id: 'type', label: 'Type', width: 100, render: (r) => r.type || '-' },
];

export function ContactListView() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { data, isLoading } = useContacts(search || undefined, page);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Contacts</Typography>
      <TextField
        size="small"
        placeholder="Search contacts..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        sx={{ mb: 2, minWidth: 250 }}
      />
      {isLoading && !data ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : (
        <DataTable
          columns={columns}
          rows={data?.data || []}
          total={data?.total || 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          onRowClick={(row) => navigate(`/contacts/${row.id}`)}
          getRowId={(r) => r.id}
        />
      )}
    </Box>
  );
}
