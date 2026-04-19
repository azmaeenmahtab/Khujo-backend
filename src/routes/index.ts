import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Khujo Demo Backend is up' });
});
router.get('/test2', (req: Request, res: Response) => {
  res.json({ message: 'Khujo Demo Backend is up 222' });
});



export default router;
