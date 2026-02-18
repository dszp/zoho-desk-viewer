import { Box, Typography, Divider } from '@mui/material';
import { StatusChip } from '../common/StatusChip';
import { PriorityChip } from '../common/PriorityChip';
import type { Ticket } from '@zohodesk/shared';

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2">{value || '-'}</Typography>
    </Box>
  );
}

export function TicketMetadataSidebar({ ticket }: { ticket: Ticket }) {
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block">Status</Typography>
        <StatusChip status={ticket.status} />
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block">Priority</Typography>
        <PriorityChip priority={ticket.priority} />
      </Box>
      <Divider sx={{ my: 2 }} />
      <Field label="Contact" value={ticket.contactName} />
      <Field label="Contact Email" value={ticket.contactEmail || ticket.email} />
      <Field label="Account" value={ticket.accountName} />
      <Field label="Agent" value={ticket.assigneeName} />
      <Field label="Department" value={ticket.departmentName} />
      <Field label="Channel" value={ticket.channel} />
      <Divider sx={{ my: 2 }} />
      <Field label="Created" value={ticket.createdTime ? new Date(ticket.createdTime).toLocaleString() : undefined} />
      <Field label="Modified" value={ticket.modifiedTime ? new Date(ticket.modifiedTime).toLocaleString() : undefined} />
      <Field label="Closed" value={ticket.closedTime ? new Date(ticket.closedTime).toLocaleString() : undefined} />
      <Field label="Due Date" value={ticket.dueDate ? new Date(ticket.dueDate).toLocaleString() : undefined} />
      <Divider sx={{ my: 2 }} />
      <Field label="SLA" value={ticket.slaName} />
      <Field label="SLA Violation" value={ticket.slaViolationType} />
      <Field label="Tags" value={ticket.tags} />
      <Field label="Ticket #" value={ticket.ticketNumber} />
    </Box>
  );
}
