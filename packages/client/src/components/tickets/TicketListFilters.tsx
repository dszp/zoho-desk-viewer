import { useState, useEffect } from 'react';
import { Box, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useAgents } from '../../api/hooks';
import type { TicketFilters } from '@zohodesk/shared';

interface TicketListFiltersProps {
  filters: TicketFilters;
  onChange: (filters: Partial<TicketFilters>) => void;
}

export function TicketListFilters({ filters, onChange }: TicketListFiltersProps) {
  const { data: agents } = useAgents();
  const [searchText, setSearchText] = useState(filters.search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({ search: searchText || undefined, page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
      <TextField
        size="small"
        placeholder="Search tickets..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        sx={{ minWidth: 200 }}
      />
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status || ''}
          label="Status"
          onChange={(e) => onChange({ status: e.target.value || undefined, page: 1 })}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Open">Open</MenuItem>
          <MenuItem value="Closed">Closed</MenuItem>
          <MenuItem value="On Hold">On Hold</MenuItem>
          <MenuItem value="Waiting on customer response">Waiting on Customer</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={filters.priority || ''}
          label="Priority"
          onChange={(e) => onChange({ priority: e.target.value || undefined, page: 1 })}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="High">High</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>Agent</InputLabel>
        <Select
          value={filters.assigneeId || ''}
          label="Agent"
          onChange={(e) => onChange({ assigneeId: e.target.value || undefined, page: 1 })}
        >
          <MenuItem value="">All</MenuItem>
          {agents?.map((a) => (
            <MenuItem key={a.id} value={a.id}>{a.fullName}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Channel</InputLabel>
        <Select
          value={filters.channel || ''}
          label="Channel"
          onChange={(e) => onChange({ channel: e.target.value || undefined, page: 1 })}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Email">Email</MenuItem>
          <MenuItem value="Phone">Phone</MenuItem>
          <MenuItem value="Web">Web</MenuItem>
          <MenuItem value="Chat">Chat</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
