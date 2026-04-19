import cors from 'cors';
import express from 'express';
import { createApiRouter } from './routes/index.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', createApiRouter());
  app.get('/health', (_req, res) => res.json({ ok: true }));
  return app;
}
