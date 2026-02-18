import { Router } from 'express';
import { getDepartments } from '../db/queries/departments';

export const departmentsRouter = Router();

departmentsRouter.get('/', (_req, res) => {
  res.json(getDepartments());
});
