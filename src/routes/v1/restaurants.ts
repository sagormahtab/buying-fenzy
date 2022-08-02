import { list } from 'controllers/restaurants';
import { Router } from 'express';

const router = Router();
router.get('/', list);
export default router;
