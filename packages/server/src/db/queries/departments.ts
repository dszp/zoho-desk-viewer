import { getDb } from '../connection';
import type { Department } from '@zohodesk/shared';

export function getDepartments(): Department[] {
  const db = getDb();
  return db.prepare('SELECT * FROM departments ORDER BY name ASC').all() as Department[];
}

export function getDepartmentById(id: string): Department | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM departments WHERE id = ?').get(id) as Department | undefined;
}
