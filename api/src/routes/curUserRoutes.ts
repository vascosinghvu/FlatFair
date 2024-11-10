// Description: Contains backend endpoints for the manage group page (/group)

import express from 'express';
import { requiresAuth } from 'express-openid-connect';
import allController from '../controllers/allController';

const router = express.Router();

router.get('/', requiresAuth(), allController.getUser);

export default router;