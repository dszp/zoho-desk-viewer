import { getDb } from '../connection';
import type { Comment } from '@zohodesk/shared';

export function getCommentsByTicketId(ticketId: string): Comment[] {
  const db = getDb();
  return db.prepare(`
    SELECT
      cm.*,
      a.firstName || ' ' || a.lastName as commentedByName
    FROM comments cm
    LEFT JOIN agents a ON cm.commentedBy = a.id
    WHERE cm.entityId = ?
    ORDER BY cm.commentedTime ASC, cm.id ASC
  `).all(ticketId) as Comment[];
}
