import { Router } from 'express';
import { getCommentsByTicketId } from '../db/queries/comments';

export const commentsRouter = Router();

commentsRouter.get('/:id/comments', (req, res) => {
  res.json(getCommentsByTicketId(req.params.id));
});
