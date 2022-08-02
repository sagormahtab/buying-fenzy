import { Router } from 'express';

import auth from './auth';
import users from './users';
import restaurants from './restaurants';

const router = Router();

router.use('/auth', auth);
router.use('/users', users);
router.use('/restaurants', restaurants);

export default router;
