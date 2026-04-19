import { Request, Response, Router } from 'express';
import { AuthService } from './service.js';

export function createAuthController(service: AuthService): Router {
  const router = Router();

  router.get('/auth/connect', async (req: Request, res: Response) => {
    const userId = String(req.query.userId ?? 'demo-user');
    const url = await service.buildConnectionUrl(userId);
    res.json({ url });
  });

  router.get('/auth/callback', async (req: Request, res: Response) => {
    try {
      const userId = String(req.query.userId ?? 'demo-user');
      const code = String(req.query.code ?? '');
      const state = String(req.query.state ?? '');
      await service.handleCallback(userId, code, state);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  return router;
}
