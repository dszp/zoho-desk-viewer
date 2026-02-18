import { getDb } from '../connection';
import type { DashboardStats } from '@zohodesk/shared';

export function getDashboardStats(departmentId?: string): DashboardStats {
  const db = getDb();
  const deptFilter = departmentId ? 'WHERE t.departmentId = ?' : '';
  const deptParams = departmentId ? [departmentId] : [];

  const totalRow = db.prepare(
    `SELECT COUNT(*) as total FROM tickets t ${deptFilter}`
  ).get(...deptParams) as { total: number };

  const openRow = db.prepare(
    `SELECT COUNT(*) as count FROM tickets t ${deptFilter ? deptFilter + ' AND' : 'WHERE'} t.status = 'Open'`
  ).get(...deptParams) as { count: number };

  const closedRow = db.prepare(
    `SELECT COUNT(*) as count FROM tickets t ${deptFilter ? deptFilter + ' AND' : 'WHERE'} t.status = 'Closed'`
  ).get(...deptParams) as { count: number };

  const byStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM tickets t ${deptFilter}
    GROUP BY status ORDER BY count DESC
  `).all(...deptParams) as { status: string; count: number }[];

  const byPriority = db.prepare(`
    SELECT COALESCE(priority, 'None') as priority, COUNT(*) as count FROM tickets t ${deptFilter}
    GROUP BY priority ORDER BY count DESC
  `).all(...deptParams) as { priority: string; count: number }[];

  const byChannel = db.prepare(`
    SELECT COALESCE(channel, 'Unknown') as channel, COUNT(*) as count FROM tickets t ${deptFilter}
    GROUP BY channel ORDER BY count DESC
  `).all(...deptParams) as { channel: string; count: number }[];

  const byAgent = db.prepare(`
    SELECT t.assigneeId as agentId,
           COALESCE(a.firstName || ' ' || a.lastName, 'Unassigned') as agentName,
           COUNT(*) as count
    FROM tickets t
    LEFT JOIN agents a ON t.assigneeId = a.id
    ${deptFilter}
    GROUP BY t.assigneeId
    ORDER BY count DESC
  `).all(...deptParams) as { agentId: string; agentName: string; count: number }[];

  const byDepartment = db.prepare(`
    SELECT t.departmentId,
           COALESCE(d.name, 'Unknown') as departmentName,
           COUNT(*) as count
    FROM tickets t
    LEFT JOIN departments d ON t.departmentId = d.id
    ${deptFilter}
    GROUP BY t.departmentId
    ORDER BY count DESC
  `).all(...deptParams) as { departmentId: string; departmentName: string; count: number }[];

  const byMonth = db.prepare(`
    SELECT substr(t.createdTime, 1, 7) as month, COUNT(*) as count
    FROM tickets t ${deptFilter}
    GROUP BY month ORDER BY month ASC
  `).all(...deptParams) as { month: string; count: number }[];

  return {
    totalTickets: totalRow.total,
    openTickets: openRow.count,
    closedTickets: closedRow.count,
    byStatus,
    byPriority,
    byChannel,
    byAgent,
    byDepartment,
    byMonth
  };
}
