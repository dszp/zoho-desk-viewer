import { useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAccounts } from '../../api/hooks';
import { DataTable, type Column } from '../common/DataTable';
import type { Account } from '@zohodesk/shared';

const columns: Column<Account>[] = [
  { id: 'accountName', label: 'Account Name', render: (r) => r.accountName || '-' },
  { id: 'phone', label: 'Phone', width: 140, render: (r) => r.phone || '-' },
  { id: 'email', label: 'Email', render: (r) => r.email || '-' },
  { id: 'website', label: 'Website', render: (r) => r.website || '-' },
  { id: 'industry', label: 'Industry', width: 120, render: (r) => r.industry || '-' },
];

export function AccountListView() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { data, isLoading } = useAccounts(search || undefined, page);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Accounts</Typography>
      <TextField
        size="small"
        placeholder="Search accounts..."
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
          onRowClick={(row) => navigate(`/accounts/${row.id}`)}
          getRowId={(r) => r.id}
        />
      )}
    </Box>
  );
}
