import { Request, Response, Router } from 'express';
import { DeploymentService } from './service.js';

export function createDeploymentController(service: DeploymentService): Router {
  const router = Router();

  router.get('/deployments', async (req: Request, res: Response) => {
    try {
      const agentId = typeof req.query.agentId === 'string' ? req.query.agentId : undefined;
      const deployments = await service.list(agentId);
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  router.post('/deploy', async (req: Request, res: Response) => {
    try {
      const result = await service.deploy(req.body);
      res.status(202).json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  return router;
}
