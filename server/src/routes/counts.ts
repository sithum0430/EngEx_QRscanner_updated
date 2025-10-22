import { Router } from 'express';
import db from '../db';
const router = Router();

router.get('/', async (req, res) => {
  const q = `
    SELECT b.building_id AS id, b.building_name AS name,
      COALESCE(SUM(CASE WHEN e.action = 'entry' THEN 1 WHEN e.action = 'exit' THEN -1 ELSE 0 END),0) AS current_count
    FROM building b
    LEFT JOIN entryexitlog e ON e.building_id = b.building_id
    GROUP BY b.building_id, b.building_name
    ORDER BY b.building_name;
  `;
  const { rows } = await db.query(q);
  res.json(rows);
});

export default router;