import { Router } from 'express';
import db from '../db';
const router = Router();

router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM entryexitlog ORDER BY timestamp DESC LIMIT 200');
  res.json(rows);
});

export default router;