import { Router } from 'express';
import db from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const conn = process.env.DATABASE_URL || '';
    const masked = typeof conn === 'string' ? conn.replace(/:\/\/.+?:.+?@/, '://***:***@') : String(conn);
    const pid = process.pid;
    const { rows } = await db.query('SELECT count(*)::int AS cnt FROM building');
    const cnt = rows && rows[0] ? rows[0].cnt : null;
    res.json({ pid, masked, count: cnt });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
