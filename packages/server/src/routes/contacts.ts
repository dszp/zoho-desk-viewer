import { Router } from 'express';
import { getContacts, getContactById, getTicketsByContactId } from '../db/queries/contacts';

export const contactsRouter = Router();

contactsRouter.get('/', (req, res) => {
  const search = req.query.search as string;
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string, 10) || 25));
  res.json(getContacts(search, page, pageSize));
});

contactsRouter.get('/:id', (req, res) => {
  const contact = getContactById(req.params.id);
  if (!contact) {
    res.status(404).json({ error: 'Contact not found' });
    return;
  }
  res.json(contact);
});

contactsRouter.get('/:id/tickets', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string, 10) || 25));
  res.json(getTicketsByContactId(req.params.id, page, pageSize));
});
