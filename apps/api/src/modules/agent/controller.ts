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
    try {
      const agents = await service.list();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  router.get('/agents/:id', async (req: Request, res: Response) => {
    try {
      const agent = await service.getById(req.params.id);
      res.json(agent);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  });

  router.post('/agents/:id/preview', async (req: Request, res: Response) => {
    try {
      const result = await service.preview(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  return router;
}
