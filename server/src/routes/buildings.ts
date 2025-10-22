import { Router } from 'express';
import db from '../db';
const router = Router();

router.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT building_id AS id, building_name AS name FROM building ORDER BY building_name');
  res.json(rows);
});

export default router;