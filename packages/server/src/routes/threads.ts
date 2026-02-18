import { Router } from 'express';
import { getThreadsByTicketId } from '../db/queries/threads';

export const threadsRouter = Router();

threadsRouter.get('/:id/threads', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string, 10) || 50));
  res.json(getThreadsByTicketId(req.params.id, page, pageSize));
});
