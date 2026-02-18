import { getDb } from '../connection';
import type { Account, Contact, PaginatedResponse, Ticket } from '@zohodesk/shared';

export function getAccounts(
  search?: string,
  page = 1,
  pageSize = 25
): PaginatedResponse<Account> {
  const db = getDb();
  const offset = (page - 1) * pageSize;
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    conditions.push('a.accountName LIKE ?');
    params.push(`%${search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const { total } = db.prepare(
    `SELECT COUNT(*) as total FROM accounts a ${whereClause}`
  ).get(...params) as { total: number };

  const data = db.prepare(`
    SELECT * FROM accounts a
    ${whereClause}
    ORDER BY a.accountName ASC, a.id ASC
    LIMIT ? OFFSET ?
  `).all(...params, pageSize, offset) as Account[];

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export function getAccountById(id: string): Account | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM accounts WHERE id = ?').get(id) as Account | undefined;
}

export function getContactsByAccountId(accountId: string): Contact[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM contacts WHERE accountId = ? ORDER BY fullName ASC'
  ).all(accountId) as Contact[];
}

export function getTicketsByAccountId(
  accountId: string,
  page = 1,
  pageSize = 25
): PaginatedResponse<Ticket> {
  const db = getDb();
  const offset = (page - 1) * pageSize;

  const { total } = db.prepare(
    'SELECT COUNT(*) as total FROM tickets WHERE accountId = ?'
  ).get(accountId) as { total: number };

  const data = db.prepare(`
    SELECT t.*, a.firstName || ' ' || a.lastName as assigneeName
    FROM tickets t
    LEFT JOIN agents a ON t.assigneeId = a.id
    WHERE t.accountId = ?
    ORDER BY t.createdTime DESC, t.id ASC
    LIMIT ? OFFSET ?
  `).all(accountId, pageSize, offset) as Ticket[];

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}
