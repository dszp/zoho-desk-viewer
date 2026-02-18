import { getDb } from '../connection';
import type { Agent } from '@zohodesk/shared';

export function getAgents(): Agent[] {
  const db = getDb();
  return db.prepare(`
    SELECT id, firstName, lastName, email, status, role, profile,
           firstName || ' ' || lastName as fullName
    FROM agents
    ORDER BY firstName ASC
  `).all() as Agent[];
}

export function getAgentById(id: string): Agent | undefined {
  const db = getDb();
  return db.prepare(`
    SELECT id, firstName, lastName, email, status, role, profile,
           firstName || ' ' || lastName as fullName
    FROM agents WHERE id = ?
  `).get(id) as Agent | undefined;
}
