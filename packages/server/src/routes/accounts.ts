import { Router } from 'express';
import { getAccounts, getAccountById, getContactsByAccountId, getTicketsByAccountId } from '../db/queries/accounts';

export const accountsRouter = Router();

accountsRouter.get('/', (req, res) => {
  const search = req.query.search as string;
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string, 10) || 25));
  res.json(getAccounts(search, page, pageSize));
});

accountsRouter.get('/:id', (req, res) => {
  const account = getAccountById(req.params.id);
  if (!account) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }
  res.json({
    ...account,
    contacts: getContactsByAccountId(req.params.id),
  });
});

accountsRouter.get('/:id/tickets', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string, 10) || 25));
  res.json(getTicketsByAccountId(req.params.id, page, pageSize));
});
