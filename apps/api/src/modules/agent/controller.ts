import { Request, Response, Router } from 'express';
import { AgentService } from './service.js';

export function createAgentController(service: AgentService): Router {
  const router = Router();

  router.post('/agents', async (req: Request, res: Response) => {
    try {
      const created = await service.create(req.body);
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  router.get('/agents', async (_req: Request, res: Response) => {
    const agents = await service.list();
    res.json(agents);
  });

  return router;
}
