import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTickets } from '../../api/hooks';
import { useDepartment } from '../../context/DepartmentContext';
import { DataTable, type Column } from '../common/DataTable';
import { StatusChip } from '../common/StatusChip';
import { PriorityChip } from '../common/PriorityChip';
import { TicketListFilters } from './TicketListFilters';
import { TicketDetailView } from './TicketDetailView';
import type { Ticket, TicketFilters } from '@zohodesk/shared';

const columns: Column<Ticket>[] = [
  { id: 'ticketNumber', label: '#', width: 70, sortable: true, render: (r) => r.ticketNumber },
  { id: 'subject', label: 'Subject', sortable: true, render: (r) => (
    <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {r.subject}
    </Typography>
  )},
  { id: 'status', label: 'Status', width: 160, sortable: true, render: (r) => <StatusChip status={r.status} /> },
  { id: 'priority', label: 'Priority', width: 100, sortable: true, render: (r) => <PriorityChip priority={r.priority} /> },
  { id: 'contactName', label: 'Contact', width: 140, render: (r) => r.contactName || '-' },
  { id: 'assigneeName', label: 'Agent', width: 130, render: (r) => r.assigneeName || 'Unassigned' },
  { id: 'channel', label: 'Channel', width: 80, render: (r) => r.channel || '-' },
  { id: 'createdTime', label: 'Created', width: 110, sortable: true, render: (r) => r.createdTime ? new Date(r.createdTime).toLocaleDateString() : '-' },
];

export function TicketListView() {
  const navigate = useNavigate();
  const { id: selectedId } = useParams();
  const { departmentId } = useDepartment();
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    pageSize: 25,
    sortBy: 'createdTime',
    sortOrder: 'desc',
    departmentId,
  });

  const mergedFilters = { ...filters, departmentId };
  const { data, isLoading } = useTickets(mergedFilters);

  const handleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleFilterChange = (partial: Partial<TicketFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Tickets</Typography>
        <TicketListFilters filters={mergedFilters} onChange={handleFilterChange} />
        {isLoading && !data ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : (
          <DataTable
            columns={columns}
            rows={data?.data || []}
            total={data?.total || 0}
            page={mergedFilters.page || 1}
            pageSize={mergedFilters.pageSize || 25}
            sortBy={mergedFilters.sortBy}
            sortOrder={mergedFilters.sortOrder}
            onPageChange={(page) => handleFilterChange({ page })}
            onPageSizeChange={(pageSize) => handleFilterChange({ pageSize, page: 1 })}
            onSort={handleSort}
            onRowClick={(row) => navigate(`/tickets/${row.id}`)}
            selectedId={selectedId}
            getRowId={(r) => r.id}
          />
        )}
      </Box>
      {selectedId && (
        <Box sx={{ width: 420, flexShrink: 0 }}>
          <TicketDetailView ticketId={selectedId} />
        </Box>
      )}
    </Box>
  );
}
