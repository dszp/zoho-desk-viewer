import express from 'express';
import cors from 'cors';
import { ticketsRouter } from './routes/tickets';
import { threadsRouter } from './routes/threads';
import { commentsRouter } from './routes/comments';
import { contactsRouter } from './routes/contacts';
import { accountsRouter } from './routes/accounts';
import { agentsRouter } from './routes/agents';
import { departmentsRouter } from './routes/departments';
import { dashboardRouter } from './routes/dashboard';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/tickets', ticketsRouter);
app.use('/api/tickets', threadsRouter);
app.use('/api/tickets', commentsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/dashboard', dashboardRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
