import { getDb } from '../connection';
import type { PaginatedResponse, Thread } from '@zohodesk/shared';

export function getThreadsByTicketId(
  ticketId: string,
  page = 1,
  pageSize = 50
): PaginatedResponse<Thread> {
  const db = getDb();
  const offset = (page - 1) * pageSize;

  const { total } = db.prepare(
    'SELECT COUNT(*) as total FROM threads WHERE ticketId = ?'
  ).get(ticketId) as { total: number };

  const data = db.prepare(`
    SELECT * FROM threads
    WHERE ticketId = ?
    ORDER BY createdTime ASC, id ASC
    LIMIT ? OFFSET ?
  `).all(ticketId, pageSize, offset) as Thread[];

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}
