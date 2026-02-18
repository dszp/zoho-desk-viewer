import { Router } from 'express';
import { getTickets, getTicketById } from '../db/queries/tickets';
import type { TicketFilters } from '@zohodesk/shared';

export const ticketsRouter = Router();

ticketsRouter.get('/', (req, res) => {
  const filters: TicketFilters = {
    status: req.query.status as string,
    priority: req.query.priority as string,
    assigneeId: req.query.assigneeId as string,
    channel: req.query.channel as string,
    departmentId: req.query.departmentId as string,
    search: req.query.search as string,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as 'asc' | 'desc',
    page: Math.max(1, parseInt(req.query.page as string, 10) || 1),
    pageSize: Math.min(100, Math.max(1, parseInt(req.query.pageSize as string, 10) || 25)),
  };
  res.json(getTickets(filters));
});

ticketsRouter.get('/:id', (req, res) => {
  const ticket = getTicketById(req.params.id);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }
  res.json(ticket);
});
