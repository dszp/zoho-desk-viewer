import { Router } from 'express';
import { getAgents, getAgentById } from '../db/queries/agents';

export const agentsRouter = Router();

agentsRouter.get('/', (_req, res) => {
  res.json(getAgents());
});

agentsRouter.get('/:id', (req, res) => {
  const agent = getAgentById(req.params.id);
  if (!agent) {
    res.status(404).json({ error: 'Agent not found' });
    return;
  }
  res.json(agent);
});
