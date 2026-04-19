
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { extractImeisFromImageBuffer } from '../services/visionService';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-gd-doc', upload.single('gdImage'), async (req: Request, res: Response) => {
  console.log('Received POST /api/upload-gd-doc');
  try {
    const file = req.file;
    const userImei = (req.body.imei ?? '').toString().trim();

    if (!file) return res.status(400).json({ error: 'gdImage file is required' });
    if (!userImei) return res.status(400).json({ error: 'imei field is required' });

    const extracted = await extractImeisFromImageBuffer(file.buffer);
    const matches = extracted.includes(userImei);

    res.json({
      userImei,
      extractedImeis: extracted,
      matched: matches
    });
  } catch (err) {
    console.error('ocr handler error:', err);
    res.status(500).json({ error: 'ocr_failed', details: (err as Error).message });
  }
});

router.get('/test', (req, res) => {
  console.log('Received GET /api/test');
  res.json({ message: 'ocr route is working' });
});

export default router;
