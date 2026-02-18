import { getDb } from '../connection';
import type { TicketFilters, PaginatedResponse, Ticket } from '@zohodesk/shared';

export function getTickets(filters: TicketFilters): PaginatedResponse<Ticket> {
  const db = getDb();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.status) {
    conditions.push('t.status = ?');
    params.push(filters.status);
  }
  if (filters.priority) {
    conditions.push('t.priority = ?');
    params.push(filters.priority);
  }
  if (filters.assigneeId) {
    conditions.push('t.assigneeId = ?');
    params.push(filters.assigneeId);
  }
  if (filters.channel) {
    conditions.push('t.channel = ?');
    params.push(filters.channel);
  }
  if (filters.departmentId) {
    conditions.push('t.departmentId = ?');
    params.push(filters.departmentId);
  }
  if (filters.search) {
    conditions.push('t.subject LIKE ?');
    params.push(`%${filters.search}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sortBy = filters.sortBy || 'createdTime';
  const sortOrder = filters.sortOrder || 'desc';
  const allowedSorts = ['createdTime', 'modifiedTime', 'ticketNumber', 'subject', 'status', 'priority'];
  const safeSortBy = allowedSorts.includes(sortBy) ? `t.${sortBy}` : 't.createdTime';
  const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const countSql = `SELECT COUNT(*) as total FROM tickets t ${whereClause}`;
  const { total } = db.prepare(countSql).get(...params) as { total: number };

  const dataSql = `
    SELECT
      t.*,
      c.fullName as contactName,
      c.email as contactEmail,
      a.firstName || ' ' || a.lastName as assigneeName,
      d.name as departmentName,
      acc.accountName as accountName
    FROM tickets t
    LEFT JOIN contacts c ON t.contactId = c.id
    LEFT JOIN agents a ON t.assigneeId = a.id
    LEFT JOIN departments d ON t.departmentId = d.id
    LEFT JOIN accounts acc ON t.accountId = acc.id
    ${whereClause}
    ORDER BY ${safeSortBy} ${safeSortOrder}, t.id ASC
    LIMIT ? OFFSET ?
  `;

  const data = db.prepare(dataSql).all(...params, pageSize, offset) as Ticket[];

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

export function getTicketById(id: string): Ticket | undefined {
  const db = getDb();
  const sql = `
    SELECT
      t.*,
      c.fullName as contactName,
      c.email as contactEmail,
      a.firstName || ' ' || a.lastName as assigneeName,
      d.name as departmentName,
      acc.accountName as accountName
    FROM tickets t
    LEFT JOIN contacts c ON t.contactId = c.id
    LEFT JOIN agents a ON t.assigneeId = a.id
    LEFT JOIN departments d ON t.departmentId = d.id
    LEFT JOIN accounts acc ON t.accountId = acc.id
    WHERE t.id = ?
  `;
  return db.prepare(sql).get(id) as Ticket | undefined;
}
