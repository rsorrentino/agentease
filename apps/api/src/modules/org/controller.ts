import { Request, Response, Router } from 'express';
import { OrgService } from './service.js';

export function createOrgController(service: OrgService): Router {
  const router = Router();

  router.get('/orgs', async (_req: Request, res: Response) => {
    const orgs = await service.list();
    res.json(orgs);
  });

  return router;
}
