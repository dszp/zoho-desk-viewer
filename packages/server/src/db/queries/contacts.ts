import { getDb } from '../connection';
import type { Contact, PaginatedResponse, Ticket } from '@zohodesk/shared';

export function getContacts(
  search?: string,
  page = 1,
  pageSize = 25
): PaginatedResponse<Contact> {
  const db = getDb();
  const offset = (page - 1) * pageSize;
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    conditions.push('(c.fullName LIKE ? OR c.email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { total } = db.prepare(
    `SELECT COUNT(*) as total FROM contacts c ${whereClause}`
  ).get(...params) as { total: number };

  const data = db.prepare(`
    SELECT c.*, acc.accountName as accountName
    FROM contacts c
    LEFT JOIN accounts acc ON c.accountId = acc.id
    ${whereClause}
    ORDER BY c.fullName ASC, c.id ASC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, offset) as Contact[];

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export function getContactById(id: string): Contact | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, acc.accountName as accountName
    FROM contacts c
    LEFT JOIN accounts acc ON c.accountId = acc.id
    WHERE c.id = ?
  `).get(id) as Contact | undefined;
}

export function getTicketsByContactId(
  contactId: string,
  page = 1,
  pageSize = 25
): PaginatedResponse<Ticket> {
  const db = getDb();
  const offset = (page - 1) * pageSize;

  const { total } = db.prepare(
    'SELECT COUNT(*) as total FROM tickets WHERE contactId = ?'
  ).get(contactId) as { total: number };

  const data = db.prepare(`
    SELECT t.*, a.firstName || ' ' || a.lastName as assigneeName
    FROM tickets t
    LEFT JOIN agents a ON t.assigneeId = a.id
    WHERE t.contactId = ?
    ORDER BY t.createdTime DESC, t.id ASC
    LIMIT ? OFFSET ?
  `).all(contactId, pageSize, offset) as Ticket[];

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
