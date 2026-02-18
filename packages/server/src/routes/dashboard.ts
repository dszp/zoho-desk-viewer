import { Router } from 'express';
import { getDashboardStats } from '../db/queries/dashboard';

export const dashboardRouter = Router();

dashboardRouter.get('/', (req, res) => {
  const departmentId = req.query.departmentId as string;
  res.json(getDashboardStats(departmentId));
});
