import { Request, Response, Router } from 'express';
import { OrgService } from './service.js';

export function createOrgController(service: OrgService): Router {
  const router = Router();

  router.get('/orgs', async (_req: Request, res: Response) => {
    try {
      const orgs = await service.list();
      res.json(orgs);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  router.post('/orgs', async (req: Request, res: Response) => {
    try {
      const org = await service.create(req.body);
      res.status(201).json(org);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  return router;
}
